// Import the functions you need from the SDKs you need
import {
  getDatabase,
  ref,
  set,
  runTransaction,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";
import { botones } from "../Controller/index.js";
import { NombreUsuario } from "../Controller/index.js";
import { Mensaje } from "../Controller/index.js";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import {
  getMessaging,
  getToken,
  onMessage,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-messaging.js";
import { Contenido } from "../Controller/index.js";
import { Formulario } from "../Controller/index.js";
// Add Firebase products that you want to use
import {
  getAuth,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
} from "https://www.gstatic.com/firebasejs/10.5.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB-Cz9vVzOXzmu-6Uy5BrzXgXDGanqGcfU",
  authDomain: "chatteayudo.firebaseapp.com",
  databaseURL: "https://chatteayudo-default-rtdb.firebaseio.com",
  projectId: "chatteayudo",
  storageBucket: "chatteayudo.appspot.com",
  messagingSenderId: "738482409566",
  appId: "1:738482409566:web:55c4874af17f03b2da24cf",
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const auth = getAuth(app);
//Inicializar servicio de mensajes de notificacion
export const messaging = getMessaging(app);
// Initialize Cloud Firestore and get a reference to the service
const db = getFirestore(app);
const MensajesRef = collection(db, "Mensajes");
const admin = require("firebase-admin");
//Metodo recibir mensajes en primer plano`
onMessage(messaging, (payload) => {
  console.log("Message received. ", payload);
  // ...
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/icon.png",
  };
  // self.registration.showNotification(notificationTitle, notificationOptions);
  window.alert(payload.notification.body);
});

//Pedir token para recibir notificaciones

getToken(messaging, {
  vapidKey:
    "BCPRBFQphzaDS7QPSoEqXw3Vn62zODm6eXK7i5MkRqsRcYi4G1LphtTK1Zouau9RAI1tYChpvJDvkBbg_IAr8yU",
})
  .then((currentToken) => {
    if (currentToken) {
      localStorage.setItem("token", currentToken);
      console.log(currentToken);
    } else {
      // Show permission request UI
      console.log(
        "No registration token available. Request permission to generate one."
      );
    }
  })
  .catch((err) => {
    console.log("An error occurred while retrieving token. ", err);
  });
//Verificar que el usuario este logueado
onAuthStateChanged(auth, (user) => {
  if (user) {
    console.log("Usuario logueado");
    botones.innerHTML = `<button class="btn btn-outline-success" id="btnLogout">Cerrar sesión</button>`;
    let displayName = user.displayName;
    let email = user.email;
    let emailVerified = user.emailVerified;
    let photoURL = user.photoURL;
    let isAnonymous = user.isAnonymous;
    let uid = user.uid;
    let providerData = user.providerData;
    Formulario.classList = "input-group py-3 fixed-bottom container-fluid";
    ContenidoChat(user);

    CerrarSesion();
  } else {
    console.log("Usuario no logueado");
    botones.innerHTML = `<button class="btn btn-outline-success" id="btnLogin">Iniciar sesión</button>`;
    IniciarSesion();
    NombreUsuario.innerHTML = "ChatTEAyudo";
    Formulario.classList =
      "input-group py-3 fixed-bottom container-fluid d-none";
  }
}); // <-- added closing parenthesis

const IniciarSesion = () => {
  const btnLogin = document.querySelector("#btnLogin");
  btnLogin.addEventListener("click", () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        console.log(result);
        console.log("Usuario logueado");
        botones.innerHTML = `<button class="btn btn-outline-success" id="btnLogout">Cerrar sesión</button>`;
        let displayName = result.user.displayName;
        let email = result.user.email;
        let emailVerified = result.user.emailVerified;
        let photoURL = result.user.photoURL;
        let isAnonymous = result.user.isAnonymous;
        let uid = result.user.uid;
        let providerData = result.user.providerData;
        NombreUsuario.innerHTML = displayName;
      })
      .catch((error) => {
        console.log(error);
      });
  });
};

const CerrarSesion = () => {
  const btnLogout = document.querySelector("#btnLogout");
  btnLogout.addEventListener("click", () => {
    auth.signOut();
    console.log("Usuario deslogueado");
    botones.innerHTML = `<button class="btn btn-outline-success" id="btnLogin">Iniciar sesión</button>`;
  });
};

const ContenidoChat = (user) => {
  Formulario.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!Mensaje.value.trim()) {
      console.log("Mensaje vacio");
      return;
    }
    console.log(Mensaje.value);
    try {
      await addDoc(collection(db, "Mensajes"), {
        uid: user.uid,
        NombreUsuario: user.displayName,
        fecha: new Date(),
        Mensaje: Mensaje.value,
        photoURL: user.photoURL,
        TokenNotificaciones: localStorage.getItem("token"),
      });
      console.log("Mensaje enviado", Mensaje.value);
      Mensaje.value = "";
      const message = {
        notification: {
          title: "Nuevo mensaje de " + user.displayName,
          body: Mensaje.value,
        },
        token: localStorage.getItem("token"),
      };
      const response = await firebase.messaging.send(message);
      if (response) {
        console.log("Notificacion enviada");
      } else {
        console.log("Notificacion no enviada");
      }
    } catch (error) {
      console.log(error);
    }

    //Traer los mensajes en tiempo real
    const q = query(collection(db, "Mensajes"), orderBy("fecha", "asc"));
    onSnapshot(q, (querySnapshot) => {
      const MensajesActualizados = [];
      Contenido.innerHTML = "";
      querySnapshot.forEach((doc) => {
        if (doc.data().uid === user.uid) {
          Contenido.innerHTML += `<div class="d-flex justify-content-end">
          <img src="${
            user.photoURL
          }" alt="" class="rounded float-end" width="20px" height="20px">
          <span class="badge rounded-pill text-bg-primary"
            >${doc.data().Mensaje}</span
          ></div>`;
        } else {
          Contenido.innerHTML += `<div class="d-flex justify-content-start">
          <img src="${
            doc.data().photoURL
          }" alt="" class="rounded float-end" width="20px" height="20px">
          <span class="badge rounded-pill bg-primary text-white"
            >${doc.data().Mensaje}</span
          ></div>`;
        }
        MensajesActualizados.push({
          id: doc.uid,
          ...doc.data(),
        });
      });
      console.log(MensajesActualizados);
    });
  });
};
