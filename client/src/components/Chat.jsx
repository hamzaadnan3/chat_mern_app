import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";
import axios from "axios";
import Contacts from "./Contacts";

const Chat = () => {
  //declaring all state variables
  const [ws, setWs] = useState(null);
  const [onlinePoeple, setOnlinePoeple] = useState({});
  const [offlinePoeple, setOfflinePoeple] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);

  //destructuring varaibles from user context
  const { username, id, setUsername, setId } = useContext(UserContext);

  //useref
  const divUnderLatestMessage = useRef();

  //to connect to web socket when mounted to the application
  useEffect(() => {
    connectToWs();
  }, [selectedUserId]);

  //web socket connection logic function
  function connectToWs() {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
    ws.addEventListener("close", () => {
      setTimeout(() => {
        connectToWs();
      }, 1000);
    });
  }

  //to get/fetch all messages of particular chat between two users
  useEffect(() => {
    if (selectedUserId) {
      axios.get("/message/getmessages/" + selectedUserId).then((res) => {
        setMessages(res.data);
      });
    }
  }, [selectedUserId]);

  //to create an object that shows/ have information of inlin people in userId to username key value pair
  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePoeple(people);
  }

  //to handle incoming message and store it in messages state array
  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

  //to handle sending message functionality and store it in messages state array
  function sendMessage(e) {
    e.preventDefault();
    ws.send(
      JSON.stringify({
        recepient: selectedUserId,
        text: newMessageText,
      })
    );
    setMessages((prev) => [
      ...prev,
      {
        text: newMessageText,
        sender: id,
        recepient: selectedUserId,
        _id: Date.now(),
      },
    ]);
    setNewMessageText("");
  }

  //to scroll into view whenever new message is send so that user dont have to scroll everytime manually
  //using useref hook
  useEffect(() => {
    const div = divUnderLatestMessage.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  //to get all the poeple from database and filter out our Id and online people Id from this array
  //and store it in an object
  useEffect(() => {
    axios.get("/user/people").then((res) => {
      const offlinePoepleArr = res.data
        .filter((p) => p._id !== id)
        .filter((p) => !Object.keys(onlinePoeple).includes(p._id));
      const offlinePoeple = {};
      offlinePoepleArr.forEach((p) => {
        offlinePoeple[p._id] = p;
      });
      setOfflinePoeple(offlinePoeple);
    });
  }, [onlinePoeple]);

  //logout funcitonality
  function logout() {
    axios.post("/user/logout").then(() => {
      setWs(null);
      setId(null);
      setUsername(null);
    });
  }

  //uploading and sending file
  function sendFile(e) {
    const reader = new FileReader();
    reader.readAsDataURL(e.target.files[0]);
    reader.onload = () => {};
  }

  const onlinePeopleExcludingOurUser = { ...onlinePoeple };
  delete onlinePeopleExcludingOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "_id");

  return (
    <div className=" h-screen flex">
      {/* left sidebar that contains contacts */}

      <div className="bg-white pr-6 pl-6 pt-6 w-1/4 flex flex-col ">
        <div className="flex-grow">
          {/* logo */}
          <div className="text-blue-500 font-bold mb-6 flex gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="w-6 h-6"
            >
              <path d="M4.913 2.658c2.075-.27 4.19-.408 6.337-.408 2.147 0 4.262.139 6.337.408 1.922.25 3.291 1.861 3.405 3.727a4.403 4.403 0 00-1.032-.211 50.89 50.89 0 00-8.42 0c-2.358.196-4.04 2.19-4.04 4.434v4.286a4.47 4.47 0 002.433 3.984L7.28 21.53A.75.75 0 016 21v-4.03a48.527 48.527 0 01-1.087-.128C2.905 16.58 1.5 14.833 1.5 12.862V6.638c0-1.97 1.405-3.718 3.413-3.979z" />
              <path d="M15.75 7.5c-1.376 0-2.739.057-4.086.169C10.124 7.797 9 9.103 9 10.609v4.285c0 1.507 1.128 2.814 2.67 2.94 1.243.102 2.5.157 3.768.165l2.782 2.781a.75.75 0 001.28-.53v-2.39l.33-.026c1.542-.125 2.67-1.433 2.67-2.94v-4.286c0-1.505-1.125-2.811-2.664-2.94A49.392 49.392 0 0015.75 7.5z" />
            </svg>
            MernChat
          </div>

          {/* showing online poeple */}
          {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
            <Contacts
              key={userId}
              userId={userId}
              online={true}
              username={onlinePeopleExcludingOurUser[userId]}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}

          {/* showing all users that are not online */}
          {Object.keys(offlinePoeple).map((userId) => (
            <Contacts
              key={userId}
              userId={userId}
              online={false}
              username={offlinePoeple[userId].username}
              onClick={() => setSelectedUserId(userId)}
              selected={userId === selectedUserId}
            />
          ))}
        </div>

        {/* profile and logout button */}
        <div className="flex items-center justify-center gap-4 mb-7">
          {/* profile */}
          <span className="flex items-center justify-center gap-1 border border-gray-600 rounded-md py-1 px-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-5 h-5"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A6.483 6.483 0 0010 16.5a6.483 6.483 0 004.793-2.11A5.99 5.99 0 0010 12z"
                clipRule="evenodd"
              />
            </svg>

            {username}
          </span>

          {/* logout button */}
          <button
            className="bg-blue-300 text-gray-800 py-1 px-5 rounded-md"
            onClick={logout}
          >
            Logout
          </button>
        </div>
      </div>

      {/* right side content containing messages  */}
      <div className="bg-blue-100 p-2 w-3/4 flex flex-col">
        {/* messages */}
        <div className="flex-grow  p-2 ">
          {/* welcome screen when user login/register and have not clicked on any contact to start chat */}
          {!selectedUserId && (
            <div className="h-full flex items-center justify-center gap-2 text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
              Select a contact and start conversation
            </div>
          )}

          {/* screen to show all the previous messages and input box and button to send new message  */}
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-auto absolute inset-0">
                {messagesWithoutDupes.map((message) => (
                  <div
                    key={message._id}
                    className={`${
                      message.sender === id ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={
                        "text-left inline-block p-2 my-2 rounded-md text-sm " +
                        (message.sender === id
                          ? "bg-blue-500 text-white"
                          : "bg-white text-gray-600")
                      }
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
                <div ref={divUnderLatestMessage}></div>
              </div>
            </div>
          )}
        </div>

        {/* input and send button */}
        {!!selectedUserId && (
          <form className="flex items-center gap-2 p-2" onSubmit={sendMessage}>
            {/* input  */}
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="Enter your message here"
              className="p-2 flex-grow rounded-md"
            />

            {/* button to send message */}
            <label className="bg-blue-300 p-2 rounded-md text-gray-600 cursor-pointer">
              <input type="file" className="hidden" onChange={sendFile} />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6 "
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13"
                />
              </svg>
            </label>
            <button
              type="submit"
              className="bg-blue-500 p-2 rounded-md text-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                />
              </svg>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default Chat;
