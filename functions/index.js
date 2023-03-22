const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.sendPushNotification = functions.firestore
  .document("alert/{alertId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();

    console.log(message);

    const { caregiver, family, to, title, subtitle } = message?.alert ?? {};
    const userType = caregiver === to ? "caregiver" : "family";

    const userRef = admin.firestore().collection(userType).doc(to);

    const userSnapshot = await userRef.get();
    if (!userSnapshot.exists) {
      throw new Error(`${userType} with ID ${to} does not exist.`);
    }
    const userData = userSnapshot.data();

    console.log(userData);

    const { notificationToken } = userData ?? {};

    if (notificationToken) {
      const payload = {
        notification: {
          title: title,
          body: subtitle,
          sound: "default",
        },
        data: {
          click_action: "FLUTTER_NOTIFICATION_CLICK",
          messageData: message,
        },
      };

      console.log(payload);

      admin.messaging().sendToDevice(notificationToken, payload);
      return;
    } else {
      return;
    }
  });
