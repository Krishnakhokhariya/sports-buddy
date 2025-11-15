import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, serverTimestamp, query, orderBy } from "firebase/firestore";
import {db} from '../firebase';

const sportsCol = collection(db, "sports");

export async function getAllSports(){
    const q = query(sportsCol, orderBy("name"));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({id: d.id, ...d.data()}));
}

export async function createSport({name}){
    const docRef = await addDoc(sportsCol, {
        name,
        createdAt: serverTimestamp(),
    });
    return docRef.id;
}

export async function updateSport(id, {name}){
    await updateDoc(doc(db, "sports", id), {
        name,
        updatedAt: serverTimestamp()
     });
}

export async function deleteSport(id){
    await deleteDoc(doc(db, "sports", id));
}