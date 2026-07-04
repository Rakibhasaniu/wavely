import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { CommentServices } from './comment.service';

const getComments = catchAsync(async (req, res) => {
  const cursor = req.query.cursor as string | undefined;
  const result = await CommentServices.getComments(
    req.params.postId,
    req.user.userId,
    cursor,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comments retrieved successfully',
    data: result,
  });
});

const createComment = catchAsync(async (req, res) => {
  const result = await CommentServices.createComment(
    req.params.postId,
    req.user.userId,
    req.body.text,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Comment added successfully',
    data: result,
  });
});

const deleteComment = catchAsync(async (req, res) => {
  await CommentServices.deleteComment(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Comment deleted successfully',
    data: null,
  });
});

const toggleLike = catchAsync(async (req, res) => {
  const result = await CommentServices.toggleLike(
    req.params.id,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? 'Comment liked' : 'Comment unliked',
    data: result,
  });
});

const getLikes = catchAsync(async (req, res) => {
  const result = await CommentServices.getLikes(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likes retrieved successfully',
    data: result,
  });
});

export const CommentControllers = {
  getComments,
  createComment,
  deleteComment,
  toggleLike,
  getLikes,
};
