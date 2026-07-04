import { Schema, model } from 'mongoose';
import { TReply } from './reply.interface';

const replySchema = new Schema<TReply>(
  {
    comment: {
      type: Schema.Types.ObjectId,
      ref: 'Comment',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },
    likesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

// efficient fetch of all replies for a comment, oldest first (conversation order)
replySchema.index({ comment: 1, createdAt: 1 });

export const Reply = model<TReply>('Reply', replySchema);
