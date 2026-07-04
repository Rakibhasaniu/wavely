import { Router } from 'express';

const router = Router();

// Modules plug in here step by step:
// Step 2 → /auth, /users · Step 3 → /posts · Step 4 → /comments, /replies
const moduleRoutes: { path: string; route: Router }[] = [];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
