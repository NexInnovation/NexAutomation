"use strict";

var _firebaseApp = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js");

var _firebaseAuth = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js");

// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
  authDomain: "nexinnovation-login.firebaseapp.com",
  projectId: "nexinnovation-login",
  storageBucket: "nexinnovation-login.firebasestorage.app",
  messagingSenderId: "558802849966",
  appId: "1:558802849966:web:4339bb803ed781a5ecdd3f",
  measurementId: "G-5NVJF3R8D8"
}; // Init Firebase

var app = (0, _firebaseApp.initializeApp)(firebaseConfig);
var auth = (0, _firebaseAuth.getAuth)(app); // Protect the dashboard

(0, _firebaseAuth.onAuthStateChanged)(auth, function (user) {
  if (!user) {
    // Not logged in → redirect to login page
    window.location.replace("index.html");
  } else {
    // Show user email
    document.getElementById("user-email").innerText = "Logged in as: ".concat(user.email);
  }
}); // Logout function

window.logoutUser = function _callee() {
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          _context.next = 2;
          return regeneratorRuntime.awrap((0, _firebaseAuth.signOut)(auth));

        case 2:
          window.location.replace("index.html");

        case 3:
        case "end":
          return _context.stop();
      }
    }
  });
};