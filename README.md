# Bounce Brigade (PartyOps test site)

A fabricated bouncy castle site used to test PartyOps end to end. The castles are
not hardcoded. They are pulled live from a running PartyOps instance, and clicking
one opens the real PartyOps booking widget.

Everything about the brand (Bounce Brigade, County Marlow, phone, email) is
fictional. Only the PartyOps connection is real.

## Configure

Edit `partyops-config.js`:

```js
window.PARTYOPS = {
  origin: "http://localhost:3000",                    // where PartyOps runs
  businessId: "a12eb699-71ba-413c-b93d-01190296aa36", // which business to show
  fallbackCatalogue: "catalogue.json"                 // offline-only fallback
};
```

The default `businessId` is the seeded "Galway Bouncy Castles" business from
PartyOps migration `009`, so the site shows real castles the moment PartyOps is
running with migrations applied. Point `origin` at your deployed PartyOps domain
to test against production.

## Run

1. Start PartyOps (`npm run dev` in the PartyOps repo, migrations applied).
2. Open this site. Any static server works, or just open `index.html`.
3. The home and castles pages fill with castles fetched from PartyOps.
4. Click a castle, or use the contact page, to book through the PartyOps widget.

A green status line means it is live. A yellow line means PartyOps could not be
reached and the site fell back to the local `catalogue.json` so it is not blank.

## How it feeds from PartyOps

It uses PartyOps' public, CORS-enabled contract:

- `GET {origin}/api/products?business_id={uuid}` lists the castles. Each card is
  built from `name`, `description`, `price_per_day`, `image_url`,
  `quantity_available` and `delivery_fee`. A price of 0 shows as "Call for price".
- Clicking a castle opens `{origin}/embed/{businessId}?item={slug}` in a modal.
  That is PartyOps' own booking widget: availability, dates and payment all run
  inside it, and bookings land in the PartyOps dashboard.
- The contact page loads PartyOps' official `widget.js` drop-in directly.

### Slugs

Deep-linking a specific castle uses the product `slug`. The public products API
does not return slugs, so the site derives one from the name with the same rules
PartyOps used to seed Galway (verified against all 18 seeded items). If a derived
slug does not match, the widget just opens on the full list instead of breaking.

## Files

- `partyops-config.js` connection settings (edit this)
- `partyops.js` fetches products, renders clickable cards, runs the booking modal
- `index.html`, `castles.html` live castle grids (`data-partyops-grid`)
- `contact.html` official PartyOps `widget.js` embed
- `catalogue.json` offline fallback only
- `areas.html`, `about.html`, area pages static content
