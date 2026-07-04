import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import { User } from './user.model';

const getMe = async (userId: string) => {
  const user = await User.findById(userId).select('-password -__v');

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

const getUserById = async (userId: string) => {
  const user = await User.findById(userId).select(
    'firstName lastName avatar createdAt',
  );

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.NOT_FOUND, 'User not found');
  }

  return user;
};

export const UserServices = {
  getMe,
  getUserById,
};
