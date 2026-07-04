import express from 'express';
import auth from '../../middlewares/auth';
import { UserControllers } from './user.controller';

const router = express.Router();

router.get('/me', auth, UserControllers.getMe);

router.get('/:id', auth, UserControllers.getUserById);

export const UserRoutes = router;
