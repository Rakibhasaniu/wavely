/* eslint-disable no-console */
/**
 * Seed the database with realistic volume so the scale claims in the README can
 * be reproduced. Safe to run against a throwaway/dev database.
 *
 *   yarn seed                          # defaults below
 *   USERS=2000 POSTS=100000 yarn seed  # override any count
 *   HOT_POST_LIKES=200000 yarn seed    # pile likes onto one "viral" post
 *   WIPE=1 yarn seed                   # clear posts/comments/likes first
 *
 * Notes
 *  - Likes have a unique (targetType,targetId,userId) index, so a post can have
 *    at most one like per user. A post with 200k likes therefore needs 200k users.
 *  - MongoDB Atlas free tier caps at 512MB; keep totals modest there.
 */
import mongoose, { Types } from 'mongoose';
import config from '../app/config';
import { Comment } from '../app/modules/Comment/comment.model';
import { Like } from '../app/modules/Like/like.model';
import { Post } from '../app/modules/Post/post.model';
import { User } from '../app/modules/User/user.model';

const USERS = Number(process.env.USERS ?? 2000);
const POSTS = Number(process.env.POSTS ?? 20000);
const COMMENTS = Number(process.env.COMMENTS ?? 20000);
const HOT_POST_LIKES = Number(process.env.HOT_POST_LIKES ?? 2000);
const BATCH = 5000;
// bcrypt hash of "secret123" (cost 12) — so seeded users can actually log in
const PASS_HASH = '$2b$12$dU1/u2Td5a.ufTXelwY/3.MMrDw3K25z7n2jUrKYRllKThn5ehbJm';

const pick = <T>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const daysAgo = (d: number) => new Date(Date.now() - d * 864e5);
const TEXTS = [
  'Just shipped a new feature 🚀',
  'Anyone else loving this weather?',
  'Working on something exciting, stay tuned.',
  'Coffee first, code later.',
  'Weekend plans: hiking and photography.',
  'Big milestone reached today. Grateful for the team.',
];

async function main() {
  const t0 = Date.now();
  await mongoose.connect(config.database_url as string);
  console.log('Connected. Seeding:', { USERS, POSTS, COMMENTS, HOT_POST_LIKES });

  if (process.env.WIPE === '1') {
    console.log('WIPE=1 → clearing posts/comments/likes (users kept)...');
    await Promise.all([Post.deleteMany({}), Comment.deleteMany({}), Like.deleteMany({})]);
  }

  // 1. users
  console.log(`Users: ensuring ${USERS}...`);
  for (let i = 0; i < USERS; i += BATCH) {
    const n = Math.min(BATCH, USERS - i);
    const docs = Array.from({ length: n }, (_, k) => ({
      firstName: `User${i + k}`,
      lastName: 'Seed',
      email: `seed${i + k}@example.test`,
      password: PASS_HASH,
    }));
    await User.insertMany(docs, { ordered: false }).catch(() => undefined);
  }
  const userIds = (await User.find({ email: /@example\.test$/ }).select('_id').lean()).map(
    (u) => u._id as Types.ObjectId,
  );
  console.log(`Users ready: ${userIds.length}`);

  // 2. posts (10% private)
  console.log(`Posts: inserting ${POSTS}...`);
  const postIds: Types.ObjectId[] = [];
  for (let done = 0; done < POSTS; done += BATCH) {
    const n = Math.min(BATCH, POSTS - done);
    const docs = Array.from({ length: n }, () => ({
      author: pick(userIds),
      text: pick(TEXTS),
      visibility: Math.random() < 0.9 ? 'public' : 'private',
      createdAt: daysAgo(Math.random() * 365),
    }));
    const res = await Post.insertMany(docs, { ordered: false });
    postIds.push(...res.map((p) => p._id as Types.ObjectId));
    process.stdout.write(`\r  posts: ${done + n}/${POSTS}`);
  }
  console.log();

  // 3. comments
  console.log(`Comments: inserting ${COMMENTS}...`);
  for (let done = 0; done < COMMENTS; done += BATCH) {
    const n = Math.min(BATCH, COMMENTS - done);
    const docs = Array.from({ length: n }, () => ({
      post: pick(postIds),
      author: pick(userIds),
      text: pick(TEXTS),
    }));
    await Comment.insertMany(docs, { ordered: false });
    process.stdout.write(`\r  comments: ${done + n}/${COMMENTS}`);
  }
  console.log();

  // 4. one hot post with many likes (capped by user count)
  const hotPost = postIds[0];
  const likeTarget = Math.min(HOT_POST_LIKES, userIds.length);
  console.log(`Hot post ${hotPost}: inserting ${likeTarget} likes...`);
  for (let i = 0; i < likeTarget; i += BATCH) {
    const n = Math.min(BATCH, likeTarget - i);
    const docs = Array.from({ length: n }, (_, k) => ({
      targetType: 'post' as const,
      targetId: hotPost,
      userId: userIds[i + k], // distinct user each → satisfies unique index
    }));
    await Like.insertMany(docs, { ordered: false }).catch(() => undefined);
  }
  await Post.findByIdAndUpdate(hotPost, { likesCount: likeTarget });

  console.log(`\nDone in ${((Date.now() - t0) / 1000).toFixed(1)}s.`);
  console.log(`Seeded users can log in with:  seed0@example.test / secret123`);
  console.log(`Hot post id (200k-likes demo): ${hotPost}`);
  console.log('Run  yarn explain  to see the feed query use an index at this scale.');
  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('FATAL:', (e as Error).message);
  process.exit(1);
});
