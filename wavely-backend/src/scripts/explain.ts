/* eslint-disable no-console */
/**
 * Proves the feed query is served by an index (not a collection scan) at scale.
 *   yarn explain
 * Healthy output: stage IXSCAN, docsExamined ≈ nReturned, single-digit ms.
 */
import mongoose, { Query } from 'mongoose';
import config from '../app/config';
import { Comment } from '../app/modules/Comment/comment.model';
import { Like } from '../app/modules/Like/like.model';
import { Post } from '../app/modules/Post/post.model';
import { User } from '../app/modules/User/user.model';

// run one query's explain and print a one-block summary
async function report(label: string, total: number, q: Query<unknown[], unknown>) {
  const explain = (await q.explain('executionStats')) as Record<string, any>;
  const s = explain.executionStats;
  const stages: string[] = [];
  (function walk(st: Record<string, any>) {
    if (!st) return;
    stages.push(st.stage);
    if (st.inputStage) walk(st.inputStage);
    (st.inputStages ?? []).forEach(walk);
  })(s.executionStages);

  console.log(`\n=== ${label} ===`);
  console.log(`  collection total: ${total.toLocaleString()}`);
  console.log(`  time:             ${s.executionTimeMillis} ms`);
  console.log(`  returned:         ${s.nReturned}`);
  console.log(`  docs examined:    ${s.totalDocsExamined}`);
  console.log(`  plan:             ${stages.join(' <- ')}`);
  console.log(
    stages.includes('IXSCAN')
      ? `  ✔ IXSCAN — index used (examined ${s.totalDocsExamined} of ${total.toLocaleString()})`
      : '  x COLLSCAN — full scan!',
  );
}

async function main() {
  await mongoose.connect(config.database_url as string);
  const me = await User.findOne().select('_id').lean();

  // 1. feed: newest public posts + own private
  await report(
    'FEED  (10 newest, public + own private)',
    await Post.estimatedDocumentCount(),
    Post.find({ $or: [{ visibility: 'public' }, { author: me?._id, visibility: 'private' }] })
      .sort({ _id: -1 })
      .limit(10),
  );

  // 2. comments of the most-commented post
  const hotComment = await Comment.findOne().select('post').lean();
  await report(
    'COMMENTS  (one post, 10 newest)',
    await Comment.estimatedDocumentCount(),
    Comment.find({ post: hotComment?.post }).sort({ _id: -1 }).limit(10),
  );

  // 3. who-liked, one page (this is the endpoint that was 18MB before pagination)
  const hotLike = await Like.findOne({ targetType: 'post' }).select('targetId').lean();
  await report(
    'WHO-LIKED  (one post, 20 per page)',
    await Like.estimatedDocumentCount(),
    Like.find({ targetType: 'post', targetId: hotLike?.targetId }).sort({ _id: -1 }).limit(20),
  );

  await mongoose.disconnect();
}

main().catch((e) => {
  console.error('FATAL:', (e as Error).message);
  process.exit(1);
});
