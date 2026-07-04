import { NextFunction, Request, Response } from 'express'; // 
import httpStatus from 'http-status';
import { JwtPayload } from 'jsonwebtoken';
import config from '../config';
import AppError from '../errors/AppError';
import { User } from '../modules/User/user.model';
import catchAsync from '../utils/catchAsync';
import { verifyToken } from '../modules/Auth/auth.utils';

const auth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized');
  }

  const decoded = verifyToken(token, config.jwt_access_secret as string) as JwtPayload;

  const user = await User.findById(decoded.userId);

  if (!user || user.isDeleted) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'User not found');
  }

  if (user.status === 'blocked') {
    throw new AppError(httpStatus.FORBIDDEN, 'Your account has been blocked');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(
      user.passwordChangedAt,
      decoded.iat as number,
    )
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'Session expired, please login again');
  }

  req.user = decoded as JwtPayload & { role: string };
  next();
});

export default auth;
