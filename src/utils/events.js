import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";
import { db } from "../firebase";
import { addLog } from "./logs";
import { sendNotification } from "./notifications";

//add new event
export async function addEvent(eventData) {
  const col = collection(db, "events");
  const docRef = await addDoc(col, {
    ...eventData,
    attendees: [],
    accepted: [],
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

  // Add to subcollection with pending status (request-based system)
  await setDoc(attendee, {
    status: "pending", 
    requestedAt: serverTimestamp(),
    displayName: profile.name || profile.displayName || "Anonymous",
    email: profile.email || "",
    joinedAt: serverTimestamp(), 
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
      status: "pending",
    },
  });

  console.log(`Profile ${profile.uid} requested to join event ${eventId} (pending)`);
}

//accept attendee request (event creator only)
export async function acceptAttendeeRequest(eventId, attendeeId, profile, eventTitle = "") {
  const attendeeRef = doc(db, `events/${eventId}/attendees`, attendeeId);
  const eventRef = doc(db, "events", eventId);

  // Update attendee status to accepted
  await updateDoc(attendeeRef, {
    status: "accepted",
    acceptedAt: serverTimestamp(),
  });

  // Add to accepted array in event document
  await updateDoc(eventRef, {
    accepted: arrayUnion(attendeeId),
  });

  // Send notification to attendee
  try {
    const attendeeProfileSnap = await getDoc(doc(db, "users", attendeeId));
    const attendeeProfile = attendeeProfileSnap.exists() ? attendeeProfileSnap.data() : null;
    
    const creatorName = profile.name || profile.displayName || "Event Creator";
    
    await sendNotification(
      attendeeId,
      "request_accepted",
      "Request Accepted",
      `Your request for "${eventTitle}" has been accepted by ${creatorName}`,
      {
        eventId: eventId,
        eventTitle: eventTitle,
        creatorName: creatorName,
        creatorId: profile.uid,
      }
    );
  } catch (err) {
    console.error("Error sending notification:", err);
    // Don't fail the accept operation if notification fails
  }

  await addLog({
    actorUid: profile.uid,
    action: "acceptAttendeeRequest",
    targetCollection: "events",
    targetId: eventId,
    details: {
      attendeeId: attendeeId,
      eventTitle: eventTitle || "",
    },
  });

  console.log(`Profile ${profile.uid} accepted attendee ${attendeeId} for event ${eventId}`);
}

//reject attendee request (event creator only)
export async function rejectAttendeeRequest(eventId, attendeeId, profile, eventTitle = "") {
  const attendeeRef = doc(db, `events/${eventId}/attendees`, attendeeId);
  const eventRef = doc(db, "events", eventId);

  // Remove from subcollection
  await deleteDoc(attendeeRef);

  // Remove from attendees array
  await updateDoc(eventRef, {
    attendees: arrayRemove(attendeeId),
  });

  // Send notification to attendee
  try {
    const attendeeProfileSnap = await getDoc(doc(db, "users", attendeeId));
    const attendeeProfile = attendeeProfileSnap.exists() ? attendeeProfileSnap.data() : null;
    
    const creatorName = profile.name || profile.displayName || "Event Creator";
    
    await sendNotification(
      attendeeId,
      "request_rejected",
      "Request Rejected",
      `Your request for "${eventTitle}" has been rejected by ${creatorName}`,
      {
        eventId: eventId,
        eventTitle: eventTitle,
        creatorName: creatorName,
        creatorId: profile.uid,
      }
    );
  } catch (err) {
    console.error("Error sending notification:", err);
    
  }

  await addLog({
    actorUid: profile.uid,
    action: "rejectAttendeeRequest",
    targetCollection: "events",
    targetId: eventId,
    details: {
      attendeeId: attendeeId,
      eventTitle: eventTitle || "",
    },
  });

  console.log(`Profile ${profile.uid} rejected attendee ${attendeeId} for event ${eventId}`);
}

//fetch attendee requests with optional status filter
export async function getEventAttendeeRequests(eventId, statusFilter = null) {
  const attendeesRef = collection(db, `events/${eventId}/attendees`);
  const attendeesSnap = await getDocs(attendeesRef);
  
  const attendees = [];
  attendeesSnap.forEach((doc) => {
    const data = doc.data();
    if (!statusFilter || data.status === statusFilter) {
      attendees.push({
        id: doc.id,
        ...data,
      });
    }
  });
  
  return attendees;
}

//leave event
export async function leaveEvent(eventId, profile, eventTitle = "") {
  const attendee = doc(db, `events/${eventId}/attendees`, profile.uid);
  const eventRef = doc(db, "events", eventId);

  const attendeeSnap = await getDoc(attendee);
  const wasAccepted = attendeeSnap.exists() && attendeeSnap.data().status === "accepted";

  await deleteDoc(attendee);

  await updateDoc(eventRef, {
    attendees: arrayRemove(profile.uid),
  });

  if (wasAccepted) {
    await updateDoc(eventRef, {
      accepted: arrayRemove(profile.uid),
    });
  }

  await addLog({
    actorUid: profile.uid,
    action: "leaveEvent",
    targetCollection: "events",
    targetId: eventId,
    details: {
      displayName: profile.displayName || "",
      eventTitle: eventTitle || "",
      wasAccepted: wasAccepted,
    },
  });

  console.log(`Profile ${profile.uid} left event ${eventId}`);
}
