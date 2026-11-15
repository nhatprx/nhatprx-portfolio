# nhatprx-portfolio

Developer portfolio built around a live server console: the terminal on the
right half of the page runs allowlisted, read-only commands on the AWS EC2
instance that serves the site and streams back the real output.

**Status**: released and running in production at <https://nhatprx.com>.

## Features

- **Live EC2 terminal**: `uname`, `free`, `df`, `uptime`, `systemctl`, `nginx`
  and more run on the real node. If the node is unreachable, the command fails
  rather than returning fake output.
- **Admin portal** (`#admin`, `/admin` or `Ctrl+Shift+A`): passkey-protected
  editing of every section, persisted to S3 and published instantly.
- **Four languages** (EN, VI, FR, JA). Each locale is edited by hand in the
  admin portal; the identity (name, email, phone, social links) is global and
  applies to every language at once.
- **Resume upload** straight from the browser to S3 via presigned URLs.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS 4, Lenis, oxlint
- **Backend**: Node.js 20+ (`node:http`, no framework), AWS SDK v3 (S3),
  `node:crypto`, `node:test`
- **Infra**: EC2 (Ubuntu 24.04), S3, IAM instance profile, Nginx,
  Let's Encrypt, systemd, GitHub Actions

## Architecture

```
Browser (React SPA)
    v
Nginx (:80/:443)  -- /api/ -->  Admin API (Node, systemd) --> S3
                                         ^
Browser --- presigned PUT (resumes) -----+
```

The API runs on the same instance as the site, so the terminal never tunnels
SSH. Content flows from `src/data/locales/` (defaults) to the admin portal to
S3 (`content/portfolio-content.json`), and visitors load it from
`/api/content`.

## Getting Started

```bash
npm install
npm run dev        # Vite on :5173, proxies /api to :8787
npm run build      # type-check + build to dist/
npm run lint       # oxlint
npm run dev:local  # dev against the real EC2 node via SSH tunnel
```

The API (`cd server && npm start`) must be running on `:8787` for admin and
upload features.

`dev:local` opens an SSH tunnel to EC2, starts a local API on `:8788` with
`TERMINAL_UPSTREAM` pointed at the tunnel, and starts Vite. Terminal commands
and live metrics run on the node; admin and S3 use local AWS credentials.
Overrides: `EC2_HOST`, `EC2_USER`, `SSH_KEY`, `EC2_SSH_HOST_KEY`,
`TUNNEL_PORT`, `API_PORT`.

## API

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Liveness probe |
| GET | `/api/content` | No | Published content |
| GET | `/api/metrics`, `/api/system-info` | No | Live node metrics and info |
| POST | `/api/admin/login`, `/logout` | No | Passkey login (2h token) / logout |
| POST | `/api/terminal/token` | No | Issue 1h terminal signing token |
| POST | `/api/terminal/exec` | Signed | Run an allowlisted command |
| POST | `/api/resume/presign`, `/delete` | Yes | Presigned upload / delete resume |
| PUT | `/api/content` | Yes | Publish content |

The terminal allowlist (system info, `git` read commands, process list, logs,
`systemctl`/nginx status, `/proc` readers, etc.) lives in `server/terminal.mjs`.

## Configuration

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | Listen port |
| `AWS_REGION` | `ap-southeast-1` | S3 region |
| `PORTFOLIO_BUCKET` | - | Content and resume bucket |
| `PASSKEY_HASH_FILE` | `/var/lib/nhatprx-api/passkey.hash` | Passkey hash path |
| `TOKEN_SECRET_FILE` | `/var/lib/nhatprx-api/token.secret` | Token secret path |
| `TERMINAL_UPSTREAM` | unset | Remote API URL (local dev only) |

Admin setup: `server/setup-secrets.sh`, `server/setup-cors.mjs`.

## Deployment

Push to `main`: GitHub Actions runs lint and build, `rsync`s `dist/` and
`server/` to the EC2 instance, installs the Nginx vhost, then restarts
`nhatprx-api` and reloads Nginx. TLS is set up once with
`server/setup-tls.sh`.

The deploy workflow requires two secrets: `EC2_SSH_KEY` (the private key) and
`EC2_SSH_HOST_KEY` (the pinned host key fingerprint). The fingerprint is
compared against what the host presents, so an intercepted connection cannot
swap in a different key.

## Testing

```bash
cd server
npm run check        # unit tests (node --test)
bash smoke-test.sh   # end-to-end API checks
bash e2e-upload.sh   # resume upload round trip
```

Scripts under `server/scripts/` verify the live node:

```bash
node server/scripts/verify-production-hardening.mjs   # rate limit, replay, headers
node server/scripts/verify-upload-e2e.mjs              # presign + upload (runs on EC2)
bash server/scripts/verify-terminal-runtime.sh        # every allowlisted command
```

## Security

- Passkey stored as PBKDF2-SHA256 (200k iterations, random salt);
  constant-time verification. Sessions are HMAC-signed, expire after 2h, and
  are revoked on logout.
- Login attempts are rate limited per client IP (5 per 15 minutes) with a
  constant delay on failure.
- No AWS credentials in the browser; resume uploads use 5-minute presigned URLs
  limited to `.pdf`/`.doc`/`.docx` under `resumes/`, with the size range
  enforced by S3 itself. The presigned URL signs `Content-Disposition:
  attachment`, so a stored file downloads instead of rendering inline on the
  S3 domain.
- The resume bucket's CORS is pinned to `https://nhatprx.com` and
  `https://www.nhatprx.com`; a wildcard origin would let any site upload
  with a leaked URL.
- Terminal is read-only by construction: fixed argv allowlist, no shell, 5s
  timeout, 100 KB output cap.
- Terminal requests are HMAC-signed per client and per command, with a fresh
  nonce per request so a captured request cannot be replayed. The signature
  window is 60 seconds.
- Terminal rate limits (60 exec/min, 30 tokens/min) are keyed by the real
  client IP taken from `X-Real-IP`, which nginx overwrites on every request.
  `X-Forwarded-For` is not trusted.
- Terminal output is scrubbed of AWS keys, passwords, tokens, private keys,
  JWTs and private addresses before it leaves the server.
- Nginx sends CSP, HSTS, `X-Frame-Options`, `X-Content-Type-Options`,
  `Referrer-Policy` and `Permissions-Policy`. The CSP sets
  `frame-ancestors 'none'`, which blocks clickjacking the admin dashboard.
- systemd unit runs with `NoNewPrivileges` and `ProtectSystem=strict`.

## Project Layout

```
src/        components, data/locales (en, vi, fr, ja), services, hooks
server/     index.mjs (API), terminal*.mjs (allowlist, security, signing),
            rate-limit.mjs, nginx/, test/
.github/    deploy workflow
```
