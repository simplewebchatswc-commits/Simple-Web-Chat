# Simple Web Chat (SWC)

IDEAS
 - using firebase for the entire thing

USERS
 - users enter their email adress and are sent an email containing a code. The code is never stored in the server, rather a hashed version of the code is stored
 - when users log in, they must enter their email and their code. Before being sent to the server, the code is hashed and the two hashed codes are checked to verify the user
 - user names, emails, and hashed codes are all stored inside a firebase database. 
 - the email and code are stored locally for the entire session and checked to be correct for every message sent and every action done. 

CHATS
 - All chats are stored in a secondary database. The structure is the following: each chat has its members, and messages. Messages have a type, timestamp, and content. This allows for future additions of other filetpes as well as erasing messages after too long. 
 - Users have a registry of all chats they are in. They can select a chat from this dropdown and add messages to it. 
 - A registry containing all registered users is avaliable to all users. Contains their name, email, etc. 
 - Users can create new chats in a dialog by adding one or more email adresses. 

 UI
 - see google slide
