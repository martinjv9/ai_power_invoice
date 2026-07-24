# App Phase 1 — Auth & App Shell

## What this phase is

Letting your staff log in with an email and password, staying logged in as they
click around, and locking everything behind that login. Plus the basic app "shell"
(nav bar, layout, logout button) that every screen will live inside.

## Why it matters

This is a financial app with client data — nothing should be visible without
logging in. Getting auth right early also means every feature you build afterward
can simply assume "there's a logged-in user." Auth is also where beginners make the
most security mistakes, so it's worth understanding, not copy-pasting.

## Key concepts

- **Authentication vs authorization:** authentication = _who are you_ (login);
  authorization = _what are you allowed to do_ (permissions). This phase is mostly
  authentication.
- **Hashing:** you never store real passwords. You store a scrambled, one-way
  version (a _hash_). At login you hash what they typed and compare hashes. Use
  **argon2** or **bcrypt** — they're deliberately slow to resist guessing attacks.
- **Session:** the server's memory that "this browser is logged in as user X."
  We store sessions in the database (see `tech-stack.md` for why, not JWT).
- **Cookie:** a small piece of data the browser stores and automatically sends back
  on every request. We put the _session ID_ in an `httpOnly` cookie so browser
  JavaScript can't read it (blocks a common theft attack).
- **CORS (Cross-Origin Resource Sharing):** a browser security rule. Because your
  frontend and backend are on different origins, the backend must explicitly say
  "I allow requests from the frontend, and I allow cookies." Without this, logins
  silently fail.
- **Middleware:** a function that runs before your route handler. An _auth
  middleware_ checks the session and rejects the request with `401 Unauthorized`
  if there's no valid login.

## Task by task

1. **`User` model + seed admin.** Define the users table; write a script that
   creates your first admin (you can't register through a UI yet). _Why:_ you need
   an account to log in with before any UI exists.
2. **Password hashing.** Hash on user creation, verify on login. _Why:_ a database
   leak must not expose real passwords.
3. **Sessions table + `express-session` (Postgres store).** _Why:_ server-side
   sessions let you revoke a login instantly by deleting a row — important for staff
   access to financial data.
4. **Login / logout / me endpoints.** `login` verifies credentials and starts a
   session; `logout` destroys it; `me` returns the current user. _Why:_ the
   frontend uses `me` on load to ask "am I still logged in?"
5. **Auth middleware.** Protect every non-public route; return 401 when logged out.
   _Why:_ one guard instead of repeating checks in every handler.
6. **CORS with credentials.** Allow the frontend origin and `credentials: true`.
   _Why:_ without this the login cookie never reaches the backend. The api
   already restricts CORS to the single origin in `CORS_ORIGIN` — keep it that
   way. Reflecting _any_ origin while `credentials: true` means any website a
   logged-in staff member visits could call your API with their session cookie.
   (In dev the frontend goes through the Vite proxy, so it's same-origin and
   CORS barely comes into play until the two are deployed separately.)
7. **Secure cookie flags.** `httpOnly`, `SameSite`, and `secure` in production.
   _Why:_ defense against cookie theft and cross-site attacks.
8. **Frontend login page + auth context.** A form, plus a React context/hook that
   holds "who am I" and shares it app-wide. _Why:_ every screen needs to know the
   current user without re-fetching.
9. **Protected-route wrapper.** Redirect to login if not authenticated. _Why:_
   users should never see app screens while logged out.
10. **App shell.** Sidebar/nav layout, current-user display, logout button. _Why:_
    a consistent frame for all future screens; build it once.

## Common pitfalls

- **Login "works" but you're logged out on refresh:** almost always a cookie/CORS
  misconfig — check `credentials: true` on both the fetch call and the CORS config,
  and that the cookie domain/SameSite is right for localhost.
- **Storing passwords in plain text or with fast hashes (MD5/SHA):** always use
  argon2/bcrypt.
- **Rolling your own crypto:** use vetted libraries; never invent auth math.
- **Forgetting the 401 path in the frontend:** if the API returns 401, the frontend
  should bounce to login, not show a broken screen.

## How to know you're done

You log in with the seeded account, land on an empty dashboard, refresh the page
and stay logged in, and logout returns you to the login screen. Hitting an API
route while logged out returns 401.
