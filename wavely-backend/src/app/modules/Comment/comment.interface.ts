import { Types } from 'mongoose';

export interface TComment {
  post: Types.ObjectId;
  author: Types.ObjectId;
  text: string;
  likesCount: number;
  repliesCount: number;
}
