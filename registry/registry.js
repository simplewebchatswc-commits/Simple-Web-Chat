import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
      getDatabase,
      ref,
      get,
      child,
      set
    } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";


const firebaseConfig = {
  apiKey: "AIzaSyAPFdATsgDJkBZuyV9eXfFX_sxydV6noVM",
  authDomain: "simple-web-chat-b7d54.firebaseapp.com",
  projectId: "simple-web-chat-b7d54",
  storageBucket: "simple-web-chat-b7d54.firebasestorage.app",
  messagingSenderId: "1068369997075",
  appId: "1:1068369997075:web:304a059ad39db5a71a3ee6",
  measurementId: "G-56F8MB8QQB"
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app, "https://simple-web-chat-b7d54-default-rtdb.firebaseio.com/")
const userDB = ref(db, "users");


async function getUsers(){
    const snapshot = await get(userDB);
    if (!snapshot.exists()) return []; // no data, return empty array

    const items = [];
    snapshot.forEach(childSnap => {
      items.push({
        key: childSnap.key,
        data: childSnap.val()
      });
    });
    return items;
}

let searchableUsers = [];
async function getUserProfiles(){
    let users = await getUsers();
    for (let i = 0; i < users.length; i ++){
      let userdata = users[i].data
      searchableUsers[i] = {name: userdata.name, email: userdata.email};
    }
    console.log(searchableUsers);
}
getUserProfiles()

//connect to html
const searchInput = document.getElementById("searchInput");
const results = document.getElementById("results");

searchInput.addEventListener("input", () => {
  const query = searchInput.value.toLowerCase();
  results.innerHTML = "";

  if (query === "") return;

  const filtered = searchableUsers.filter(user =>
    user.name.toLowerCase().includes(query) ||
    user.email.toLowerCase().includes(query)
  );

  filtered.forEach(user => {
    const li = document.createElement("li");
    li.textContent = `${user.name} - ${user.email}`;
    results.appendChild(li);
  });

  if (filtered.length === 0) {
    results.innerHTML = "<li>No matches found.</li>";
  }
});

