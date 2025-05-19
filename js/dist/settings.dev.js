"use strict";

var _firebaseApp = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-app.js");

var _firebaseAuth = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-auth.js");

var _firebaseDatabase = require("https://www.gstatic.com/firebasejs/11.7.3/firebase-database.js");

// Firebase config
var firebaseConfig = {
  apiKey: "AIzaSyD3GvlENwkMR6Khab1g-qT6WukrCVUwGSs",
  authDomain: "nexinnovation-login.firebaseapp.com",
  projectId: "nexinnovation-login",
  storageBucket: "nexinnovation-login.firebasestorage.app",
  messagingSenderId: "558802849966",
  appId: "1:558802849966:web:4339bb803ed781a5ecdd3f",
  measurementId: "G-5NVJF3R8D8",
  databaseURL: "https://nexinnovation-login-default-rtdb.firebaseio.com/"
}; // Initialize Firebase

var app = (0, _firebaseApp.initializeApp)(firebaseConfig);
var auth = (0, _firebaseAuth.getAuth)(app);
var db = (0, _firebaseDatabase.getDatabase)(app); // Check user auth

(0, _firebaseAuth.onAuthStateChanged)(auth, function (user) {
  if (!user) {
    window.location.replace("index.html");
  }
}); // Save WiFi data

window.saveWifi = function () {
  var ssid = document.getElementById("ssid").value.trim();
  var password = document.getElementById("password").value.trim();

  if (!ssid || !password) {
    document.getElementById("status").innerText = "Please enter both SSID and Password.";
    return;
  }

  var wifiRef = (0, _firebaseDatabase.ref)(db, "config/wifi");
  (0, _firebaseDatabase.set)(wifiRef, {
    ssid: ssid,
    password: password
  }).then(function () {
    document.getElementById("status").innerText = "✅ WiFi settings saved!";
  })["catch"](function (error) {
    document.getElementById("status").innerText = "❌ Failed: " + error.message;
  });
};