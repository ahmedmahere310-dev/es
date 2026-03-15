// fire.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue, push, set, remove, update, get } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCGnyVjU_sfU3KfVHW-wyBzE5ufJHFXL8s",
  authDomain: "es-store-409a3.firebaseapp.com",
  databaseURL: "https://es-store-409a3-default-rtdb.firebaseio.com",
  projectId: "es-store-409a3",
  storageBucket: "es-store-409a3.firebasestorage.app",
  messagingSenderId: "175100432019",
  appId: "1:175100432019:web:42754dcbeca82c638c4766",
  measurementId: "G-8WFPVCZ9BP"
};

const app = initializeApp(firebaseConfig);
const rdb = getDatabase(app);
const DB_ROOT = "es_store_v1";

export { rdb, ref, onValue, push, set, remove, update, get, DB_ROOT };
