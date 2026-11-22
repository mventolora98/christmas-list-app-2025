# Wishlist Firestore import

This is an **admin-only local script**, not a public web page. It does not modify the live website. It targets Firebase project `marcs-christmas-list`, collection `wishlist2026`.

1. Edit `wishlist-items.json` with your actual wishlist items. The initial `gift-2026-01` is a placeholder for the existing document and will be skipped during import. Do not import until the rest of the list has been reviewed.
2. On a trusted computer with Node.js 20+, run `npm install --no-save firebase-admin` from the repository root.
3. Authenticate using Google Cloud Application Default Credentials with authorized Firestore write access (for example, `gcloud auth application-default login` using an authorized account). Never commit credential files or keys to GitHub.
4. Run `node scripts/import-wishlist.mjs` to preview. No Firestore connection is made in preview mode.
5. After verifying project, item IDs and data, run `node scripts/import-wishlist.mjs --apply` to create only missing documents.

The importer validates input, uses Firestore `create()` to skip documents that already exist, and never resets an existing purchase count. `giftcard` is the schema type for unlimited gift cards; the website must implement unlimited purchase behavior separately. Anonymous purchasing also requires separate website and security-rule changes; this importer alone does not enable those features.

**Security:** Do not publish a browser-based admin importer with unrestricted Firestore writes. Limit admin write permissions and test your Firestore rules before deploying any public purchasing UI.
