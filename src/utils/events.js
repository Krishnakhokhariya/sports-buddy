import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { addLog } from "./logs";

//add new event
export async function addEvent(eventData) {
  const col = collection(db, "events");
  const docRef = await addDoc(col, {
    ...eventData,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

//fetch all events
export async function getAllEvents() {
  const querySnapshot = await getDocs(collection(db, "events"));
  const events = querySnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
  return events;
}

//  delete event
export async function deleteEvent(eventId, profile, eventTitle = "") {
  const eventRef = doc(db, "events", eventId);
  await deleteDoc(eventRef);

  await addLog({
    actorUid: profile.uid,
    action: "delete_event",
    targetCollection: "events",
    targetId: eventId,
    details: { title: eventTitle || "" },
  });
}

//join event
export async function joinEvent(eventId, profile, eventTitle = "") {
  const attendee = doc(db, `events/${eventId}/attendees`, profile.uid);
  const eventRef = doc(db, "events", eventId);

  // Add to subcollection
  await setDoc(attendee, {
    joinedAt: serverTimestamp(),
    displayName: profile.name || profile.displayName || "Anonymous",
    email: profile.email || "",
  });

  // Update event's attendees array
  await updateDoc(eventRef, {
    attendees: arrayUnion(profile.uid),
  });

  await addLog({
    actorUid: profile.uid,
    action: "joinEvent",
    targetCollection: "events",
    targetId: eventId,
    details: {
      displayName: profile.displayName || "",
      eventTitle: eventTitle || "",
    },
  });

  console.log(`Profile ${profile.uid} joined event ${eventId}`);
}

//leave event
export async function leaveEvent(eventId, profile, eventTitle = "") {
  const attendee = doc(db, `events/${eventId}/attendees`, profile.uid);
  const eventRef = doc(db, "events", eventId);

  // Remove from subcollection
  await deleteDoc(attendee);

  // Update event's attendees array
  await updateDoc(eventRef, {
    attendees: arrayRemove(profile.uid),
  });

  await addLog({
    actorUid: profile.uid,
    action: "leaveEvent",
    targetCollection: "events",
    targetId: eventId,
    details: {
      displayName: profile.displayName || "",
      eventTitle: eventTitle || "",
    },
  });

  console.log(`Profile ${profile.uid} left event ${eventId}`);
}
