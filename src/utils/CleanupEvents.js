import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

export async function deletePastEvents(currentUser) {
  if (!currentUser?.uid) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  try {
    const snap = await getDocs(collection(db, "events"));

    snap.forEach(async (eventDoc) => {
      const event = eventDoc.data();

      if (!event.dateTime?.seconds) return;

      const eventDate = new Date(event.dateTime.seconds * 1000);

     
      if (eventDate < today) {
        const isAdmin = currentUser.role === "admin";
        const isCreator = event.createdBy === currentUser.uid;

        
        if (isAdmin || isCreator) {
          await deleteDoc(doc(db, "events", eventDoc.id));
          console.log("Auto-deleted past event:", event.title);
        }
      }
    });
  } catch (err) {
    console.error("Error auto-deleting past events:", err);
  }
}
