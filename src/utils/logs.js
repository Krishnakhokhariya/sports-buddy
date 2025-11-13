import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export async function addLog({
  actorUid = null,
  action,
  targetCollection = null,
  targetId = null,
  details = null,
}) {
  try {
    const logsRef = collection(db, "logs");
    const docRef = await addDoc(logsRef, {
      actorUid,
      action,
      targetCollection,
      targetId,
      details,
      timestamp: serverTimestamp(),
    });
    console.log(`Log added for ${action}`);
  } catch (err) {
    console.error(`Failed to log action`, err);
  }
}
