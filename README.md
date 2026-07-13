# Finance For Movement — Website

A custom, navy-themed website with a 3D animated hero, built to replace the Google Sites page.
Everything is plain HTML/CSS/JS — no build step, no framework — so it stays easy to edit and host anywhere.

```
ffm-website/
├── index.html      ← Home (hero, about, testimonials + IG posts, posters, FAQ, join)
├── resources.html  ← Resource Hub (real lesson covers linking to the Canva lessons)
├── contact.html    ← Contact + embedded subscription Google Form
├── styles.css      ← colors, fonts, spacing (navy theme lives at the top)
├── main.js         ← 3D hero, site-wide content search, mobile menu
├── images/
│   ├── logo.png            ← FFM logo, transparent background
│   ├── booth.jpeg / workshop.jpeg / crafts.jpeg
│   ├── res-*.png           ← Canva lesson cover images (Resource Hub cards)
│   └── poster-*.png        ← community posters shown under the IG posts
└── README.md       ← this file
```

The top navigation is intentionally minimal (Home · About · Resource Hub · FAQ · Contact),
followed by the **Join Us** button and a **search bar** on the far right. The search matches
the real text content of every page and shows the matching sentence; anchor links jump
directly to their section (no scroll animation). Instagram posts are embedded with
Instagram's official embed script (they need internet to render).

## View it locally
Open `index.html` in any browser, or run a tiny server from this folder:
```
python3 -m http.server 4173
```
then visit http://localhost:4173

## Easiest way to edit: the /admin panel (Decap CMS)
Once the site is live on Netlify, board members open **`<your-site>/admin/`**, log in with
GitHub, and get a friendly form editor — no code. It edits `content/site.json` and
`content/resources.json`, which the pages load automatically:

- Impact stats, next event, student testimonials
- The two embedded Instagram posts (paste any post URL)
- Executive Board & Internship cards (deadlines, application links)
- FAQ, contact email/socials, the subscription form URL
- Resource Hub cards (titles, descriptions, cover images, Canva links)

Editors need a (free) GitHub account with write access to this repo.
Anything not listed above (hero wording, About paragraphs) is edited in the HTML as below.

## How the board edits content (no coding background needed)
All wording lives in **`index.html`**. Open it in any text editor and change the text between the
tags — for example the headline is in the `<h1 class="hero__title">` block. Each section is clearly
labeled with a comment like `<!-- ===== ABOUT ===== -->`. Save and refresh.

Common edits:
- **Stats** → the "IMPACT STATS" section in `index.html` (plain text numbers).
- **Testimonials** → the "TESTIMONIALS" section in `index.html`.
- **Instagram posts** → each embedded post is a `<blockquote class="instagram-media">` with the
  post URL in `data-instgrm-permalink`; swap in any post's URL to change it.
- **Email / social links** → search for `financeformovement@gmail.com`, `instagram.com`, `tiktok.com`.
- **Application links & deadlines** → search for `forms.gle` in the "Get Involved" section.
- **Resource lessons** → in `resources.html`, each card's `href` is its Canva link and its `<img>`
  is the cover in `images/`; copy a card block to add a new lesson.
- **Subscription form** → in `contact.html`, the `<iframe src="…">` points at the Google Form.
  To swap forms, replace that URL with your new form's link and add `?embedded=true` to the end.
- **Search** → no setup needed; it indexes the pages' actual text automatically.
- **Photos** → drop a new image into `images/` and update the matching `src="images/..."`.
- **Colors** → top of `styles.css`, the `--navy*` variables change the whole site.

## Publish it (free) so the board has a live link
Pick whichever is easiest:

1. **Netlify Drop (easiest, drag-and-drop):** go to https://app.netlify.com/drop and drag this
   `ffm-website` folder onto the page. You instantly get a public link. To update later, edit the
   files and drag the folder again.
2. **GitHub Pages / Netlify + GitHub (best for ongoing board edits):** put this folder in a GitHub
   repo. Board members can edit text right in GitHub's web editor (press `.` on the repo to open
   github.dev) and the site auto-updates. Both are free for nonprofits.
3. **Vercel / Cloudflare Pages:** also free; connect the repo and deploy.

All four give you a shareable link, and unlike Google Sites the design is fully ours.
