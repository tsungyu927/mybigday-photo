import firebase from "firebase/app";
import "firebase/storage";

const firebaseConfig = {
  // apiKey: "AIzaSyADAuqmwFCK3WK1miJsCr3CJgL0vWiGWbI",
  // authDomain: "photo-printer-d994c.firebaseapp.com",
  // databaseURL: "https://photo-printer-d994c.firebaseio.com",
  // projectId: "photo-printer-d994c",
  // storageBucket: "photo-printer-d994c.appspot.com",
  // messagingSenderId: "631706143354",
  // appId: "1:631706143354:web:090ab69853dc8855d049c3",
  // measurementId: "G-MRBH756FJM",
  apiKey: "AIzaSyCoSlffhoAgth4cTb8yfWN-zSKbNRn8NAk",
  authDomain: "mybigday-photo-printer-dev.firebaseapp.com",
  databaseURL: "https://mybigday-photo-printer-dev.firebaseio.com",
  projectId: "mybigday-photo-printer-dev",
  storageBucket: "mybigday-photo-printer-dev.appspot.com",
  messagingSenderId: "760519780822",
  appId: "1:760519780822:web:877510011c726f4c649c77",
  measurementId: "G-QMKF9MC23Y",
};

firebase.initializeApp(firebaseConfig);

const storage = firebase.storage();

export { storage, firebase as default };
