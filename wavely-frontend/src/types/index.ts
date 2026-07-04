// ─── User ────────────────────────────────────────────────────────────────────

export interface IUser {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  createdAt?: string;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface IAuthState {
  user: IUser | null;
  accessToken: string | null;
  isLoading: boolean;
  error: string | null;
}

// ─── Post ────────────────────────────────────────────────────────────────────

export type TVisibility = 'public' | 'private';

export interface IPost {
  _id: string;
  author: IUser;
  text: string;
  image?: string;
  visibility: TVisibility;
  likes: IUser[];
  likesCount: number;
  commentsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface IPostState {
  posts: IPost[];
  nextCursor: string | null;
  hasMore: boolean;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;
}

// ─── Comment ─────────────────────────────────────────────────────────────────

export interface IComment {
  _id: string;
  post: string;
  author: IUser;
  text: string;
  likes: IUser[];
  likesCount: number;
  repliesCount: number;
  createdAt: string;
}

export interface ICommentState {
  // keyed by postId
  byPostId: Record<string, {
    comments: IComment[];
    nextCursor: string | null;
    isLoading: boolean;
  }>;
}

// ─── Reply ───────────────────────────────────────────────────────────────────

export interface IReply {
  _id: string;
  comment: string;
  author: IUser;
  text: string;
  likes: IUser[];
  likesCount: number;
  createdAt: string;
}

export interface IReplyState {
  // keyed by commentId
  byCommentId: Record<string, {
    replies: IReply[];
    isLoading: boolean;
  }>;
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
