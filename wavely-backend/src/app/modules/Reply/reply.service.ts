import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import {
  attachRecentLikers,
  deleteLikesForTarget,
  getAllLikersSorted,
  toggleLike as toggleLikeRecord,
} from '../Like/like.service';
import { Comment } from '../Comment/comment.model';
import { Post } from '../Post/post.model';
import { Reply } from './reply.model';

const assertReplyThreadAccessible = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId).lean();
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  const post = await Post.findById(comment.post).lean();
  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }
  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }
  return comment;
};

const assertReplyAccessibleByReplyId = async (replyId: string, userId: string) => {
  const reply = await Reply.findById(replyId).lean();
  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }
  await assertReplyThreadAccessible(reply.comment.toString(), userId);
  return reply;
};

// GET /comments/:commentId/replies
const getReplies = async (commentId: string, userId: string) => {
  await assertReplyThreadAccessible(commentId, userId);

  const replies = await Reply.find({
    comment: new Types.ObjectId(commentId),
  })
    .sort({ createdAt: 1 })
    .populate('author', 'firstName lastName avatar')
    .lean();

  const likeMap = await attachRecentLikers(
    'reply',
    replies.map((r) => ({ _id: r._id as Types.ObjectId })),
  );

  replies.forEach((r) => {
    (r as unknown as { likes: unknown[] }).likes = likeMap.get(r._id.toString()) ?? [];
  });

  return replies;
};

// POST /comments/:commentId/replies
const createReply = async (
  commentId: string,
  userId: string,
  text: string,
) => {
  await assertReplyThreadAccessible(commentId, userId);

  const reply = await Reply.create({
    comment: new Types.ObjectId(commentId),
    author: new Types.ObjectId(userId),
    text,
  });

  await Comment.findByIdAndUpdate(commentId, {
    $inc: { repliesCount: 1 },
  });

  const populated = await reply.populate('author', 'firstName lastName avatar');
  const plain = populated.toObject();
  (plain as unknown as { likes: unknown[] }).likes = [];
  return plain;
};

// DELETE /replies/:id
const deleteReply = async (replyId: string, userId: string) => {
  const reply = await Reply.findById(replyId);

  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }

  if (reply.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own replies',
    );
  }

  await deleteLikesForTarget('reply', reply._id as Types.ObjectId);

  await Comment.findByIdAndUpdate(reply.comment, {
    $inc: { repliesCount: -1 },
  });

  await reply.deleteOne();
  return null;
};

// PATCH /replies/:id/like
const toggleLike = async (replyId: string, userId: string) => {
  await assertReplyAccessibleByReplyId(replyId, userId);
  return toggleLikeRecord('reply', replyId, userId);
};

// GET /replies/:id/likes
const getLikes = async (replyId: string, userId: string) => {
  await assertReplyAccessibleByReplyId(replyId, userId);
  const reply = await Reply.findById(replyId).lean();
  if (!reply) {
    throw new AppError(httpStatus.NOT_FOUND, 'Reply not found');
  }
  return getAllLikersSorted('reply', reply._id as Types.ObjectId);
};

export const ReplyServices = {
  getReplies,
  createReply,
  deleteReply,
  toggleLike,
  getLikes,
};
