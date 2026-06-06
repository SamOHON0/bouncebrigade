/*
 * PartyOps connection settings for this test site.
 *
 *   origin     : where PartyOps runs (no trailing slash)
 *   businessId : the Bounce Brigade business UUID in PartyOps
 *
 * Pointed at the Bounce Brigade business. If the castles do not show yet,
 * run partyops-seed-bouncebrigade.sql in the PartyOps Supabase SQL editor.
 */
window.PARTYOPS = {
  origin: "https://partyops.vercel.app",
  businessId: "40286761-83cb-4706-90dc-3158327e3f32",
  fallbackCatalogue: "catalogue.json"
};
