/**
 * Firestore wishlist importer.
 * Requires Node.js 20+ and firebase-admin.
 * Uses Application Default Credentials; NEVER commit service-account keys.
 *
 * Preview: node scripts/import-wishlist.mjs
 * Import:  node scripts/import-wishlist.mjs --apply
 */
import { readFile } from "node:fs/promises";
import { initializeApp, applicationDefault } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const projectId = "marcs-christmas-list";
const apply = process.argv.includes("--apply");
const source = new URL("../wishlist-items.json", import.meta.url);
const items = JSON.parse(await readFile(source, "utf8"));
if (!Array.isArray(items)) throw new Error("wishlist-items.json must be an array");

function validate(item, index) {
  if (!item || typeof item !== "object" || Array.isArray(item)) throw new Error(`Item ${index} must be an object`);
  if (!/^gift-2026-[a-zA-Z0-9_-]+$/.test(item.id ?? "")) throw new Error(`Item ${index}: invalid id`);
  if (typeof item.name !== "string" || !item.name.trim()) throw new Error(`${item.id}: name required`);
  if (typeof item.category !== "string" || !item.category.trim()) throw new Error(`${item.id}: category required`);
  if (item.type !== "regular" && item.type !== "giftcard") throw new Error(`${item.id}: invalid type`);
  if (!Array.isArray(item.occasions) || !item.occasions.length || !item.occasions.every(x => ["christmas","birthday"].includes(x))) throw new Error(`${item.id}: invalid occasions`);
  if (item.url !== undefined && (typeof item.url !== "string" || (item.url && !/^https:\/\//.test(item.url)))) throw new Error(`${item.id}: url must be HTTPS`);
  if (item.priority !== undefined && !["normal","high","low"].includes(item.priority)) throw new Error(`${item.id}: invalid priority`);
  const allowed = ["id","name","category","type","occasions","url","priority"];
  if (Object.keys(item).some(k => !allowed.includes(k))) throw new Error(`${item.id}: unexpected field`);
  return {
    name: item.name.trim(),
    category: item.category.trim(),
    type: item.type,
    occasions: [...new Set(item.occasions)],
    priority: item.priority ?? "normal",
    purchasedCount: 0,
    url: item.url ?? ""
  };
}

const ids = new Set();
const entries = items.map((item, i) => {
  const data = validate(item, i);
  if (ids.has(item.id)) throw new Error(`Duplicate ID: ${item.id}`);
  ids.add(item.id);
  return { id: item.id, data };
});
console.log(`Validated ${entries.length} items. Mode: ${apply ? "IMPORT" : "PREVIEW ONLY"}`);
if (!apply) {
  for (const entry of entries) console.log("Would create if absent:", entry.id, entry.data.name);
  console.log("No database connection or writes made. Run with --apply after reviewing.");
} else {
  if (process.env.GOOGLE_CLOUD_PROJECT && process.env.GOOGLE_CLOUD_PROJECT !== projectId) {
    throw new Error("GOOGLE_CLOUD_PROJECT does not match the intended Firebase project");
  }
  initializeApp({ credential: applicationDefault(), projectId });
  const db = getFirestore();
  let created = 0, skipped = 0;
  for (const { id, data } of entries) {
    try {
      await db.collection("wishlist2026").doc(id).create(data);
      console.log("Created:", id);
      created++;
    } catch (err) {
      if (err.code === 6 || err.code === "already-exists") {
        console.log("Skipped existing:", id);
        skipped++;
      } else {
        throw err;
      }
    }
  }
  console.log(`Done: ${created} created, ${skipped} existing skipped.`);
}
