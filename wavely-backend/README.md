# Wavely API

Express + TypeScript + Mongoose backend for Wavely. See the root README for the overall picture  this file covers running the API and the endpoint list.

## Setup

```bash
yarn install
cp .env.example .env
yarn start:dev        # ts-node-dev with reload, port 5000
```

`.env` values you need:

| Var | What |
|---|---|
| `DATABASE_URL` | MongoDB connection string |
| `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | generate with `openssl rand -hex 32` / `-hex 64` |
| `CLOUDINARY_CLOUD_NAME` / `_API_KEY` / `_API_SECRET` | from the Cloudinary dashboard |
| `CLIENT_URL` | allowed CORS origins, comma separated |
| `BCRYPT_SALT_ROUNDS` | 12 |

Production build: `yarn build && yarn start:prod`.

## Structure

Modular pattern — each domain owns its routes, controller, service, model and validation:

```
src/app/
├── modules/
│   ├── Auth/       # register, login, refresh, logout
│   ├── User/       # me, user by id
│   ├── Post/       # feed, create, update, delete, likes, image upload
│   ├── Comment/    # nested under posts
│   ├── Reply/      # nested under comments
│   └── Like/       # shared like service (one collection, targetType discriminator)
├── middlewares/    # auth (JWT), validateRequest (Zod), global error handler
├── errors/         # AppError + translators for Zod/Mongoose/cast/duplicate errors
└── utils/          # catchAsync, sendResponse, Cloudinary upload
```

Controllers stay thin; services own the business rules and never touch `res`. Anything thrown lands in the global error handler, which returns friendly messages for expected errors and a generic 500 for anything else.

## Endpoints

All under `/api/v1`. Everything except register/login/refresh needs `Authorization: Bearer <accessToken>`.

```
POST   /auth/register                 {firstName, lastName, email, password}
POST   /auth/login                    {email, password}
POST   /auth/refresh-token            (uses httpOnly cookie)
POST   /auth/logout

GET    /users/me
GET    /users/:id

GET    /posts?cursor=                 feed: public + own private, 10/page
POST   /posts                         {text, visibility, imageUrl?}
POST   /posts/upload-image            multipart "image" → {url}
PATCH  /posts/:id                     author only
DELETE /posts/:id                     author only, cascades comments/replies/likes
PATCH  /posts/:id/like                toggle
GET    /posts/:id/likes?cursor=       who liked, 20/page

GET    /posts/:postId/comments?cursor=
POST   /posts/:postId/comments        {text}
DELETE /comments/:id
PATCH  /comments/:id/like
GET    /comments/:id/likes?cursor=

GET    /comments/:commentId/replies
POST   /comments/:commentId/replies   {text}
DELETE /replies/:id
PATCH  /replies/:id/like
GET    /replies/:id/likes?cursor=
```

## Indexes

Declared in the schemas, matching every query pattern:

```
posts:    (visibility, createdAt)  (author, createdAt)
comments: (post, createdAt)
replies:  (comment, createdAt)
likes:    (targetType, targetId, userId) UNIQUE   ← one like per user, race-proof
          (targetType, targetId, createdAt)
          (targetType, targetId, _id)              ← who-liked pagination
users:    email UNIQUE
```
