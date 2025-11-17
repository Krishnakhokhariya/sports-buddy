import { collection, addDoc, serverTimestamp, query, orderBy, getDocs } from "firebase/firestore";
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

export async function getAllLogs() {
  const q = query(collection(db, "logs"), orderBy("timestamp", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
