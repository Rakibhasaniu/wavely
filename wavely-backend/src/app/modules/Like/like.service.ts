import { Types } from 'mongoose';
import { Comment } from '../Comment/comment.model';
import { Post } from '../Post/post.model';
import { Reply } from '../Reply/reply.model';
import { User } from '../User/user.model';
import { TLikeTargetType } from './like.interface';
import { Like } from './like.model';

export type LikerUser = {
  _id: Types.ObjectId;
  firstName: string;
  lastName: string;
  avatar?: string;
};

const PREVIEW_LIMIT = 3;

async function readParentLikesCount(
  targetType: TLikeTargetType,
  targetObjectId: Types.ObjectId,
): Promise<number> {
  if (targetType === 'post') {
    const p = await Post.findById(targetObjectId).select('likesCount').lean();
    return Math.max(0, p?.likesCount ?? 0);
  }
  if (targetType === 'comment') {
    const c = await Comment.findById(targetObjectId).select('likesCount').lean();
    return Math.max(0, c?.likesCount ?? 0);
  }
  const r = await Reply.findById(targetObjectId).select('likesCount').lean();
  return Math.max(0, r?.likesCount ?? 0);
}

async function applyLikesCountDelta(
  targetType: TLikeTargetType,
  targetObjectId: Types.ObjectId,
  delta: number,
): Promise<number> {
  let updated: { likesCount?: number } | null = null;

  if (targetType === 'post') {
    updated = await Post.findByIdAndUpdate(
      targetObjectId,
      { $inc: { likesCount: delta } },
      { new: true },
    )
      .select('likesCount')
      .lean();
  } else if (targetType === 'comment') {
    updated = await Comment.findByIdAndUpdate(
      targetObjectId,
      { $inc: { likesCount: delta } },
      { new: true },
    )
      .select('likesCount')
      .lean();
  } else {
    updated = await Reply.findByIdAndUpdate(
      targetObjectId,
      { $inc: { likesCount: delta } },
      { new: true },
    )
      .select('likesCount')
      .lean();
  }

  const raw = updated?.likesCount ?? 0;
  if (raw < 0 && targetType === 'post') {
    await Post.findByIdAndUpdate(targetObjectId, { likesCount: 0 });
    return 0;
  }
  if (raw < 0 && targetType === 'comment') {
    await Comment.findByIdAndUpdate(targetObjectId, { likesCount: 0 });
    return 0;
  }
  if (raw < 0 && targetType === 'reply') {
    await Reply.findByIdAndUpdate(targetObjectId, { likesCount: 0 });
    return 0;
  }

  return Math.max(0, raw);
}

export async function getRecentLikers(
  targetType: TLikeTargetType,
  targetObjectId: Types.ObjectId,
  limit = PREVIEW_LIMIT,
): Promise<LikerUser[]> {
  const docs = await Like.find({ targetType, targetId: targetObjectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate<{ userId: LikerUser }>('userId', 'firstName lastName avatar')
    .lean();

  return docs.map((d) => d.userId).filter(Boolean) as LikerUser[];
}

export async function getAllLikersSorted(
  targetType: TLikeTargetType,
  targetObjectId: Types.ObjectId,
): Promise<LikerUser[]> {
  const docs = await Like.find({ targetType, targetId: targetObjectId })
    .sort({ createdAt: -1 })
    .populate<{ userId: LikerUser }>('userId', 'firstName lastName avatar')
    .lean();

  return docs.map((d) => d.userId).filter(Boolean) as LikerUser[];
}

/** Batch-attach up to `limit` recent likers per target (for feed / lists). */
export async function attachRecentLikers(
  targetType: TLikeTargetType,
  targets: { _id: Types.ObjectId }[],
  limit = PREVIEW_LIMIT,
): Promise<Map<string, LikerUser[]>> {
  const result = new Map<string, LikerUser[]>();
  if (targets.length === 0) return result;

  const ids = targets.map((t) => t._id);

  const grouped = await Like.aggregate<{
    _id: Types.ObjectId;
    userIds: Types.ObjectId[];
  }>([
    { $match: { targetType, targetId: { $in: ids } } },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$targetId',
        userIds: { $push: '$userId' },
      },
    },
    {
      $project: {
        _id: 1,
        userIds: { $slice: ['$userIds', limit] },
      },
    },
  ]);

  const allUserIds = [...new Set(grouped.flatMap((g) => g.userIds.map((id) => id.toString())))].map(
    (s) => new Types.ObjectId(s),
  );

  if (allUserIds.length === 0) {
    ids.forEach((id) => result.set(id.toString(), []));
    return result;
  }

  const users = await User.find({ _id: { $in: allUserIds } })
    .select('firstName lastName avatar')
    .lean();

  const userMap = new Map(users.map((u) => [u._id.toString(), u as LikerUser]));

  for (const g of grouped) {
    const likers = g.userIds
      .map((uid) => userMap.get(uid.toString()))
      .filter((u): u is LikerUser => Boolean(u));
    result.set(g._id.toString(), likers);
  }

  ids.forEach((id) => {
    if (!result.has(id.toString())) result.set(id.toString(), []);
  });

  return result;
}

export type ToggleLikeResult = {
  liked: boolean;
  likesCount: number;
  likes: LikerUser[];
};

export async function toggleLike(
  targetType: TLikeTargetType,
  targetId: string,
  userId: string,
): Promise<ToggleLikeResult> {
  const tid = new Types.ObjectId(targetId);
  const uid = new Types.ObjectId(userId);

  const removed = await Like.findOneAndDelete({ targetType, targetId: tid, userId: uid });

  if (removed) {
    const likesCount = await applyLikesCountDelta(targetType, tid, -1);
    const likes = await getRecentLikers(targetType, tid);
    return { liked: false, likesCount, likes };
  }

  try {
    await Like.create({ targetType, targetId: tid, userId: uid });
    const likesCount = await applyLikesCountDelta(targetType, tid, 1);
    const likes = await getRecentLikers(targetType, tid);
    return { liked: true, likesCount, likes };
  } catch (err: unknown) {
    const code = (err as { code?: number })?.code;
    if (code === 11000) {
      const likesCount = await readParentLikesCount(targetType, tid);
      const likes = await getRecentLikers(targetType, tid);
      return { liked: true, likesCount, likes };
    }
    throw err;
  }
}

export async function deleteLikesForTarget(
  targetType: TLikeTargetType,
  targetObjectId: Types.ObjectId,
): Promise<void> {
  await Like.deleteMany({ targetType, targetId: targetObjectId });
}
