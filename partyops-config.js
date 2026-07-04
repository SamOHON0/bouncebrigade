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
  // Testing branch deployment + staging Supabase business (Test Castles Co).
  // Revert to https://partyops.app + the prod business id after testing.
  origin: "https://partyops-git-testing-sam-2702s-projects.vercel.app",
  businessId: "5657734f-27b0-4467-8471-7edc6fc62855",
  fallbackCatalogue: "catalogue.json"
};
