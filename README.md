# personal-website

My personal portfolio and blog. I'm Asmit Desai — a security engineering student at PES University, CTF player, and SOC/detection engineering nerd.

## What I'm building this for

- **Show my projects** — security tools, detection pipelines, and whatever else I build
- **Write about CTFs** — walkthroughs for TryHackMe paths and CTF challenges I've played or authored (web exploitation, binary RE, SQL injection, DNS exfiltration, network forensics, etc.)
- **Security posts** — development write-ups, tool deep-dives, and anything security-adjacent worth documenting
- **About me** — my background, skills, internship experience, and links

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 (App Router, TypeScript) |
| Styling | Tailwind CSS v4 |
| Animation | Framer Motion |
| ORM | Drizzle ORM |
| DB (local) | SQLite |
| DB (prod) | Turso (libSQL) |
| Hosting | Vercel |

## Routes

| Route | Purpose |
|-------|---------|
| `/` | Hero, bio, recent posts |
| `/about` | Full about page |
| `/projects` | All my projects |
| `/projects/[slug]` | Single project page |
| `/writeups/thm` | TryHackMe writeups |
| `/writeups/thm/[slug]` | Single THM writeup |
| `/writeups/security` | Security posts |
| `/writeups/security/[slug]` | Single security post |
| `/tags/[slug]` | Posts by tag |

## Dev

```bash
npm run dev                  # local dev server
npm run build                # production build
npx drizzle-kit generate     # generate migration from schema changes
npx drizzle-kit migrate      # apply migrations
npx drizzle-kit studio       # visual DB browser
```

## Environment

```
# Local (.env.local)
DB_URL=file:sqlite.db

# Production (Vercel)
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
```
