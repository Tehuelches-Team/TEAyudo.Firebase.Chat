importScripts("https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js");
importScripts(
  "https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js"
);

firebase.initializeApp({
  apiKey: "AIzaSyB-Cz9vVzOXzmu-6Uy5BrzXgXDGanqGcfU",
  authDomain: "chatteayudo.firebaseapp.com",
  databaseURL: "https://chatteayudo-default-rtdb.firebaseio.com",
  projectId: "chatteayudo",
  storageBucket: "chatteayudo.appspot.com",
  messagingSenderId: "738482409566",
  appId: "1:738482409566:web:55c4874af17f03b2da24cf",
});

const messaging = firebase.messaging();

// [START messaging_on_background_message]

messaging.onBackgroundMessage((payload) => {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );
  // Customize notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png",
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
// [END messaging_on_background_message]
