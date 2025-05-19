"use strict";

var _firebaseApp = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js");

var _firebaseAuth = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js");

// Firebase Config
var firebaseConfig = {
  apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
  authDomain: "nexinnovation-login.firebaseapp.com",
  projectId: "nexinnovation-login",
  storageBucket: "nexinnovation-login.firebasestorage.app",
  messagingSenderId: "558802849966",
  appId: "1:558802849966:web:4339bb803ed781a5ecdd3f",
  measurementId: "G-5NVJF3R8D8"
};
var app = (0, _firebaseApp.initializeApp)(firebaseConfig);
var auth = (0, _firebaseAuth.getAuth)(app); // ✅ Auto-redirect if already logged in

(0, _firebaseAuth.onAuthStateChanged)(auth, function (user) {
  if (user) {
    window.location.replace("dashboard.html");
  }
}); // ✅ Login form handler (existing)

document.querySelector('.login100-form').addEventListener('submit', function _callee(e) {
  var email, password, remember, persistenceType;
  return regeneratorRuntime.async(function _callee$(_context) {
    while (1) {
      switch (_context.prev = _context.next) {
        case 0:
          e.preventDefault();
          email = document.getElementById('email').value.trim();
          password = document.getElementById('password').value.trim();
          remember = document.getElementById('rememberMe').checked;
          persistenceType = remember ? _firebaseAuth.browserLocalPersistence : _firebaseAuth.browserSessionPersistence;
          _context.prev = 5;
          _context.next = 8;
          return regeneratorRuntime.awrap((0, _firebaseAuth.setPersistence)(auth, persistenceType));

        case 8:
          _context.next = 10;
          return regeneratorRuntime.awrap((0, _firebaseAuth.signInWithEmailAndPassword)(auth, email, password));

        case 10:
          window.location.href = "dashboard.html";
          _context.next = 16;
          break;

        case 13:
          _context.prev = 13;
          _context.t0 = _context["catch"](5);
          alert("Login failed: " + _context.t0.message);

        case 16:
        case "end":
          return _context.stop();
      }
    }
  }, null, null, [[5, 13]]);
});