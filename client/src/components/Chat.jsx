import React, { useContext, useEffect, useRef, useState } from "react";
import Avatar from "./Avatar";
import { UserContext } from "../UserContext";
import { uniqBy } from "lodash";

const Chat = () => {
  const [ws, setWs] = useState(null);
  const [onlinePoeple, setOnlinePoeple] = useState({});
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newMessageText, setNewMessageText] = useState("");
  const [messages, setMessages] = useState([]);
  const { username, id } = useContext(UserContext);
  const divUnderLatestMessage = useRef();
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:4000");
    setWs(ws);
    ws.addEventListener("message", handleMessage);
  }, []);

  function showOnlinePeople(peopleArray) {
    const people = {};
    peopleArray.forEach(({ userId, username }) => {
      people[userId] = username;
    });
    setOnlinePoeple(people);
  }

  function handleMessage(e) {
    const messageData = JSON.parse(e.data);
    if ("online" in messageData) {
      showOnlinePeople(messageData.online);
    } else if ("text" in messageData) {
      setMessages((prev) => [...prev, { ...messageData }]);
    }
  }

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
        id: Date.now(),
      },
    ]);
    setNewMessageText("");
  }

  useEffect(() => {
    const div = divUnderLatestMessage.current;
    if (div) {
      div.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  }, [messages]);

  const onlinePeopleExcludingOurUser = { ...onlinePoeple };
  delete onlinePeopleExcludingOurUser[id];

  const messagesWithoutDupes = uniqBy(messages, "id");

  return (
    <div className=" h-screen flex">
      {/* left sidebar that contains contacts */}

      <div className="bg-white pr-6 pl-6 pt-6 w-1/4 ">
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
        {Object.keys(onlinePeopleExcludingOurUser).map((userId) => (
          <div
            key={userId}
            onClick={() => setSelectedUserId(userId)}
            className={
              " py-2 border-gray-200 flex items-center gap-3 cursor-pointer " +
              (userId === selectedUserId ? "bg-blue-100 rounded-md p-3" : "")
            }
          >
            <Avatar
              username={onlinePeopleExcludingOurUser[userId]}
              userId={userId}
            />
            {onlinePeopleExcludingOurUser[userId]}
          </div>
        ))}
      </div>

      {/* right side content containing messages  */}
      <div className="bg-blue-100 p-2 w-3/4 flex flex-col">
        {/* messages */}
        <div className="flex-grow  p-2 ">
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
          {!!selectedUserId && (
            <div className="relative h-full">
              <div className="overflow-y-auto absolute inset-0">
                {messagesWithoutDupes.map((message) => (
                  <div
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
                      sender: {message.sender} <br />
                      my id: {id} <br />
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
          <form className="flex gap-2 p-2" onSubmit={sendMessage}>
            {/* input  */}
            <input
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              type="text"
              placeholder="Enter your message here"
              className="p-2 flex-grow rounded-md"
            />

            {/* button to send message */}
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
