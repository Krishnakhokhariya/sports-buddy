import { collection, getDocs, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getAllEvents() {
  const snap = await getDocs(collection(db, "events"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function deleteEvent(id) {
  await deleteDoc(doc(db, "events", id));
}
