# Panelwear Market Static Prototype v2

A GitHub-friendly static prototype for a title-forward indie comics merch hub.

## What this is

This is a proof-of-concept storefront experience for independent comic creator merchandise.

It demonstrates:

- A real landing page
- A searchable shop/catalog
- Title-first browsing
- Creator/publisher profiles
- Title detail pages
- Product modals
- Creator intake form scaffold
- External checkout placeholders
- Canva-ready image slots
- JSON-based content management

## File structure

```text
.
├── index.html
├── shop.html
├── titles.html
├── title.html
├── creators.html
├── how-it-works.html
├── creator-apply.html
├── assets/
│   ├── css/styles.css
│   ├── js/app.js
│   └── images/
├── data/
│   ├── products.json
│   ├── titles.json
│   └── creators.json
├── docs/
│   ├── canva-image-map.md
│   ├── creator-art-requirements.md
│   ├── deployment-guide.md
│   └── payout-model.md
└── .nojekyll
```

## How to edit products

Open `data/products.json`.

Each product has:

```json
{
  "id": "neon-gutter-launch-tee",
  "titleId": "neon-gutter",
  "creatorId": "brian-level-studio",
  "productName": "Issue #1 Launch Tee",
  "productType": "T-Shirt",
  "price": 32,
  "image": "assets/images/product-neon-gutter-tee.svg",
  "tags": ["cyberpunk", "crime", "launch drop"],
  "checkoutProvider": "placeholder",
  "checkoutUrl": "#",
  "status": "live",
  "description": "Product description here."
}
```

Replace `checkoutUrl` with a real payment/product link when ready.

## How to edit titles

Open `data/titles.json`.

Title detail pages use URLs like:

```text
title.html?id=neon-gutter
```

## How to edit images

Read:

```text
docs/canva-image-map.md
```

The current images are SVG placeholders. Replace them with Canva exports at the same ratio.

## Local preview

Because the site loads JSON with `fetch()`, run a local server:

```bash
python -m http.server 8080
```

Then open:

```text
http://localhost:8080
```

## Deployment

See:

```text
docs/deployment-guide.md
```

## Philosophy

Start with a low-cost, operator-managed model:

```text
GitHub repo
+ static host
+ JSON catalog
+ external checkout links
+ POD fulfillment
+ manual creator payout statements
```

Do not build a full marketplace until demand proves it.
