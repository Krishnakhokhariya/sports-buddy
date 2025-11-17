import { collection, getDocs, addDoc, updateDoc, doc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase";

export async function getAllCities() {
  const snap = await getDocs(collection(db, "cities"));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function createCity(data) {
  const ref = await addDoc(collection(db, "cities"), data);
  return ref.id;
}

export async function updateCity(id, data) {
  await updateDoc(doc(db, "cities", id), data);
}

export async function deleteCity(id) {
  await deleteDoc(doc(db, "cities", id));
}
