import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc,query,where } from "firebase/firestore";
import { db } from "../firebase";

export async function getAllAreas() {
  const snap = await getDocs(collection(db, "areas"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createArea(data) {
  const ref = await addDoc(collection(db, "areas"), data);
  return ref.id;
}

export async function updateArea(id, data) {
  await updateDoc(doc(db, "areas", id), data);
}

export async function deleteArea(id) {
  await deleteDoc(doc(db, "areas", id));
}

export async function getAreasByCity(cityName) {
  const q = query(collection(db, "areas"), where("city", "==", cityName));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}