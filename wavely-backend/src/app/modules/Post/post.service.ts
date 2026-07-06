import httpStatus from 'http-status';
import { Types } from 'mongoose';
import AppError from '../../errors/AppError';
import { sendImageToCloudinary } from '../../utils/sendImageToCloudinary';
import { Comment } from '../Comment/comment.model';
import { Reply } from '../Reply/reply.model';
import {
  attachRecentLikers,
  deleteLikesForTarget,
  getLikersPage,
  toggleLike as toggleLikeRecord,
} from '../Like/like.service';
import { Like } from '../Like/like.model';
import { Post } from './post.model';

const POSTS_PER_PAGE = 10;

const getFeed = async (userId: string, cursor?: string) => {
  const query: Record<string, unknown> = {
    $or: [
      { visibility: 'public' },
      { author: new Types.ObjectId(userId), visibility: 'private' },
    ],
  };

  if (cursor) {
    query._id = { $lt: new Types.ObjectId(cursor) };
  }

  const posts = await Post.find(query)
    .sort({ _id: -1 })
    .limit(POSTS_PER_PAGE)
    .populate('author', 'firstName lastName avatar')
    .lean();

  const likeMap = await attachRecentLikers(
    'post',
    posts.map((p) => ({ _id: p._id as Types.ObjectId })),
  );

  posts.forEach((p) => {
    (p as unknown as { likes: unknown[] }).likes = likeMap.get(p._id.toString()) ?? [];
  });

  // likedByMe: one batched $in query for the whole page — the likes preview
  // above holds only the 3 most recent likers, so it cannot answer
  // "did I like this?" reliably
  if (posts.length > 0) {
    const myLikes = await Like.find({
      targetType: 'post',
      targetId: { $in: posts.map((p) => p._id) },
      userId: new Types.ObjectId(userId),
    })
      .select('targetId')
      .lean();
    const likedSet = new Set(myLikes.map((l) => l.targetId.toString()));
    posts.forEach((p) => {
      (p as unknown as { likedByMe: boolean }).likedByMe = likedSet.has(p._id.toString());
    });
  }


  if (posts.length > 0) {
    const postIds = posts.map((p) => p._id);
    const counts = await Comment.aggregate([
      { $match: { post: { $in: postIds } } },
      { $group: { _id: '$post', count: { $sum: 1 } } },
    ]);
    const countMap = new Map(counts.map((c) => [c._id.toString(), c.count]));
    posts.forEach((p) => {
      p.commentsCount = countMap.get(p._id.toString()) ?? 0;
    });
  }

  const nextCursor =
    posts.length === POSTS_PER_PAGE
      ? posts[posts.length - 1]._id.toString()
      : null;

  return { posts, nextCursor };
};

const createPost = async (
  userId: string,
  payload: { text: string; visibility: 'public' | 'private' },
  file?: Express.Multer.File,
) => {
  let imageUrl = '';

  if (file) {
    const imageName = `post_${userId}_${Date.now()}`;
    const { secure_url } = (await sendImageToCloudinary(
      imageName,
      file.path,
    )) as { secure_url: string };
    imageUrl = secure_url;
  }

  const post = await Post.create({
    author: new Types.ObjectId(userId),
    text: payload.text,
    visibility: payload.visibility || 'public',
    image: imageUrl,
  });

  const populated = await post.populate('author', 'firstName lastName avatar');
  const plain = populated.toObject();
  (plain as unknown as { likes: unknown[] }).likes = [];
  return plain;
};

// DELETE /posts/:id — only author can delete; cascade comments, replies, likes
const deletePost = async (postId: string, userId: string) => {
  const post = await Post.findById(postId);

  if (!post) {
    throw new AppError(httpStatus.NOT_FOUND, 'Post not found');
  }

  if (post.author.toString() !== userId) {
    throw new AppError(httpStatus.FORBIDDEN, 'You can only delete your own posts');
  }

  const postOid = post._id as Types.ObjectId;

  await deleteLikesForTarget('post', postOid);

  const comments = await Comment.find({ post: postOid }).select('_id').lean();
  const commentIds = comments.map((c) => c._id as Types.ObjectId);

  if (commentIds.length > 0) {
    const replies = await Reply.find({ comment: { $in: commentIds } }).select('_id').lean();
    for (const r of replies) {
      await deleteLikesForTarget('reply', r._id as Types.ObjectId);
    }
    await Reply.deleteMany({ comment: { $in: commentIds } });
    for (const cid of commentIds) {
      await deleteLikesForTarget('comment', cid);
    }
    await Comment.deleteMany({ post: postOid });
  }

  await post.deleteOne();
  return null;
};

const toggleLike = async (postId: string, userId: string) => {
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

  return toggleLikeRecord('post', postId, userId);
};

const getLikes = async (postId: string, userId: string, cursor?: string) => {
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

  return getLikersPage('post', post._id as Types.ObjectId, cursor);
};

export const PostServices = {
  getFeed,
  createPost,
  deletePost,
  toggleLike,
  getLikes,
};
