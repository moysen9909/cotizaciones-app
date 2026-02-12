import { initializeApp } from "firebase/app";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  onSnapshot,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAkyKupv35OzziJrWRiv3ySdxJ0TxfQWKA",
  authDomain: "quotes-app-dc055.firebaseapp.com",
  projectId: "quotes-app-dc055",
  storageBucket: "quotes-app-dc055.firebasestorage.app",
  messagingSenderId: "367638722074",
  appId: "1:367638722074:web:d8e73f27d3b59d859c83a3",
  measurementId: "G-GJ3PZ7SX0W",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/* ── helpers ────────────────────────────────────────── */

const QUOTES_DOC = "appData/quotes";
const CLIENTS_DOC = "appData/clients";

/** Save quotes array to Firestore */
export async function saveQuotes(quotes) {
  try {
    await setDoc(doc(db, "appData", "quotes"), { data: JSON.stringify(quotes) });
  } catch (e) {
    console.error("saveQuotes error:", e);
  }
}

/** Save clients array to Firestore */
export async function saveClients(clients) {
  try {
    await setDoc(doc(db, "appData", "clients"), { data: JSON.stringify(clients) });
  } catch (e) {
    console.error("saveClients error:", e);
  }
}

/** Load quotes array from Firestore (one-time) */
export async function loadQuotes() {
  try {
    const snap = await getDoc(doc(db, "appData", "quotes"));
    if (snap.exists()) return JSON.parse(snap.data().data);
  } catch (e) {
    console.error("loadQuotes error:", e);
  }
  return null;
}

/** Load clients array from Firestore (one-time) */
export async function loadClients() {
  try {
    const snap = await getDoc(doc(db, "appData", "clients"));
    if (snap.exists()) return JSON.parse(snap.data().data);
  } catch (e) {
    console.error("loadClients error:", e);
  }
  return null;
}

/** Subscribe to real-time quotes changes */
export function onQuotesChange(callback) {
  return onSnapshot(doc(db, "appData", "quotes"), (snap) => {
    if (snap.exists()) {
      try {
        callback(JSON.parse(snap.data().data));
      } catch (e) {
        console.error("onQuotesChange parse error:", e);
      }
    }
  });
}

/** Subscribe to real-time clients changes */
export function onClientsChange(callback) {
  return onSnapshot(doc(db, "appData", "clients"), (snap) => {
    if (snap.exists()) {
      try {
        callback(JSON.parse(snap.data().data));
      } catch (e) {
        console.error("onClientsChange parse error:", e);
      }
    }
  });
}
