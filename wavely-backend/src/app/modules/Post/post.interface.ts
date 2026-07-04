import { Types } from 'mongoose';

export type TVisibility = 'public' | 'private';

export interface TPost {
  author: Types.ObjectId;
  text: string;
  image?: string;
  visibility: TVisibility;
  likesCount: number;
  commentsCount: number;
}
