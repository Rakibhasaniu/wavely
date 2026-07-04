import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { axiosPrivate } from '@/lib/axios';
import { IPost, IPostState, IUser } from '@/types';

const initialState: IPostState = {
  posts: [],
  nextCursor: null,
  hasMore: true,
  isLoading: false,
  isCreating: false,
  error: null,
};


export const fetchFeed = createAsyncThunk(
  'posts/fetchFeed',
  async (cursor: string | null, { rejectWithValue }) => {
    try {
      const url = cursor ? `/posts?cursor=${cursor}` : '/posts';
      const res = await axiosPrivate.get(url);
      return res.data.data as { posts: IPost[]; nextCursor: string | null };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to load feed');
    }
  },
);

export const createPost = createAsyncThunk(
  'posts/create',
  async (formData: FormData, { rejectWithValue }) => {
    try {
      const res = await axiosPrivate.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data as IPost;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to create post');
    }
  },
);

export const deletePost = createAsyncThunk(
  'posts/delete',
  async (postId: string, { rejectWithValue }) => {
    try {
      await axiosPrivate.delete(`/posts/${postId}`);
      return postId;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to delete post');
    }
  },
);

export const togglePostLike = createAsyncThunk(
  'posts/toggleLike',
  async (postId: string, { rejectWithValue }) => {
    try {
      const res = await axiosPrivate.patch(`/posts/${postId}/like`);
      return { postId, ...res.data.data } as {
        postId: string;
        liked: boolean;
        likesCount: number;
        likes: IUser[];
      };
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      return rejectWithValue(error.response?.data?.message || 'Failed to toggle like');
    }
  },
);



const postSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    resetFeed(state) {
      state.posts = [];
      state.nextCursor = null;
      state.hasMore = true;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // fetch feed
    builder
      .addCase(fetchFeed.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFeed.fulfilled, (state, action) => {
        state.isLoading = false;
        // deduplicate by _id to guard against StrictMode double-invoke
        const existingIds = new Set(state.posts.map((p) => p._id));
        const newPosts = action.payload.posts.filter((p) => !existingIds.has(p._id));
        state.posts = [...state.posts, ...newPosts];
        state.nextCursor = action.payload.nextCursor;
        state.hasMore = action.payload.nextCursor !== null;
      })
      .addCase(fetchFeed.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // create post — prepend to feed
    builder
      .addCase(createPost.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.isCreating = false;
        state.posts = [action.payload, ...state.posts];
      })
      .addCase(createPost.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      });

    // delete post
    builder.addCase(deletePost.fulfilled, (state, action) => {
      state.posts = state.posts.filter((p) => p._id !== action.payload);
    });

    // toggle like — optimistic update via fulfilled
    builder.addCase(togglePostLike.fulfilled, (state, action) => {
      const post = state.posts.find((p) => p._id === action.payload.postId);
      if (post) {
        post.likesCount = action.payload.likesCount;
        if (action.payload.likes) post.likes = action.payload.likes;
      }
    });

    // keep commentsCount in sync
  },
});

export const { resetFeed } = postSlice.actions;
export default postSlice.reducer;
