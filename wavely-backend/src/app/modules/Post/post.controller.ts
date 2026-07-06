import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { PostServices } from './post.service';

const getFeed = catchAsync(async (req, res) => {
  const cursor = req.query.cursor as string | undefined;
  const result = await PostServices.getFeed(req.user.userId, cursor);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Feed retrieved successfully',
    data: result,
  });
});

const createPost = catchAsync(async (req, res) => {
  const result = await PostServices.createPost(
    req.user.userId,
    req.body,
    req.file,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Post created successfully',
    data: result,
  });
});

// POST /posts/upload-image — eager upload: image goes to Cloudinary while the
// user is still typing; createPost then receives only the returned URL (fast)
const uploadImage = catchAsync(async (req, res) => {
  const result = await PostServices.uploadImage(req.user.userId, req.file);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Image uploaded successfully',
    data: result,
  });
});

const updatePost = catchAsync(async (req, res) => {
  const result = await PostServices.updatePost(
    req.params.id,
    req.user.userId,
    req.body,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post updated successfully',
    data: result,
  });
});

const deletePost = catchAsync(async (req, res) => {
  await PostServices.deletePost(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Post deleted successfully',
    data: null,
  });
});

const toggleLike = catchAsync(async (req, res) => {
  const result = await PostServices.toggleLike(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? 'Post liked' : 'Post unliked',
    data: result,
  });
});

const getLikes = catchAsync(async (req, res) => {
  const result = await PostServices.getLikes(
    req.params.id,
    req.user.userId,
    req.query.cursor as string | undefined,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likes retrieved successfully',
    data: result,
  });
});

export const PostControllers = {
  getFeed,
  createPost,
  uploadImage,
  updatePost,
  deletePost,
  toggleLike,
  getLikes,
};
