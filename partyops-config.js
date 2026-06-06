/*
 * PartyOps connection settings for this test site.
 * Change these two values to point the site at a different PartyOps instance / business.
 *
 *   origin     : where PartyOps is running (no trailing slash)
 *   businessId : the PartyOps business UUID whose castles this site shows
 *
 * Defaults below point at a local PartyOps dev server and the seeded
 * "Galway Bouncy Castles" business (migration 009), so the site works the
 * moment `npm run dev` is up with migrations applied.
 */
window.PARTYOPS = {
  origin: "https://partyops.app",
  businessId: "a12eb699-71ba-413c-b93d-01190296aa36",
  // Fallback shown only if PartyOps can't be reached (offline preview).
  fallbackCatalogue: "catalogue.json"
};
