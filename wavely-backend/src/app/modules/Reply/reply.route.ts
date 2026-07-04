import express from 'express';
import auth from '../../middlewares/auth';
import { ReplyControllers } from './reply.controller';

const router = express.Router({ mergeParams: true });

// nested under comments: GET /comments/:commentId/replies
router.get('/', auth, ReplyControllers.getReplies);

// nested under comments: POST /comments/:commentId/replies
router.post('/', auth, ReplyControllers.createReply);

// standalone: DELETE /replies/:id
router.delete('/:id', auth, ReplyControllers.deleteReply);

// standalone: PATCH /replies/:id/like
router.patch('/:id/like', auth, ReplyControllers.toggleLike);

// standalone: GET /replies/:id/likes
router.get('/:id/likes', auth, ReplyControllers.getLikes);

export const ReplyRoutes = router;
