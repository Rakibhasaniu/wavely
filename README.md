# Wavely

A social feed application built for the Appifylab Full Stack Engineer selection task. The provided Buddy Script HTML/CSS template was converted into a working full-stack app with authentication, posts, comments, replies and a like system.

**Live:** 
**Demo video:** 

## Stack

| Part | Tech |
|---|---|
| Frontend | Next.js (App Router, TypeScript), Redux Toolkit, Axios |
| Backend | Node.js, Express, TypeScript, Mongoose |
| Database | MongoDB Atlas |
| Images | Cloudinary |
| Auth | JWT access token + refresh token in httpOnly cookie |

Repo layout:

```
wavely/
├── wavely-backend/    # Express API
└── wavely-frontend/   # Next.js app
```

Each folder has its own README with setup steps.

## Features

- Register / login with first name, last name, email, password
- Feed is a protected route — newest posts first, infinite scroll
- Create posts with text + image, public or private
  - private posts are visible only to their author, enforced in the DB query itself
- Edit and delete your own posts
- Like/unlike on posts, comments and replies, with correct state after reload
- Comments and one level of nested replies
- "Liked by" list for any post, comment or reply (paginated)
- Images are compressed in the browser and uploaded to Cloudinary in the background while you're still typing, so hitting Post feels instant

## Design decisions

A few things worth explaining because they aren't obvious from the feature list.

**One Like collection for everything.** Likes for posts, comments and replies live in a single collection with a `targetType` field. A unique compound index on `(targetType, targetId, userId)` means the database itself refuses a duplicate like — no race condition can create two, even with concurrent requests. The toggle relies on this instead of a check-then-insert, which would leave a gap between the check and the insert.

**Denormalized counters.** `likesCount`, `commentsCount` and `repliesCount` are stored on the parent documents and updated with atomic `$inc`. Rendering a post with 200,000 likes reads one integer instead of counting 200,000 rows.

**Cursor pagination everywhere.** Feed, comments and liked-by lists paginate with an `_id` cursor and a hard page cap. Offset pagination gets slower the deeper you go because the DB reads and discards skipped rows; a cursor with a matching index jumps straight to the right place, so page 500 costs the same as page 1.

**`likedByMe` is computed on the server.** The feed shows a preview of recent likers per post, but that can't answer "did *I* like this" — your like may not be among the recent ones. The API resolves it with one batched `$in` query per page and sends a boolean per item. One extra query total, not one per post.

**Visibility lives in the query.** The feed query is `visibility: 'public' OR author: me`. Update/delete are scoped like `findOneAndUpdate({ _id, author: me })` — a post that isn't yours produces the same 404 as one that doesn't exist, so probing IDs reveals nothing. Comments and replies check the parent post's visibility before any read or write, so private posts can't be reached through their children either.

## Designed for scale — and actually tested

The task asks for a design that assumes millions of posts and reads. Every query pattern has a matching compound index written together with the schema, but claims are cheap, so I seeded the database and measured:

- ~100k posts, and a single post with **200,000 likes** from 200k seeded users
- Feed responses stay in the low milliseconds at any scroll depth — `explain()` shows an IXSCAN examining ~10 documents out of 100k
- The like counter on that post renders instantly because it's a stored integer

The load test also caught a real bug: the liked-by endpoint originally returned *all* likers in one response. With 5 likes in development nobody notices. At 200k it was an **18 MB response taking ~52 seconds**. It's now cursor-paginated at 20 per page with a supporting index and responds in a few milliseconds. That's exactly why load testing before shipping matters — the worst scaling problems are invisible in a dev database.

The practical ceiling for the test was the Atlas free tier (512 MB storage), not the query design.

## Security

- All input validated server-side with Zod, field-level error messages; accepted fields are whitelisted so extra JSON keys are ignored (no mass assignment)
- bcrypt (cost 12) for passwords; login failures return a generic "Invalid credentials" so emails can't be enumerated
- Access token as Bearer header, refresh token in an httpOnly cookie; axios refreshes on 401 and retries the original request
- API responses never contain emails or password hashes — authors expose only name and avatar
- Ownership checks on every mutating route; private posts return 404 to non-authors
- Uploads: server-side MIME whitelist and 5 MB cap, server-generated filenames, files live on Cloudinary, never on the app server or its domain
- Rate limiting: 20 req / 15 min on auth routes, 300/min elsewhere
- `helmet` security headers, `express-mongo-sanitize` against NoSQL operator injection
- Unexpected errors are logged with full context on the server; the client only sees "Something went wrong"

## Running locally

Node 18+, yarn, a MongoDB connection string and a Cloudinary account.

```bash
# backend
cd wavely-backend
yarn install
cp .env.example .env        # fill in your values
yarn start:dev              # http://localhost:5000

# frontend (second terminal)
cd wavely-frontend
yarn install
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1' > .env.local
yarn dev                    # http://localhost:3000
```

Register two accounts in two browsers to try the private-post and like flows properly.

## What I'd do next

Websocket updates for the feed, a cleanup job for images uploaded but never attached to a post, and infinite scroll on the liked-by modal instead of a Load more button. The static sidebars and stories strip from the template are intentionally visual-only, as the task allowed.
