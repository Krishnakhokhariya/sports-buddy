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

  //notify all users about new event
  try {
    if (eventData.createdBy) {
      const creatorSnap = await getDoc(doc(db, "users", eventData.createdBy));
      const creatorData = creatorSnap.exists() ? creatorSnap.data() : null;
      const creatorName =
        creatorData?.name || creatorData?.displayName || "A SportBuddy user";
      const userSanp = await getDocs(collection(db, "users"));

      for (const userDoc of userSanp.docs) {
        const userId = userDoc.id;
        if (userId === eventData.createdBy) continue;

        await sendNotification(
          userId,
          "new_event",
          "New Event Posted",
          `${creatorName} has posted a new event: "${
            eventData.title || "Sports Event"
          }". Check it out!`,
          {
            eventId: docRef.id,
            eventTitle: eventData.title || "",
            creatorName,
            creatorId: eventData.createdBy,
          }
        );
      }
    }
  } catch (err) {
    console.error("Error sending new event notifications:", err);
  }
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

  //notify event creator about join request
  try{
    const eventSnap = await getDoc(eventRef);
    if(eventSnap.exists()){
      const eventdata = eventSnap.data();
      const creatorId = eventdata.createdBy;
      if(creatorId && creatorId !== profile.uid){
        const attendeeName = profile.name || profile.displayName || "A SportBuddy user";

        await sendNotification(
          creatorId,
          "join_request",
          "New Join Request",
          `${attendeeName} has requested to join your event: "${eventTitle || eventData.title || "Sports Event"}".`,
          {
            eventId,
            eventTitle: eventTitle || eventdata.title || "",
            attendeeId: profile.uid,
            attendeeName,
            creatorId,
          }
        );
      }
    }
  } catch(err){
    console.error("Error sending join request notification:", err);
  }

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

  console.log(
    `Profile ${profile.uid} requested to join event ${eventId} (pending)`
  );
}

//accept attendee request (event creator only)
export async function acceptAttendeeRequest(
  eventId,
  attendeeId,
  profile,
  eventTitle = ""
) {
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
    const attendeeProfile = attendeeProfileSnap.exists()
      ? attendeeProfileSnap.data()
      : null;

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

  console.log(
    `Profile ${profile.uid} accepted attendee ${attendeeId} for event ${eventId}`
  );
}

export async function rejectAttendeeRequest(eventId, attendeeId, profile, eventTitle = "") {
  const attendeeRef = doc(db, `events/${eventId}/attendees`, attendeeId);
  const eventRef = doc(db, "events", eventId);

  // Check attendee status
  const attendeeSnap = await getDoc(attendeeRef);
  const wasAccepted =
    attendeeSnap.exists() && attendeeSnap.data().status === "accepted";

  // Remove from attendees subcollection
  await deleteDoc(attendeeRef);

  // Remove from attendees array
  await updateDoc(eventRef, {
    attendees: arrayRemove(attendeeId),
  });

  // If previously accepted, remove from accepted list
  if (wasAccepted) {
    await updateDoc(eventRef, {
      accepted: arrayRemove(attendeeId),
    });
  }

  // Send notification to attendee
  try {
    const creatorName = profile.name || profile.displayName || "Event Creator";

    await sendNotification(
      attendeeId,
      "request_rejected",
      "Request Rejected",
      `Your participation in "${eventTitle}" has been removed by ${creatorName}`,
      {
        eventId,
        eventTitle,
        creatorName,
        creatorId: profile.uid,
      }
    );
  } catch (err) {
    console.error("Error sending notification:", err);
  }

  // Log
  await addLog({
    actorUid: profile.uid,
    action: wasAccepted
      ? "rejectAfterAccept"
      : "rejectAttendeeRequest",
    targetCollection: "events",
    targetId: eventId,
    details: {
      attendeeId: attendeeId,
      eventTitle: eventTitle || "",
    },
  });

  console.log(
    `Profile ${profile.uid} rejected attendee ${attendeeId} for event ${eventId} (wasAccepted: ${wasAccepted})`
  );
}


//reject attendee request (event creator only)
// export async function rejectAttendeeRequest(
//   eventId,
//   attendeeId,
//   profile,
//   eventTitle = ""
// ) {
//   const attendeeRef = doc(db, `events/${eventId}/attendees`, attendeeId);
//   const eventRef = doc(db, "events", eventId);

//   // Remove from subcollection
//   await deleteDoc(attendeeRef);

//   // Remove from attendees array
//   await updateDoc(eventRef, {
//     attendees: arrayRemove(attendeeId),
//   });

//   // Send notification to attendee
//   try {
//     const attendeeProfileSnap = await getDoc(doc(db, "users", attendeeId));
//     const attendeeProfile = attendeeProfileSnap.exists()
//       ? attendeeProfileSnap.data()
//       : null;

//     const creatorName = profile.name || profile.displayName || "Event Creator";

//     await sendNotification(
//       attendeeId,
//       "request_rejected",
//       "Request Rejected",
//       `Your request for "${eventTitle}" has been rejected by ${creatorName}`,
//       {
//         eventId: eventId,
//         eventTitle: eventTitle,
//         creatorName: creatorName,
//         creatorId: profile.uid,
//       }
//     );
//   } catch (err) {
//     console.error("Error sending notification:", err);
//   }

//   await addLog({
//     actorUid: profile.uid,
//     action: "rejectAttendeeRequest",
//     targetCollection: "events",
//     targetId: eventId,
//     details: {
//       attendeeId: attendeeId,
//       eventTitle: eventTitle || "",
//     },
//   });

//   console.log(
//     `Profile ${profile.uid} rejected attendee ${attendeeId} for event ${eventId}`
//   );
// }

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
  const wasAccepted =
    attendeeSnap.exists() && attendeeSnap.data().status === "accepted";

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
