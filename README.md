# nhatprx-portfolio

A production-deployed developer portfolio built around a live server console. The
right half of the desktop layout is a real terminal attached to the AWS EC2
instance that serves the site: commands are executed on the node through a
read-only allowlist and the actual system output is streamed back to the
browser.

Live site: [nhatprx.com](https://nhatprx.com)

## Highlights

- Live EC2 terminal in the browser. `uname -a`, `free -h`, `df -h`, `uptime`,
  `systemctl`, `nginx`, `ls -la` and `whoami` run on the real instance and
  return live output. Everything else falls back to a local guest sandbox.
- Built-in admin portal behind a passkey, reachable at `#admin` or `/admin`
  (keyboard shortcut `Ctrl+Shift+A`). Edits to every section are persisted to
  S3 and published to the live site.
- Server-side portfolio translation through AWS Bedrock, so AWS credentials
  never reach the browser.
- Four locales (English, Vietnamese, French, Japanese) with a single shared
  global identity block.
- Resume upload through presigned S3 URLs. The browser PUTs the file straight
  to S3; no AWS secret key is ever shipped to the client.

## Tech Stack

### Frontend

| Technology | Role |
| --- | --- |
| React 19 | UI runtime |
| TypeScript 7 | Static typing |
| Vite 8 | Dev server and bundler |
| Tailwind CSS 4 | Utility-first styling (via `@tailwindcss/vite`) |
| Lenis | Smooth scroll |
| oxlint | Linting |

### Backend

| Technology | Role |
| --- | --- |
| Node.js 20+ (`node:http`) | Admin API, no framework |
| AWS SDK v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`) | Content storage and presigned resume uploads |
| `@aws-sdk/client-bedrock-runtime` | Section translation via the Converse API |
| `node:crypto` (PBKDF2, HMAC-SHA256, `timingSafeEqual`) | Passkey hashing and session tokens |
| `node:test` | API test suite |

### Infrastructure and Services

| Service | Role |
| --- | --- |
| AWS EC2 (Ubuntu 24.04, `ap-southeast-1`) | Hosts nginx and the admin API |
| AWS S3 | Stores portfolio content JSON and resume files |
| AWS Bedrock (Claude 3.5 Haiku) | Translates portfolio sections |
| AWS IAM instance profile | Grants the API outbound S3 and Bedrock access |
| AWS Budgets + SNS | Cost alerts for EC2, S3 and Bedrock |
| Nginx | Static file server and reverse proxy for `/api/` |
| Let's Encrypt (Certbot) | TLS certificate for `nhatprx.com` |
| systemd (`nhatprx-api.service`) | Runs and sandboxes the API process |
| GitHub Actions | Lint, build and deploy pipeline |

### Tooling

- Vite dev proxy forwards `/api` to `127.0.0.1:8787`.
- ESLint alternative: `oxlint` (run via `npm run lint`).
- Deployment uses `rsync` over SSH plus `systemctl` restarts.

## Architecture

```
Browser (React SPA)
  |  GET  /api/content          -> read published content
  |  POST /api/terminal/exec    -> read-only command execution
  |  POST /api/admin/login      -> passkey login
  |  PUT  /api/content          -> publish content (auth)
  |  POST /api/translate        -> Bedrock translation (auth)
  |  POST /api/resume/presign   -> presigned S3 PUT (auth)
  v
Nginx (:80/:443)  --TLS-->  127.0.0.1:8787
  v
Admin API (Node, systemd: nhatprx-api)
  |  GetObject / PutObject / DeleteObject
  v
S3 bucket  <-- presigned PUT straight from the browser
```

The API runs on the same instance as the portfolio, so the terminal never
tunnels SSH. The attack surface is the allowlist in `server/terminal.mjs`:
each entry fixes the exact argv that is executed and declares which argument
forms it accepts, and no user input is ever interpolated into a shell string.

## Content Flow

1. Locale source files in `src/data/locales/` are the factory defaults.
2. The admin portal edits the content in the browser and auto-saves it.
3. The API writes the merged content to `content/portfolio-content.json` in S3.
4. Visitors load the content from `/api/content` on mount; localStorage acts as
   an offline cache.

The global identity (name, email, phone, GitHub, LinkedIn) is stored once and
shared by every locale, so editing it updates the header, hero, footer and
contact section in all languages at once.

## Getting Started

```bash
npm install
npm run dev      # Vite dev server on :5173, proxies /api to :8787
npm run build    # Type-check and build to dist/
npm run preview  # Preview the production build
npm run lint     # oxlint
```

The API must be running on port 8787 for the admin, translation and upload
features to work. It falls back to `server/.testdata` for secrets when the
production environment variables are not set.

## API Reference

| Method | Route | Auth | Description |
| --- | --- | --- | --- |
| GET | `/api/health` | No | Liveness probe |
| GET | `/api/content` | No | Published portfolio content |
| POST | `/api/admin/login` | No | Exchange a passkey for a token (12h TTL) |
| POST | `/api/admin/logout` | No | Discard the session |
| POST | `/api/terminal/exec` | No | Run an allowlisted read-only command |
| POST | `/api/translate` | Yes | Translate content sections via Bedrock |
| POST | `/api/resume/presign` | Yes | Issue a presigned S3 PUT URL |
| POST | `/api/resume/delete` | Yes | Delete a stored resume |
| PUT | `/api/content` | Yes | Publish portfolio content |

### Terminal allowlist

`uname -a`, `uptime`, `free -h`, `df -h`, `whoami`, `hostname`, `ls -1 -la`,
`systemctl is-active nhatprx-api`, `systemctl is-active nginx` and
`systemctl status nhatprx-api`.

## Admin Setup

```bash
sudo bash server/setup-secrets.sh "<passkey>"   # PBKDF2 hash + token secret
bash server/setup-cors.mjs                     # allow browser PUT uploads
bash server/setup-bedrock-iam.sh <role-name>   # Bedrock invoke permissions
```

Environment variables used by the API:

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `8787` | Listen port |
| `AWS_REGION` | `ap-southeast-1` | Region for S3 and Bedrock |
| `PORTFOLIO_BUCKET` | `nhatprx-portfolio-resumes-815802019553` | Content and resume bucket |
| `BEDROCK_MODEL_ID` | `anthropic.claude-3-5-haiku-20241022-v1:0` | Translation model |
| `BEDROCK_MAX_TOKENS` | `4096` | Max output tokens per translation |
| `PASSKEY_HASH_FILE` | `/var/lib/nhatprx-api/passkey.hash` | Passkey hash location |
| `TOKEN_SECRET_FILE` | `/var/lib/nhatprx-api/token.secret` | Token signing secret |

## Deployment

Push to `main` and the GitHub Actions workflow runs lint, build, then:

1. `rsync` the `dist/` folder to the Nginx web root on the EC2 instance.
2. `rsync` the `server/` folder to `/home/ubuntu/nhatprx-api/` and install
   production dependencies.
3. Restart `nhatprx-api` and reload Nginx.

TLS is provisioned separately with `server/setup-tls.sh` (Certbot, Let's
Encrypt) and is not re-run on every deploy.

## Testing

```bash
cd server
npm run check        # node --test test/*.test.mjs
bash smoke-test.sh   # end-to-end API checks against a running instance
bash e2e-upload.sh   # presign, upload, verify and delete a resume
```

## Security Notes

- The passkey is stored as a PBKDF2-SHA256 hash (200,000 iterations) with a
  random salt; verification is constant-time.
- Session tokens are HMAC-SHA256 signed with a 32-byte secret stored at
  `0600` and expire after 12 hours.
- The browser never receives AWS credentials. Resume uploads use presigned
  URLs with a 5 minute expiry and are restricted to `.pdf`, `.doc` and `.docx`
  under a managed `resumes/` prefix.
- The systemd unit runs with `NoNewPrivileges`, `ProtectSystem=strict` and a
  read-only home directory.
- The public terminal is read-only by construction: a fixed argv allowlist,
  no shell, a 5 second timeout and a 32 KB output cap.

## Project Layout

```
src/
  components/        Portfolio sections, terminal, telemetry, admin portal
  data/locales/      en, vi, fr, ja content sources
  services/          API client, content storage, translation helpers
  hooks/             Scroll handling
server/
  index.mjs          Admin API (auth, content, uploads, translation)
  terminal.mjs       Command allowlist and runner
  bedrock-translate.mjs
  nginx/             HTTP and TLS vhosts
  test/              node:test suites
.github/workflows/   Deploy pipeline
```
