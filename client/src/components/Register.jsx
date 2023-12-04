import axios from "axios";
import React, { useContext, useState } from "react";
import { UserContext } from "../UserContext";

const Register = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegisterOrLogin, setIsRegisterOrLogin] = useState("login");
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegisterOrLogin === "register" ? "register" : "login";
    const { data } = await axios.post(`/user/${url}`, { username, password });
    setLoggedInUsername(username);
    setId(data.id);
  };

  return (
    <div className="bg-blue-100 h-screen flex justify-center items-center">
      <form className="flex flex-col w-1/4 gap-5" onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-2 rounded-md"
          placeholder="username"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-2 rounded-md"
          placeholder="password"
        />
        <button className="bg-blue-500 text-white p-2 rounded-md">
          {isRegisterOrLogin === "register" ? "Register" : "Login"}
        </button>
        {isRegisterOrLogin === "register" && (
          <div className="text-center">
            Already a member ?{" "}
            <button
              className="text-blue-500"
              onClick={() => setIsRegisterOrLogin("login")}
            >
              Login here
            </button>
          </div>
        )}
        {isRegisterOrLogin === "login" && (
          <div className="text-center">
            Don't have an account ?{" "}
            <button
              className="text-blue-500 "
              onClick={() => setIsRegisterOrLogin("register")}
            >
              Register here
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default Register;
