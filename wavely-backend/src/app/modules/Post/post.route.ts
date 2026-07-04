import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { upload } from '../../utils/sendImageToCloudinary';
import { PostControllers } from './post.controller';
import { PostValidation } from './post.validation';

const router = express.Router();

router.get('/', auth, PostControllers.getFeed);

router.post(
  '/',
  auth,
  upload.single('image'),
  (req: Request, _res: Response, next: NextFunction) => {
    if (req.body.data) {
      req.body = JSON.parse(req.body.data);
    }
    next();
  },
  validateRequest(PostValidation.createPostValidationSchema),
  PostControllers.createPost,
);

router.delete('/:id', auth, PostControllers.deletePost);

router.patch('/:id/like', auth, PostControllers.toggleLike);

router.get('/:id/likes', auth, PostControllers.getLikes);

export const PostRoutes = router;
