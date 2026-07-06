# Wavely frontend

Next.js (App Router, TypeScript) client for Wavely. The UI comes from the provided template  its CSS and assets are used unmodified under `public/assets`, converted from static HTML to React components. See the root README for the overall picture.

## Setup

```bash
yarn install
echo 'NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1' > .env.local
yarn dev        # http://localhost:3000
```

The backend has to be running (see `../wavely-backend`).

## Structure

```
src/
├── app/
│   ├── (auth)/login, (auth)/register     # public pages
│   └── (main)/feed                       # protected
├── components/
│   ├── auth/       LoginForm, RegisterForm
│   ├── feed/       FeedClient, CreatePost, PostCard, CommentSection,
│   │               ReplySection, LikesModal
│   └── shared/     Navbar, Avatar, Spinner
├── store/          Redux Toolkit — auth, posts, comments, replies slices
├── lib/axios.ts    public + private instances, token attach, 401 refresh+retry
└── hooks/          useAuthInit (rehydrates session from localStorage)
```

## Things worth knowing

- **Route protection** is a client guard (redirect to /login without a token) — real enforcement is the API rejecting requests without a valid JWT.
- **Infinite scroll**: the template's middle column is its own scroll container (`overflow: auto`, hidden scrollbar), so the IntersectionObserver is rooted at that element via `closest()`, attached with a callback ref. Watching the viewport doesn't work in this layout.
- **Image posting** is eager: on file select the image is compressed on a canvas (max 1600px, ~10x smaller) and uploaded to the API in the background while the user is still typing. Submitting the post is then a small JSON call, so it feels instant.
- **Request dedupe**: fetch thunks use Redux Toolkit's `condition` to check the store at dispatch time — opening a comment section twice, StrictMode's double effects, or a double click won't fire a second identical request.
- **Like state** comes from the server (`likedByMe`) rather than being derived from the recent-likers preview, which would be wrong whenever your like isn't among the newest ones.
