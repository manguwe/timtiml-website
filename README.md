# TIMTIML — personal portfolio

Anotida Manguwe's portfolio. **Next.js + React + TypeScript** on **Vercel**. No database, no email service, no accounts —
the only thing that changes is what you upload on the **/admin** page.

## What's on the site

Home (with your profile picture) · About (bio, education, skills, interests) · Projects (live / in development / planned / exploring) · Gallery · Documents (CV & certificates) · Contact

## Updating the site WITHOUT touching code

Open **`your-site.vercel.app/admin`**, log in with your password, and:

| Do this | What happens on the site |
|---|---|
| Upload a **profile picture** | Replaces the "TIM timL" circle on the home page |
| Upload a **CV** (PDF) | A **⬇ CV** button appears in the menu, and the CV shows on the Documents page |
| Upload **gallery pictures** (several at once, with captions) | They appear on the Gallery page |
| Upload **certificates / documents** | They appear on the Documents page (certificates also show on the home page) |
| **Edit** a caption or **Delete** something | Changes the site straight away |

Big phone photos are shrunk automatically in your browser before they upload. Documents can be up to 4 MB.

## One-time setup (≈5 minutes)

1. **Replace the old files.** In your GitHub repo delete everything old (`*.html`, `api/`, `css/`, `js/`, `requirements.txt`, `vercel.json`, `database_setup.sql`) and copy this project in.
2. **Create file storage.** Vercel → your project → **Storage → Create → Blob → Connect to this project.** Vercel adds `BLOB_READ_WRITE_TOKEN` for you.
3. **Set your admin password.** Vercel → **Settings → Environment Variables** → add `ADMIN_SECRET` = a password of 8+ characters.
4. **Redeploy** (Deployments → ⋯ → Redeploy). Then visit `/admin`.

That's all. EmailJS, Supabase, Groq and every other service from the old site are gone — nothing to configure for them.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in ADMIN_SECRET (and the Blob token: `vercel env pull .env.local`)
npm run dev                    # http://localhost:3000
```

Node 20.9+ is required.

## Where the remaining text lives (only if you ever want to change it)

| Change… | Edit |
|---|---|
| Hero text, bio, education, skills, interests, projects | `data/content.json` |
| Phone, email, social links, contact form address | `lib/site.ts` |
| Site colours / styles | `app/(site)/globals.css` |

## Good to know

* Uploads are stored in Vercel Blob (a free tier is included). The list of what you uploaded is one small file kept next to your pictures.
* The Contact form sends messages to your inbox through Formspree (the same one you already had) — nothing to set up.
* Old links (lesson pages, `/pricing`, `/faq`, `/blog`, `/design`, `/web-dev`) redirect to the home page.
* If you try `/admin` too many times with a wrong password it pauses for a few minutes.
