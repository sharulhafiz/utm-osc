# AGENTS.md — UTM OSC site

Guidance for Hermes and other coding agents maintaining https://sustainable.utm.my/osc/
("UTM One Stop Centre for Green Jobs Education"). Scope: this static site; cluster, host
and nginx changes belong to `sharulhafiz/Web-Ops`.

## 1. Architecture and key files

Static HTML/CSS/JS, one page, no CMS, no build step, no dependencies. This repo is the
source of truth; the live host is a read-only deployment target.

- `index.html` — entire page: header/nav, sections, cards, footer (~730 lines).
- `styles.css` — all styling; responsive breakpoints at 900px and 640px.
- `script.js` — mobile nav toggle, scroll-spy, reveal animation, accordions, tabs.
- `src/` — images (`postN-slug.jpg`, logos) and PDFs linked from the page.
- `sync-osc.sh` — reference copy of the host sync script (§3); not run from the repo.

Section ids in page order: `overview`, (pathways), `components`, `education-tracks`,
`operating-model`, `objectives`, `governance`, `roadmap`, `impact`, `partners`,
`events-training`, `news`. Nav and scroll-spy key off them: a new section needs a nav link.

## 2. Editing conventions

- Minimal, scoped diffs. Reuse existing markup and classes; do not restructure, reformat or
  "modernise" untouched sections, and add no dependencies, frameworks, web fonts or CDNs.
- News cards: copy the existing pattern in `<section id="news">`, newest first.
  ```html
  <article class="card news-card reveal">
    <div class="news-img"><img src="src/postN-slug.jpg?v=YYYYMMDD" alt="specific description" loading="lazy" /></div>
    <div class="news-body">
      <span class="news-tag">Tag</span><h3>Headline</h3>
      <p>One-paragraph factual summary.</p>
      <a class="btn btn-primary news-btn" href="https://…" target="_blank" rel="noopener">Read on Facebook ↗</a>
    </div>
  </article>
  ```
- Verify every fact (title, date, wording, link) against the real source. Never invent
  people, dates or metadata; if a source is inaccessible, report a blocker instead.
- Images: files in `src/`, named `postN-slug.jpg`, target **< 500 KB**, with an `alt` that
  describes what the image shows. Replacements at an existing path need a new `?v=YYYYMMDD`
  cache-buster on that reference; likewise bump `styles.css?v=…` / `script.js?v=…` when
  editing those files.
- Accessibility: meaningful `alt` on every image, keep `aria-*` and `rel="noopener"`, and
  keep the `reveal` class (CSS hides it until `script.js` adds `.show`). Check desktop plus
  <900px and <640px layouts, keyboard nav and the mobile menu.

## 3. Deployment architecture (verified 2026-10-25)

- GitHub `sharulhafiz/utm-osc` (`main`) → live checkout on **www1**
  `/data/sites/chancellery/osc/httpdocs`: a `devops`-owned clone of
  `git@github.com:sharulhafiz/utm-osc.git`, `main` tracking `origin/main`; www1 `/data` is
  the NFS mount `sharestore.utm.my:/export/pool1/wwwdata`.
- The same export is mounted read-only into swarm service `chancellery_nginx` (image
  `registry.utm.my/utmmy/wp-nginx:8.3-lean`, replicas on www1 and www8) as volume
  `chancellery_osc-static-nfs-wwwdata` → `/data/static/osc` in the container.
- nginx: `location = /osc` → 301 `/osc/`; `location ^~ /osc/` → `alias /data/static/osc/`
  with `index index.html`. The rule lives in Web-Ops
  `configs/sites/chancellery/osc/nginx-conf/locations/10-osc.conf`.
- **Auto-deploy cron** (devops crontab on www1, `crond` active):
  `0-59/5 * * * * /home/devops/bin/sync-osc.sh >> /home/devops/osc-sync.log 2>&1`
  It fetches origin and, if `HEAD != origin/main`, runs `git reset --hard origin/main` and
  logs `OSC synced: <old> -> <new>`. Only `origin/main` is served — a branch or unmerged PR
  is never live. Runs land ~2 minutes after the `:00/:05` boundary (known host stall):
  delayed, never skipped.
- Deployed `/home/devops/bin/sync-osc.sh` (sha256 `6a3724ef…faa132`) is byte-identical to
  this repo's copy; its header comment still says `* * * * *`, but the real cadence is
  `0-59/5` because a `*`-leading schedule was silently discarded by cronie (Web-Ops #307).

## 4. Push-to-deploy procedure

1. Edit on a branch, commit, push, open a PR. Do **not** push to `main` unless instructed —
   `main` is production.
2. Merge to `main` (owner approval) → the cron deploys within ~5–7 minutes, no manual step.
3. Manual sync, same effect (needs www1 access):
   `ssh www1 'sudo -n -u devops /bin/bash /home/devops/bin/sync-osc.sh'`
4. Never hand-edit files under `/data/sites/chancellery/osc/httpdocs`: the cron's
   `git reset --hard` discards them without warning.

## 5. Safety boundaries

- Never `rm -rf`, `git clean` or bulk-delete under the live NFS content path.
- Do not touch `chancellery_nginx`, the WordPress side of `sustainable.utm.my`, nginx
  config, Traefik or DNS for a content change.
- Do not run `docker stack deploy` for this site: a redeploy that omits the
  `osc-static-nfs-wwwdata` mount silently 404s `/osc/` (see the OSC stack README).
- No merge, deploy or service restart without explicit approval; report blockers rather
  than guessing or widening scope.

## 6. Verification / definition of done

- **Local:** `python3 -m http.server 8000` in the repo root, open http://localhost:8000/ ;
  check links, images, desktop and <900px/<640px layouts, keyboard and mobile nav.
- **Committed, then deployed:** branch commit SHA, then `/home/devops/osc-sync.log` gains
  `OSC synced: <old> -> <new>` and the live checkout's `HEAD` equals `origin/main` equals
  the merged SHA.
- **Live:** `curl -s https://sustainable.utm.my/osc/ | sha256sum` equals
  `git cat-file blob HEAD:index.html | sha256sum` (2026-10-25 baseline `1399f1dd…6e1d9c` at
  commit `4f60400`), plus a browser check of the changed area.
- Report committed, deployed and verified-live as three separate states with evidence.

## 7. Where to look next

Web-Ops issues carry tasks and approvals (#333 this file, #306, #307, #331) plus the
infrastructure detail: `configs/sites/chancellery/osc/README.md`,
`docs/knowledge/static-site-include-folder.md`, `docs/knowledge/architecture-index.md`.
Task management stays there; this file is guidance, not a task queue.
