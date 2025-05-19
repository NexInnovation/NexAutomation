"use strict";

// Toggle dropdown menu visibility
document.getElementById('user-btn').addEventListener('click', function () {
  var menu = document.getElementById('dropdown-menu');
  menu.classList.toggle('hidden');
}); // Close dropdown when clicking outside

document.addEventListener('click', function (event) {
  var userBtn = document.getElementById('user-btn');
  var dropdown = document.getElementById('dropdown-menu');

  if (!userBtn.contains(event.target) && !dropdown.contains(event.target)) {
    dropdown.classList.add('hidden');
  }
});