# Anonymous purchase and unlimited gift card specification

Status: design specification, not deployed.

## Display
- Regular gifts: Available or Purchased; never show buyer identity.
- Gift cards: always available (infinity symbol) and show aggregate Purchased ×N, including zero.
- Show purchased status to wishlist owner and guests, per product decision.
- Never show purchaser name, email, or UID in any public-facing response.

## Storage and security
- Use separate public gift catalog and private purchase/claim records.
- Public catalog may expose only aggregate status/count, never purchaser identifiers.
- Authenticated shopper can create a claim and undo only their own claim. A gift-card claim is a separate record per purchase.
- Enforce one active claim per regular gift with a server-side transaction or trusted backend; gift cards permit unlimited claims.
- Firestore security rules must prohibit reading other users' claims, and prohibit clients from writing aggregate counters directly.
- Aggregate status/count must be updated by trusted backend logic, not client-side unverified counts.
- Consider whether a purchased gift card is a claimed intent or confirmed purchase; UI should distinguish as needed.
- Do not carry over the existing boughtBy display to the new view; existing Firestore data and security rules need migration review.
- Test unauthorized reads, duplicate claim races, rollback, and mobile views before production.

## Wishlist
2026 seed data: data/wishlist-2026.json (17 entries).
