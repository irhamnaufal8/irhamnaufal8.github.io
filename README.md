# irhamnaufal8.github.io

Personal portfolio website for **Muhammad Irham Naufal Al Machdi** — Software Engineer, Apple WWDC24 Swift Student Challenge Winner.

🌐 **Live:** [https://irhamnaufal8.github.io](https://irhamnaufal8.github.io)

---

## Stack

- Pure HTML, CSS, and vanilla JavaScript — zero dependencies, zero build tools
- Posts rendered from Markdown files using [marked.js](https://marked.js.org/) (CDN, no install required)
- Deployed via **GitHub Pages**

---

## Project Structure

```
irhamnaufal8.github.io/
├── index.html              # Home page
├── post.html               # Post reader (shared template for all posts)
├── assets/
│   ├── css/
│   │   └── main.css        # Full design system & all page styles
│   ├── js/
│   │   └── main.js         # Nav, scroll reveal, post loading, tag filtering
│   └── images/
│       ├── favicon.svg     # Site favicon
│       └── avatar.jpg      # Profile photo (add your own)
├── posts/
│   ├── index.json          # ← MANIFEST: add new posts here
│   ├── *.md                # Post content files (Markdown)
│   └── assets/             # Per-post images (e.g. posts/assets/wwdc24/banner.jpg)
└── README.md
```

---

## How to Add a New Post

### Step 1 — Add to the manifest

Edit `posts/index.json` and add a new entry:

```json
{
  "slug": "my-new-post",
  "title": "My Awesome Post Title",
  "description": "A short summary shown on the card.",
  "date": "2025-01-15",
  "tags": ["project"],
  "banner": "posts/assets/my-new-post/banner.jpg",
  "emoji": "🚀"
}
```

| Field         | Required | Description |
|---------------|----------|-------------|
| `slug`        | ✅       | URL-safe identifier. Must match the `.md` filename. |
| `title`       | ✅       | Post title shown on cards and in the post header. |
| `description` | ✅       | Short summary shown on the card (1–2 sentences). |
| `date`        | ✅       | ISO date string `YYYY-MM-DD`. |
| `tags`        | ✅       | Array of strings. Supported: `project`, `story`, `lesson`. |
| `banner`      | ☐        | Path to banner image (relative to site root). Leave empty string if none. |
| `emoji`       | ☐        | Fallback emoji shown when no banner is available. |

### Step 2 — Write the post

Create `posts/my-new-post.md` with Markdown content:

```markdown
# My Awesome Post Title

Introduction paragraph here.

## Section Heading

Content with **bold**, *italic*, `code`, and [links](https://example.com).

## Code Block

```swift
let greeting = "Hello, world!"
print(greeting)
```
```

### Step 3 — Add images (optional)

Place images in `posts/assets/my-new-post/` and reference them in your Markdown:

```markdown
![Alt text](posts/assets/my-new-post/screenshot.jpg)
```

That's it. No rebuild needed — the site reads `index.json` dynamically.

---

## Available Tags

| Tag       | Color     | Use for |
|-----------|-----------|---------|
| `project` | Purple    | Technical project writeups, case studies |
| `story`   | Cyan      | Personal narratives, experiences |
| `lesson`  | Orange    | Learnings, tips, reflections |

Multiple tags are supported: `"tags": ["project", "story"]`

---

## Customization

### Profile photo
Replace `assets/images/avatar.jpg` with your own photo (square, at least 200×200px recommended).

### Personal info
Update the hero text, about section, and experience timeline in `index.html`.

### Colors & fonts
All design tokens are CSS variables at the top of `assets/css/main.css`:

```css
:root {
  --color-accent: #6B4EFF;  /* Primary brand color */
  --font-display: 'DM Serif Display', Georgia, serif;
  --font-body:    'DM Sans', -apple-system, sans-serif;
  /* ... */
}
```

---

## Local Development

No build tools required. Just serve the files:

```bash
# Python 3
python3 -m http.server 8080

# Node.js (npx)
npx serve .
```

Then open [http://localhost:8080](http://localhost:8080).

> **Note:** Opening `index.html` directly as a `file://` URL will cause CORS errors when fetching `posts/index.json`. Always use a local server.
