import React from "react";
import { useContext } from "react";
import { UserContext } from "./UserContext";
import Register from "./components/Register";

const Routes = () => {
  const { username, id } = useContext(UserContext);

  if (username) {
    return "logged in" + username;
  }

  return <Register />;
};

export default Routes;
