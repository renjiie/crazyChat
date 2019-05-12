import firebase from 'firebase/app';
import "firebase/auth";
import "firebase/database";
import "firebase/storage";

var firebaseConfig = {
    apiKey: "AIzaSyBmmtMeSsqO6lt3Q-mN63te2V1V19yWLIc",
    authDomain: "react-chat-app95.firebaseapp.com",
    databaseURL: "https://react-chat-app95.firebaseio.com",
    projectId: "react-chat-app95",
    storageBucket: "react-chat-app95.appspot.com",
    messagingSenderId: "810600566484",
    appId: "1:810600566484:web:f1e86075808b0ed0"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);

  export default firebase