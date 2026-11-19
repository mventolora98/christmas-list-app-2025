# Christmas & Birthday Wishlist 2026 — Development Plan

This branch is for the 2026 update. Do not merge or deploy until approved.

## Seed data
`data/wishlist-2026.json` contains 17 gift entries. Both Christmas and birthday are assigned as occasions so the same gift can appear in either view. The four Amazon short links are placeholders until their product names are verified.

## Proposed integration
1. Inspect the actual deployed application source and identify its current Firestore collections, authentication flow, and security rules. The existing repository may not contain the deployed application files.
2. Add an occasion filter (Christmas/Birthday) and render cards from wishlist data.
3. Add gift reservation/purchase tracking in Firestore. Only authenticated shoppers can reserve; the wishlist owner must not see surprise status.
4. Ensure reservation transactions prevent duplicate claims and Firestore rules restrict access.
5. Test mobile layouts and existing 2025 functionality; keep historical records intact.
6. Deploy a preview for review before production.

## Data notes
Prices and product images are intentionally unset rather than guessed. Clothing sizes and car fitment should be confirmed before purchases. Product URLs retain known size/variant parameters.
