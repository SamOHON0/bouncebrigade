# Bounce Brigade (PartyOps test site)

A fabricated bouncy castle site used to test PartyOps end to end. Everything about
the brand (Bounce Brigade, County Marlow, phone, email) is fictional, and it runs
on its OWN PartyOps business with its OWN fake castles. It is not connected to
Galway or any real business.

## Current state

`partyops-config.js` has an empty `businessId`, so right now the site shows the
local fabricated `catalogue.json` and makes no calls to PartyOps at all. Follow
the steps below to put it on its own PartyOps business.

## Set up the Bounce Brigade business

1. Sign up a new account at https://partyops.app/admin/signup. Use a Bounce
   Brigade email (a throwaway is fine). This creates the business.
2. Open https://partyops.app/admin/embed and copy the `data-business-id` value
   from the snippet. That is your Bounce Brigade business_id.
3. Open `partyops-seed-bouncebrigade.sql`, find-and-replace every
   `__BUSINESS_ID__` with that UUID, then paste it into the Supabase SQL editor
   for the PartyOps project and run it. This loads the 8 fake castles. Images are
   self-contained icon data-URIs, so nothing needs hosting.
4. Put the business_id into `partyops-config.js` (`businessId: "..."`) and redeploy.

That's it. The castles page now feeds from Bounce Brigade's own PartyOps business,
and bookings land in the Bounce Brigade dashboard, never Galway's.

## How it feeds from PartyOps

Uses PartyOps' public, CORS-enabled contract:

- `GET {origin}/api/products?business_id={uuid}` lists the castles. Cards are built
  from `name`, `description`, `price_per_day`, `image_url`, `quantity_available`
  and `delivery_fee`. Price 0 shows as "Call for price".
- Clicking a castle opens `{origin}/embed/{businessId}?item={slug}` in a modal.
  Availability, dates and payment all run inside PartyOps' own booking widget.
- The contact page loads PartyOps' official `widget.js` drop-in.

If PartyOps is unreachable or `businessId` is empty, the site falls back to the
local `catalogue.json` so it is never blank.

## Files

- `partyops-config.js` connection settings (set businessId here)
- `partyops-seed-bouncebrigade.sql` the 8 fake castles, ready to run in Supabase
- `partyops.js` fetches products, renders clickable cards, runs the booking modal
- `index.html`, `castles.html` live castle grids
- `contact.html` official PartyOps widget.js embed
- `catalogue.json` offline fallback (the 8 fabricated castles)
- `areas.html`, `about.html`, area pages static content
