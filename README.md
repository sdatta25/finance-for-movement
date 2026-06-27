# Finance For Movement — Website

A custom, navy-themed website with a 3D animated hero, built to replace the Google Sites page.
Everything is plain HTML/CSS/JS — no build step, no framework — so it stays easy to edit and host anywhere.

```
ffm-website/
├── index.html      ← Home (hero, about, testimonials, programs, FAQ, join)
├── resources.html  ← Resource Hub (cards linking to the Canva lessons)
├── contact.html    ← Contact + embedded subscription Google Form
├── styles.css      ← colors, fonts, spacing (navy theme lives at the top)
├── main.js         ← 3D hero, scroll effects, counters, site search
├── images/
│   ├── logo.png    ← FFM logo, transparent background
│   ├── booth.jpeg
│   ├── workshop.jpeg
│   └── crafts.jpeg
└── README.md       ← this file
```

The top navigation is intentionally minimal (Home · About · Resource Hub · FAQ · Contact),
with a **search** icon and a **Join Us** button to its right.

## View it locally
Open `index.html` in any browser, or run a tiny server from this folder:
```
python3 -m http.server 4173
```
then visit http://localhost:4173

## How the board edits content (no coding background needed)
All wording lives in **`index.html`**. Open it in any text editor and change the text between the
tags — for example the headline is in the `<h1 class="hero__title">` block. Each section is clearly
labeled with a comment like `<!-- ===== ABOUT ===== -->`. Save and refresh.

Common edits:
- **Stats** → search for `data-count` in `index.html` (the numbers animate up automatically).
- **Testimonials** → the "Student Voices" section in `index.html`.
- **Email / social links** → search for `financeformovement@gmail.com`, `instagram.com`, `tiktok.com`.
- **Application links & deadlines** → search for `forms.gle` in the "Get Involved" section.
- **Resource lessons** → in `resources.html`, each card's `href` is its Canva link; to add a card,
  copy an existing `<a class="res-card">…</a>` block and change the title, icon, and link.
- **Subscription form** → in `contact.html`, the `<iframe src="…">` points at the Google Form.
  To swap forms, replace that URL with your new form's link and add `?embedded=true` to the end.
- **Search results** → the searchable list is the `INDEX` array near the top of `main.js`.
- **Photos** → drop a new image into `images/` and update the matching `src="images/..."`.
- **Colors** → top of `styles.css`, the `--navy-*` and `--blue-200` variables change the whole site.

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
