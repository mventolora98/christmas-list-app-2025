const {onCall,HttpsError}=require("firebase-functions/v2/https");
const admin=require("firebase-admin");
admin.initializeApp();
const db=admin.firestore();
exports.setGiftClaim=onCall({region:"us-central1"},async(request)=>{
 if(!request.auth)throw new HttpsError("unauthenticated","Google sign-in required.");
 const {giftId,action}=request.data||{};
 if(typeof giftId!=="string"||!/^gift-2026-\d{2}$/.test(giftId)||!["claim","undo"].includes(action))throw new HttpsError("invalid-argument","Invalid request.");
 const uid=request.auth.uid;
 const giftRef=db.doc("wishlist2026/"+giftId);
 const claimRef=db.doc("wishlistClaims2026/"+giftId+"_"+uid);
 return db.runTransaction(async tx=>{
  const [giftSnap,claimSnap]=await Promise.all([tx.get(giftRef),tx.get(claimRef)]);
  if(!giftSnap.exists)throw new HttpsError("not-found","Gift not found.");
  const gift=giftSnap.data();
  const count=gift.purchasedCount;
  if(!Number.isSafeInteger(count)||count<0||!["regular","giftCard"].includes(gift.type))throw new HttpsError("failed-precondition","Invalid catalog record.");
  const active=claimSnap.exists&&claimSnap.data().active===true;
  if(action==="claim"){
   if(active)return {purchasedCount:count,alreadyClaimed:true};
   if(gift.type==="regular"&&count!==0)throw new HttpsError("already-exists","Gift already purchased.");
   tx.set(claimRef,{giftId,uid,active:true,updatedAt:admin.firestore.FieldValue.serverTimestamp()});
   tx.update(giftRef,{purchasedCount:count+1});
   return {purchasedCount:count+1};
  }
  if(!active)return {purchasedCount:count,alreadyUndone:true};
  if(count<1)throw new HttpsError("failed-precondition","Purchase count inconsistent.");
  tx.update(claimRef,{active:false,updatedAt:admin.firestore.FieldValue.serverTimestamp()});
  tx.update(giftRef,{purchasedCount:count-1});
  return {purchasedCount:count-1};
 });
});
