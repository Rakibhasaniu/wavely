import { Schema, model } from 'mongoose';
import { TLike } from './like.interface';

const likeSchema = new Schema<TLike>(
  {
    targetType: {
      type: String,
      enum: ['post', 'comment', 'reply'],
      required: true,
    },
    targetId: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

likeSchema.index({ targetType: 1, targetId: 1, userId: 1 }, { unique: true });
likeSchema.index({ targetType: 1, targetId: 1, createdAt: -1 });
likeSchema.index({ targetType: 1, targetId: 1, _id: -1 }); // who-liked pagination

export const Like = model<TLike>('Like', likeSchema);
