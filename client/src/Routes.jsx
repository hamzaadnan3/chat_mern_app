import React from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Register from "./components/Register";
import Chat from "./components/Chat";

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username) {
    return <Chat />;
  }

  return <Register />;
};

export default Routes;
