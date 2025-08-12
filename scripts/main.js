// Initialize Firebase
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
const userDB = getDatabase(app, "https://simple-web-chat-b7d54-default-rtdb.firebaseio.com/")

//user login stuff
let loggedIn = false
let curUserName = null
let curUserPass = null
let curUserEmail = null

class User {
  constructor(name, email, pass) {
    this.name = name;
    this.email = email;
    this.hashedPass = sha256(pass);

    var currentdate = new Date(); 
    this.timeCreated = 
      currentdate.getDate() + "/"
      + (currentdate.getMonth()+1)  + "/" 
      + currentdate.getFullYear() + " @ "  
      + currentdate.getHours() + ":"  
      + currentdate.getMinutes() + ":" 
      + currentdate.getSeconds();
  }
}

function sanitizeKey(key) {
  return key
    .toLowerCase()
    .replace(/\./g, '_dot_') 
    .replace(/#/g, '_hash_')
    .replace(/\$/g, '_dollar_')
    .replace(/\[/g, '_open_')
    .replace(/\]/g, '_close_')
    .replace(/@/g, '_at_');
}

async function userExists(userEmail) {
  const userDBRef = ref(userDB)
  const snapshot = await get(child(userDBRef, sanitizeKey(userEmail)));
  if (snapshot.exists()) {
    return(true);
  } else {
    return(false);
  }
}

//setup emailjs to email passwords
let emailjsOptions = {
  publicKey: 'V46cM1DTbUYQ3qnJH',
  // Do not allow headless browsers
  blockHeadless: true,
  blockList: {
    // Block the suspended emails
    list: [],
    // The variable contains the email address
    watchVariable: 'simplewebchat.swc@gmail.com',
  },
  limitRate: {
    // Set the limit rate for the application
    id: 'app',
    // Allow 1 request per 10s
    throttle: 5000,
  },
}
emailjs.init(emailjsOptions);



//sign up code
const signUp = document.getElementById("signUp");
signUp.addEventListener('click', addAccount)

async function addAccount(){
  let userName = prompt("Name (please enter your real name):", "Enter Name Here:");
  let userEmail = prompt("Email:", "Enter Email Here:");
  //check if user exists in database
  
  if(await userExists(userEmail)){
    alert("User email is already registered! Use 'Log In' to log in!");
  }else{
    //generate passcode
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const length = 5;
    let passCodeResult = '';
    for (let i = 0; i < length; i++) {
      passCodeResult += letters.charAt(Math.floor(Math.random() * letters.length));
    }

    let newUser = new User(userName, userEmail, passCodeResult);
    await set(ref(userDB, sanitizeKey(userEmail)), newUser);


    //send the email
    let templateParams = {passcode: passCodeResult, email: userEmail};
    emailjs.send("service_1k01dze","template_g9vnbrg", templateParams, emailjsOptions);

    alert("User has been created. Email containing passcode has been sent.");
  }
}
//log in code
const logIn = document.getElementById("logIn");
logIn.addEventListener('click', signIn)

async function signIn(){
  let userEmail = prompt("Email:", "Enter Email Here:");
  let userPass = prompt("Passcode:", "Enter Passcode Here:");

  

  if(await userExists(userEmail)){
    const userDBRef = ref(userDB);
    const snapshot = await get(child(userDBRef, sanitizeKey(userEmail)));
    let userData = snapshot.val();

    let hashedPass = sha256(userPass);
    if(hashedPass == userData.hashedPass){
      curUserName = userData.name;
      curUserPass = userPass;
      curUserEmail = userEmail;
      loggedIn = true;
      alert("Logged in!");
      refreshLoginView()
    }else{
      alert("Incorrect passcode.");
    }
  }else{
    alert("User is already registered! Use 'Sign Up' to sign up!")
  }
}



function refreshLoginView(){
    document.getElementById('logged-in').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('logged-out').style.display = loggedIn ? 'none' : 'block';
    if(loggedIn){
        document.getElementById('logged-in-as').textContent = "Logged in as " + curUserName + "!"
    }
}
refreshLoginView()