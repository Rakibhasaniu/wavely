import { Router } from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { CommentRoutes } from '../modules/Comment/comment.route';
import { PostRoutes } from '../modules/Post/post.route';
import { ReplyRoutes } from '../modules/Reply/reply.route';
import { UserRoutes } from '../modules/User/user.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: AuthRoutes },
  { path: '/users', route: UserRoutes },
  { path: '/posts', route: PostRoutes },
  { path: '/comments', route: CommentRoutes },
  { path: '/replies', route: ReplyRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

// nested routes
router.use('/posts/:postId/comments', CommentRoutes);
router.use('/comments/:commentId/replies', ReplyRoutes);

export default router;
