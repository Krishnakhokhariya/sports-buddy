import { collection, serverTimestamp, addDoc } from "firebase/firestore";
import {db} from "../firebase"

export async function logAction(userId, actionType, meta={}){
    try{
        await addDoc(collection(db, "logs"),{
            userId,
            actionType,
            meta,
            createdAt: serverTimestamp()
        });
    }catch(err){
        console.error("Failed to write log:", err)
    }
}