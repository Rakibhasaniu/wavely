import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { deleteLikesForTarget, attachRecentLikers, getAllLikersSorted, toggleLike as toggleLikeRecord } from '../Like/like.service';
import { Post } from '../Post/post.model';
import { Reply } from '../Reply/reply.model';
import { Comment } from './comment.model';

const COMMENTS_PER_PAGE = 10;

const getComments = async (postId: string, userId: string, cursor?: string) => {
  const post = await Post.findById(postId).lean();

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }

  const query: Record<string, unknown> = {
    post: new Types.ObjectId(postId),
  };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const comments = await Comment.find(query)
    .sort({ _id: -1 })
    .limit(COMMENTS_PER_PAGE)
    .populate('author', 'firstName lastName avatar')
    .lean();

  const likeMap = await attachRecentLikers(
    'comment',
    comments.map((c) => ({ _id: c._id as Types.ObjectId })),
  );

  comments.forEach((c) => {
    (c as unknown as { likes: unknown[] }).likes = likeMap.get(c._id.toString()) ?? [];
  });

  const nextCursor =
    comments.length === COMMENTS_PER_PAGE
      ? comments[comments.length - 1]._id.toString()
      : null;

  return { comments, nextCursor };
};

const createComment = async (
  postId: string,
  userId: string,
  text: string,
) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (
    post.visibility === 'private' &&
    post.author.toString() !== userId
  ) {
    throw new AppError(httpStatus.FORBIDDEN, 'Post not accessible');
  }

  const comment = await Comment.create({
    post: new Types.ObjectId(postId),
    author: new Types.ObjectId(userId),
    text,
  });

  await Post.findByIdAndUpdate(postId, { $inc: { commentsCount: 1 } });

  const populated = await comment.populate('author', 'firstName lastName avatar');
  const plain = populated.toObject();
  (plain as unknown as { likes: unknown[] }).likes = [];
  return plain;
};

const deleteComment = async (commentId: string, userId: string) => {
  const comment = await Comment.findById(commentId);

  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }

  if (comment.author.toString() !== userId) {
    throw new AppError(
      httpStatus.FORBIDDEN,
      'You can only delete your own comments',
    );
  }

  const commentOid = comment._id as Types.ObjectId;

  const replies = await Reply.find({ comment: commentOid }).select('_id').lean();
  for (const r of replies) {
    await deleteLikesForTarget('reply', r._id as Types.ObjectId);
  }
  await Reply.deleteMany({ comment: commentOid });

  await deleteLikesForTarget('comment', commentOid);

  await Post.findByIdAndUpdate(comment.post, { $inc: { commentsCount: -1 } });
  await comment.deleteOne();
  return null;
};

const assertCommentPostAccessible = async (commentId: string, userId: string) => {
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

const toggleLike = async (commentId: string, userId: string) => {
  await assertCommentPostAccessible(commentId, userId);
  return toggleLikeRecord('comment', commentId, userId);
};

const getLikes = async (commentId: string, userId: string) => {
  await assertCommentPostAccessible(commentId, userId);
  const comment = await Comment.findById(commentId).lean();
  if (!comment) {
    throw new AppError(httpStatus.NOT_FOUND, 'Comment not found');
  }
  return getAllLikersSorted('comment', comment._id as Types.ObjectId);
};

export const CommentServices = {
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  getLikes,
};
