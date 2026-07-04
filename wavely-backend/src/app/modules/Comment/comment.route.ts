import express from 'express';
import auth from '../../middlewares/auth';
import { CommentControllers } from './comment.controller';

const router = express.Router({ mergeParams: true });

router.get('/', auth, CommentControllers.getComments);

router.post('/', auth, CommentControllers.createComment);

router.delete('/:id', auth, CommentControllers.deleteComment);

router.patch('/:id/like', auth, CommentControllers.toggleLike);

router.get('/:id/likes', auth, CommentControllers.getLikes);

export const CommentRoutes = router;
