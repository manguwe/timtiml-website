# TIMTIML — personal CV website

Anotida Manguwe's personal CV site. **Next.js + React + TypeScript** on **Vercel**. No database, no email service, no accounts.
Everything visitors see can be edited from **/admin** — no code.

## What's on the site

Home (profile picture, who I am, **what I offer**, latest updates) · About (bio, education, skills, interests, career) · Projects (live / in development / planned / exploring) · Journal (dated updates with pictures) · Gallery · Documents (certificates) · Contact · **CV** (built from the site and exportable as a PDF)

## Managing the site (no code)

Open **`your-site.vercel.app/admin`**, log in, and use the three tabs:

**Website text** — edit every piece of text visitors read, then press **Save changes**:
* *Home*: the line above your name, tagline, intro, the "Who I am" cards
* *About*: biography, motto, how you work, interests, career direction
* *Education & Skills*: change **Level 2.1 → 2.2**, add a qualification, add or remove skills and skill groups
* *What I Offer*: the services you advertise (add, edit, reorder, delete)
* *Projects*: change a project's **Status** (In development → Live) and it moves to the right section automatically; edit descriptions, features and links; add new projects; untick "Include in my CV" to leave one out of the CV
* *Contact*: email, phone, WhatsApp number, GitHub, LinkedIn and other links (empty = hidden)

**Journal** — post an update: title, date, what happened, and as many pictures as you like. Edit or delete posts any time. They show on the Journal page (newest first) and the latest three show on the home page.

**Pictures & documents** — profile picture (replaces the "TIM timL" badge), gallery pictures with captions, and certificates / other documents (certificates also appear on the home page and in your CV).

### Your CV

There is nothing to upload. **/cv** is generated from the same content as the website, so whenever you edit the site, the CV is up to date. Press **Export as PDF** → in the print window choose **Save as PDF**. The CV includes: name and contact details, profile, education, technical skills, projects (the ones marked "Include in my CV"), certificates, interests and career objective.

## One-time setup (≈5 minutes)

1. **Vercel → your project → Storage → Create → Blob → Connect to this project.** (This is where your pictures and edits are saved.)
2. **Settings → Environment Variables:** add `ADMIN_SECRET` = a password of 8+ characters.
3. **Redeploy.** (Deployments → latest → ⋯ → Redeploy.) Environment changes only apply after a redeploy.
4. Visit `/admin`. The green box at the top says **Storage is connected**. If it is red it tells you exactly what is missing.

The storage key can have any prefix (`BLOB_READ_WRITE_TOKEN`, `TIM_READ_WRITE_TOKEN` …) — the site finds it.

## Local development

```bash
npm install
cp .env.example .env.local     # fill in ADMIN_SECRET (and the Blob token: `vercel env pull .env.local`)
npm run dev                    # http://localhost:3000
```

Node 20.9+ is required.

## Good to know

* Starting text lives in `data/content.json`. Once you save from the admin, your edited version is used instead.
* Uploads are stored in Vercel Blob. Pictures are shrunk in your browser before uploading; documents can be up to 4 MB.
* Anything typed in the admin is shown as plain text (never as code), links must start with `https://`, and over-long text is trimmed.
* The Contact form sends to your inbox through Formspree (set in `lib/site.ts`).
* The admin password is checked on the server; after 8 wrong attempts it pauses for 10 minutes.
