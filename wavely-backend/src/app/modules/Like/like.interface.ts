import { Types } from 'mongoose';

export type TLikeTargetType = 'post' | 'comment' | 'reply';

export interface TLike {
  targetType: TLikeTargetType;
  targetId: Types.ObjectId;
  userId: Types.ObjectId;
}
