import React from "react";
import Avatar from "./Avatar";

const Contacts = ({ userId, onClick, username, online, selected }) => {
  return (
    <div
      key={userId}
      onClick={() => onClick(userId)}
      className={
        " py-2 border-gray-200 flex items-center gap-3 cursor-pointer " +
        (selected ? "bg-blue-100 rounded-md p-3" : "")
      }
    >
      {selected && <div className="w-1 bg-blue-500 h-12 rounded-r-md"></div>}
      <Avatar username={username} userId={userId} online={online} />
      {username}
    </div>
  );
};

export default Contacts;
