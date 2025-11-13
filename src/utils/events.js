import { collection, doc, setDoc, deleteDoc, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import React from 'react'
import { addLog } from "./logs";

//add new event
export async function addEvent(eventData) {
    const col = collection(db, 'events');
    const docRef = await addDoc(col,{
        ...eventData,
        createdAt: serverTimestamp(),
    });
  return docRef.id;
}

//fetch all events
export async function getAllEvents(){
  const querySnapshot = await getDocs(collection(db, 'events'));
  const events = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return events;
}

//join event
export async function joinEvent(eventId, user){
  const attendee = doc(db, `events/${eventId}/attendees`, user.uid)

  await setDoc(attendee, {
    joinedAt: serverTimestamp(),
    displayName: user.displayName || "Anonymous",
    email: user.email || '',
  });

  await addLog({
    actorUid: user.uid,
    action: 'joinEvent',
    targetCollection: 'events',
    targetId: eventId,
    details: { displayName: user.displayName || "" },
  });

  console.log(`User ${user.uid} joined event ${eventId}`)
}

//leave event
export async function leaveEvent(eventId, userUid){
  const attendee = doc(db,`events/${eventId}/attendees`, userUid)
  await deleteDoc(attendee);

  await addLog({
    actorUid: userUid,
    action: 'leaveEvent',
    targetCollection: 'events',
    targetId: eventId,
  })

  console.log(`User ${userUid} left event ${eventId}`)
}


