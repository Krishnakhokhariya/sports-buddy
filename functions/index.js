const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.autoDeletePastEvents = functions.pubsub
  .schedule("every day 00:00")
  .timeZone("Asia/Kolkata")
  .onRun(async () => {
    const db = admin.firestore();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    console.log("Running cleanup - today's date:", today);

    const eventsSnap = await db.collection("events").get();

    const batch = db.batch();
    let deleteCount = 0;

    eventsSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.dateTime || !data.dateTime._seconds) return;

      const eventDate = new Date(data.dateTime._seconds * 1000);
      eventDate.setHours(0, 0, 0, 0);

      if (eventDate < today) {
        deleteCount++;
        console.log("Deleting event:", data.title, "ID:", doc.id);
        batch.delete(doc.ref);
      }
    });

    if (deleteCount > 0) {
      await batch.commit();
      console.log(`Deleted: ${deleteCount} old events.`);
    } else {
      console.log("No old events found.");
    }

    return null;
  });
