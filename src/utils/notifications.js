import { collection, addDoc, doc, updateDoc, serverTimestamp, query, where, getDocs, orderBy , deleteDoc} from "firebase/firestore";
import { db } from "../firebase";


export async function sendNotification(userId, type, title, message, data = {}) {
  try {
    const notificationsRef = collection(db, "notifications");
    await addDoc(notificationsRef, {
      userId,
      type,
      title,
      message,
      data,
      read: false,
      createdAt: serverTimestamp(),
    });
    console.log(`Notification sent to user ${userId}: ${title}`);
  } catch (err) {
    console.error("Error sending notification:", err);
    throw err;
  }
}


export async function getUserNotifications(userId, unreadOnly = false) {
  try {
    const notificationsRef = collection(db, "notifications");
    let q = query(
      notificationsRef,
      where("userId", "==", userId),
      orderBy("createdAt", "desc")
    );

    if (unreadOnly) {
      q = query(
        notificationsRef,
        where("userId", "==", userId),
        where("read", "==", false),
        orderBy("createdAt", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return [];
  }
}


export async function markNotificationAsRead(notificationId) {
  try {
    const notificationRef = doc(db, "notifications", notificationId);
    await updateDoc(notificationRef, {
      read: true,
      readAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error marking notification as read:", err);
  }
}

export async function deleteNotification(notificationId) {
  try{
    const notificationRef = doc(db, "notifications", notificationId);
    await deleteDoc(notificationRef);
    console.log(`Notification ${notificationId} deleted successfully.`);

  } catch(err){
    console.error("Error deleting notification:", err);
  }
}
