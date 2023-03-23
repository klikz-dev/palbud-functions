const functions = require("firebase-functions");

const admin = require("firebase-admin");
admin.initializeApp();

const { Expo } = require("expo-server-sdk");
const expo = new Expo();

exports.sendPushNotification = functions.firestore
  .document("alert/{alertId}")
  .onCreate(async (snap, context) => {
    const message = snap.data();

    const { caregiver, family, to, title, subtitle } = message?.alert ?? {};
    const userType =
      caregiver === to ? "caregiver" : family === to ? "family" : "";

    if (userType) {
      const userRef = admin.firestore().collection(userType).doc(to);

      const userSnapshot = await userRef.get();
      if (!userSnapshot.exists) {
        throw new Error(`${userType} with ID ${to} does not exist.`);
      }
      const userData = userSnapshot.data();

      const { notificationToken } = userData ?? {};

      if (notificationToken) {
        const alerts = [
          {
            to: notificationToken,
            sound: "default",
            title: "Palbud Notification",
            body: title,
          },
        ];

        console.log(alerts);
        const response = await expo.sendPushNotificationsAsync(alerts);
        console.log(response);
      }
    }

    return;
  });
