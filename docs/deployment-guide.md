# Deployment Guide

This prototype is intentionally plain HTML, CSS, JavaScript, and JSON.

There is no build step.

## Local preview

Because the site loads JSON files with `fetch()`, do not open `index.html` directly from your file system. Run a local server instead.

From the project folder:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## GitHub Pages prototype

1. Create a new GitHub repo.
2. Upload all files from this folder to the repo root.
3. Go to **Settings → Pages**.
4. Choose branch: `main`.
5. Choose folder: `/root`.
6. Save.
7. GitHub will publish a prototype URL.

Use this for previewing and sharing the proof of concept.

## Cloudflare Pages later

When ready for a more production-appropriate static host:

1. Keep the GitHub repo.
2. Create a Cloudflare Pages project.
3. Connect the GitHub repo.
4. Framework preset: None.
5. Build command: leave blank.
6. Output directory: `/`.
7. Deploy.

After that, normal updates are:

```text
edit files → commit/push to GitHub → Cloudflare redeploys automatically
```

## Checkout links

The prototype uses `checkoutUrl: "#"` in `data/products.json`.

Replace that value with a real hosted checkout URL later, such as:

- Stripe Payment Link
- Shopify product or Buy Button link
- Fourthwall product link
- POD vendor product link

The static site should not handle credit card data.
