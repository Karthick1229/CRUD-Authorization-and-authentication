# SecureGate

SecureGate is a learning project for account registration, server-side session login, and role-based access control. The backend is a Spring Boot REST API. The frontend is a React application. MySQL stores real accounts; Flyway applies the schema when the backend starts.

The code favors explicit names and small methods over clever abstractions. It is an educational foundation, not a production security certification.

## Architecture

```text
React form
  -> Axios API client (browser sends HttpOnly JSESSIONID cookie and CSRF header)
  -> Spring Security (CSRF, session, authentication, role checks)
  -> Controller (validates request and maps DTOs)
  -> Service (registration/profile/admin rules and transactions)
  -> Spring Data JPA repository
  -> MySQL (schema managed by Flyway)
```

Registration passwords are encoded with BCrypt. A new public account always receives USER; no registration field can select a role. Admin URLs are authorized on the backend, even if a user manually calls the API. Login creates a server session. The session cookie is HttpOnly, while the separate CSRF cookie is readable by JavaScript so the client can copy its value to `X-XSRF-TOKEN`. Never put session IDs or tokens in localStorage.

## Prerequisites

- Java 21
- Maven 3.9 or later
- Node.js 20.19+ or 22.12+
- MySQL 8

This machine has Java 21 and Node 22.14/npm 10.9.2, but Maven and the MySQL command-line client were not found on PATH. The frontend can be built with the available Node toolchain. Backend compilation and a live MySQL connection require Maven and a running MySQL server.

## Local Setup

1. Review `database/create-database.sql`, replace its sample password, and run it using a local MySQL administrator account. It grants the application user only the privileges needed by the app and Flyway.
2. Set `DB_URL`, `DB_USER`, and `DB_PASSWORD` in your shell or IDE run configuration. See `.env.example` for names and local examples. Spring Boot does not load the root `.env` file automatically.
3. Start the API from `backend` using `mvn spring-boot:run`. Flyway creates the user table on startup.
4. In another terminal, run `npm install` and `npm run dev` from `frontend`.
5. Open `http://localhost:5173`.

The local frontend origin is `http://localhost:5173`, and the API is `http://localhost:8080`. `COOKIE_SECURE=false` is suitable only on localhost. Use HTTPS and `COOKIE_SECURE=true` when deploying behind TLS. Do not commit credentials.

## Open from Another Device on Your Wi-Fi

This is for a trusted private LAN, not public internet hosting. Find the host computer's IPv4 address with `ipconfig`; for example, it may look like `192.168.1.25` (the address can change). Start the backend with `FRONTEND_ORIGIN` set to the exact browser origin, and set the Vite API URL to the host computer's IP:

```powershell
# Backend terminal, from backend. Keep your database environment variables configured too.
$env:FRONTEND_ORIGIN = "http://192.168.1.25:5173"
mvn spring-boot:run
```

```powershell
# Frontend terminal, from frontend.
$env:VITE_API_URL = "http://192.168.1.25:8080/api"
npm run dev
```

Replace `192.168.1.25` with the host PC's actual LAN IPv4 address in both places. The Vite dev server now binds to all network interfaces by default. On Windows, allow inbound TCP ports 5173 and 8080 on **Private networks only** if Windows Firewall prompts; do not expose MySQL port 3306. On the other device, visit `http://192.168.1.25:5173`.

Do not use these development settings for a public website. Public access needs deployment behind HTTPS, secure cookies, a production web server/reverse proxy, restricted firewall rules, and a security review. Do not forward the development ports from your router.

## First Administrator

1. Register your own account through the app. It starts as USER.
2. Using your local database administration tool, promote that account explicitly:

```sql
UPDATE users
SET role = 'ADMIN', updated_at = NOW(6)
WHERE email = 'your-local-email@example.com';
```

3. Sign out and sign back in to load the updated role.

This bootstrap is intentionally manual: public registration never accepts roles, and the repository does not ship a default administrator password.

## API Overview

| Method | Path | Access | Purpose |
| --- | --- | --- | --- |
| GET | `/api/auth/csrf` | Public | Issue/read CSRF token before form submission |
| POST | `/api/auth/register` | Public + CSRF | Register `fullName`, `email`, `password`; role is USER |
| POST | `/api/auth/login` | Public + CSRF | Authenticate; returns a safe user DTO |
| POST | `/api/auth/logout` | Signed in + CSRF | Invalidate the server session |
| GET | `/api/auth/me` | Signed in | Restore the current session after refresh |
| GET / PUT | `/api/users/me` | Signed in | View or update the current user's name |
| PUT | `/api/users/me/password` | Signed in + CSRF | Change password after checking the current password |
| GET | `/api/admin/users` | ADMIN | Search/filter/page users with `query`, `active`, `page`, `size`, `sort`, `direction` |
| GET | `/api/admin/users/{id}` | ADMIN | View one user DTO |
| PATCH | `/api/admin/users/{id}/status` | ADMIN | Set `{ "active": true }` or false |
| PATCH | `/api/admin/users/{id}/role` | ADMIN | Set `{ "role": "USER" }` or `ADMIN` |
| GET | `/api/admin/dashboard/stats` | ADMIN | Read aggregate account statistics |

Unauthenticated protected requests return 401. Authenticated requests without the role return 403. Validation problems return 400, duplicate email returns 409, and missing accounts return 404. Responses use DTOs and omit password hashes. There is no password-reset endpoint: a secure reset needs email delivery, single-use expiring secrets, and operational configuration this local project does not have.

## Database Design

`users` has a generated primary key, unique email, role enum string, active flag, and created/updated timestamps. The single role column is a deliberately simple one-role-per-user model, so this design needs no roles join table or foreign key. Indexes support role, status, and recent-account listing. Flyway SQL is in `backend/src/main/resources/db/migration`; SELECT, INSERT guidance, UPDATE, DELETE, JOIN, ORDER BY, GROUP BY, and pagination examples are in `database/example-queries.sql`. Register accounts through the API so passwords are encoded.

## Tests and Build

From `frontend`:

```powershell
npm install
npm test
npm run build
```

From `backend`:

```powershell
mvn test
mvn spring-boot:run
```

Backend tests isolate service behavior with repository doubles and do not touch your developer database. Manual integration checklist: register a USER and verify `/api/admin/users` returns 403; promote a local test account using the SQL above; sign in again and verify the endpoint returns a paged result; deactivate a test user and confirm their next login is rejected. Also check validation, duplicate email, incorrect password, refresh persistence, logout, CSRF failures, profile update, and password change.

## Learning Notes

- **Authentication** proves who is signing in. **Authorization** decides what that account may do.
- **Role** is a named group of access rules. **Permission** is an allowed operation; this sample uses ADMIN and USER roles.
- **Session** is server-side login state referenced by a browser cookie. **CSRF** protection makes the browser send an unpredictable token with state-changing requests.
- **CORS** tells browsers which frontend origin may call the API; it does not replace authentication or authorization.
- **DTO** is an API request/response shape separate from the database entity; it limits accidental data exposure and mass assignment.
- **Dependency injection** lets Spring provide collaborators such as repositories and services. A **bean** is an object managed by Spring.
- **JPA** defines Java persistence concepts. **Hibernate** implements them and maps entity changes to SQL.
- **REST API** exposes resource operations over HTTP. **401** means not authenticated, **403** means authenticated but not allowed, **404** means absent, and **400** means invalid input.

## Known Limitations

- There is no password-reset email workflow or application-level login rate limiter. Put deployments behind a rate-limiting reverse proxy and add a real delivery provider before implementing reset.
- Admin bootstrap is a deliberate local SQL step, not a default account.
- Session cookies use `SameSite=Lax`; cross-site deployment needs coordinated HTTPS, `SameSite=None`, secure cookies, a strict CORS origin, and a CSRF review.
- Complete a security review and integration tests against the actual deployment environment before production use.