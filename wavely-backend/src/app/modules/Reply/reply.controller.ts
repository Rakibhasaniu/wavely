import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { ReplyServices } from './reply.service';

const getReplies = catchAsync(async (req, res) => {
  const result = await ReplyServices.getReplies(
    req.params.commentId,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Replies retrieved successfully',
    data: result,
  });
});

const createReply = catchAsync(async (req, res) => {
  const result = await ReplyServices.createReply(
    req.params.commentId,
    req.user.userId,
    req.body.text,
  );

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Reply added successfully',
    data: result,
  });
});

const deleteReply = catchAsync(async (req, res) => {
  await ReplyServices.deleteReply(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Reply deleted successfully',
    data: null,
  });
});

const toggleLike = catchAsync(async (req, res) => {
  const result = await ReplyServices.toggleLike(
    req.params.id,
    req.user.userId,
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: result.liked ? 'Reply liked' : 'Reply unliked',
    data: result,
  });
});

const getLikes = catchAsync(async (req, res) => {
  const result = await ReplyServices.getLikes(req.params.id, req.user.userId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Likes retrieved successfully',
    data: result,
  });
});

export const ReplyControllers = {
  getReplies,
  createReply,
  deleteReply,
  toggleLike,
  getLikes,
};
