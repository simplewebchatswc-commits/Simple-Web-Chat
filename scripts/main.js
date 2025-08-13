// Initialize Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import {
      getDatabase,
      ref,
      get,
      child,
      set,
      push, 
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

//user login stuff
let loggedIn = false
let curUserName = null
let curUserPass = null
let curUserEmail = null
let curUserChat = null
let curUserChatName = null

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
  const snapshot = await get(child(userDB, sanitizeKey(userEmail)));
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
  let userName = prompt("Enter Name Here: (please enter your real name):");
  let userEmail = prompt("Enter Email Here:");
  if(!userEmail.includes("@")){
    alert("Please enter a valid email adress!")
    return;
  }
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
    await set(child(userDB, sanitizeKey(userEmail)), newUser);


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
  let userEmail = prompt("Enter Email Here:");
  if(!userEmail.includes("@")){
    alert("Please enter a valid email adress!")
    return;
  }
  let userPass = prompt("Enter Passcode Here:");

  

  if(await userExists(userEmail)){
    const snapshot = await get(child(userDB, sanitizeKey(userEmail)));
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
    alert("User is not yet registered! Use 'Sign Up' to sign up!")
  }
}



function refreshLoginView(){
    document.getElementById('logged-in').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('logged-in1').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('logged-in2').style.display = loggedIn ? 'block' : 'none';
    document.getElementById('logged-out').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('logged-out1').style.display = loggedIn ? 'none' : 'block';
    document.getElementById('logged-out2').style.display = loggedIn ? 'none' : 'block';
    if(loggedIn){
        document.getElementById('logged-in-as').textContent = "Logged in as " + curUserName + "!";
        document.getElementById('listInput').value = curUserEmail;
    }
}
refreshLoginView()


//handling of chats
const msgDB = ref(db, "chats");
class Message{
  constructor(type, content, author){
    this.type = type
    this.content = content
    this.time = Date.now()
    this.author = author
  }
}
class Chat{
  constructor(members, messageLimit){
    this.members = members
    this.messages = [new Message("text", "New chat created containing users: "+ members.join(", ") + ".", "Client")]
    this.messageLimit = messageLimit
  }
}

const selectChat = document.getElementById("selectChat");
selectChat.addEventListener('click', updateSelectDropdown);

async function updateSelectDropdown(){
  while (selectChat.options.length > 1) {
    selectChat.remove(1); // always remove the second option until only one left
  }
  const msgSnapshot = await get(msgDB);
  const userSnapshot = await get(userDB);
  let allUsers = userSnapshot.val();

  const chats = [];
  msgSnapshot.forEach(childSnap => {
    chats.push ({
      key: childSnap.key, 
      data: childSnap.val()
    })
    for(let i = 0; i < chats.length; i++){
      let members = chats[i].data.members;
      if (members.includes(curUserEmail)){
        let names = []
        for(let j = 0; j < members.length; j++){
          names.push(allUsers[sanitizeKey(members[j])]["name"]);
        }
        
        selectChat.add(new Option(names.join(", "), chats[i].key));
      }
    }
  })
}
selectChat.addEventListener("change", () => {
  curUserChat = selectChat.value; 
  curUserChatName = selectChat.options[selectChat.selectedIndex].text;
  updateTextArea()
})

const createChatButton = document.getElementById("createChat");
createChatButton.addEventListener('click', createChat)

async function createChat(){
  const listInput = document.getElementById('listInput').value;
  const emailList = listInput.split('\n').map(item => item.trim()).filter(Boolean);
  
  if(!emailList.includes(curUserEmail)){
    alert("Chat must contain your own email! You cannot creat a chat you aren't in!");
    return;
  }
  if(emailList.length < 2){
    alert("Chat must have at least two emails!");
    return;
  }
  for(let i = 0; i < emailList.length; i++){
    let email = emailList[i];
    if (!(await userExists(email))){
      alert("Unregistered or invalid email: " + email)
      return;
    }
  }
  emailList.sort()
  let chatKey = sanitizeKey(emailList.join(""))
  const snapshot = await get(child(msgDB, chatKey));
  if (snapshot.exists()) {
    alert("You cannot create a chat that already exists!")
    return;
  }

  let newChat = new Chat(emailList, 10) //1 week or 200 messages
  await set(child(msgDB, chatKey), newChat);
  alert("Chat has been created!")
}

//chatting code
let messagesList = document.getElementById("messagesList");
let chatHeader = document.getElementById("chatHeader");
async function updateTextArea(){
  if(curUserChat == null){
    messagesList.value = "";
    chatHeader.textContent = "<- Select a chat to start"
  }else{
    let outputString = ""
    const msgSnapshot = await get(msgDB);
    let curList = msgSnapshot.child(curUserChat).val();
    Object.values(curList.messages).forEach(msg => {
      outputString += msg.author + ": " + msg.content + "\n";
    });

    messagesList.value = outputString;
    chatHeader.textContent = curUserChatName;
  }
}
setInterval(updateTextArea, 500);


let sendMessage = document.getElementById("sendMessage");
sendMessage.addEventListener("click", addMessage)
let msgInput = document.getElementById("msgInput");

msgInput.addEventListener('keydown', function(event) {
  if (event.key === 'Enter') {
    addMessage()
  }
});

async function addMessage(){
  if(msgInput.value != "" && curUserChat != null){
    const messageRef = child(msgDB,  curUserChat+"/messages")
    const newMessageRef = push(messageRef);
    await set(newMessageRef, new Message("text", msgInput.value, curUserName));
    msgInput.value = ""
    updateTextArea();
  }
}

async function pruneOldMessages() {
  if(curUserChat != null){
    const msgSnapshot = await get(msgDB);
    let curList = msgSnapshot.child(curUserChat).val();

    const limit = curList.messageLimit
    let messagesObj = curList.messages;

    const messages = Object.keys(messagesObj).map(key => {
      return {
        id: key,
        ...messagesObj[key]
      }
    });
    // If messages length exceeds limit, prune oldest
    if (messages.length > limit) {
      // Sort messages by time ascending (oldest first)
      messages.sort((a, b) => a.time - b.time);
      

      // Keep only the newest `limit` messages
      const pruned = messages.slice(messages.length - limit);

      // Write back pruned messages
      const chatRef = child(msgDB,  curUserChat+"/messages")
      await set(chatRef, pruned);
    }
  }

}
setInterval(pruneOldMessages, 5000);

//add security