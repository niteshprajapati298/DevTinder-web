import { io } from "socket.io-client";

const socket = io("https://devtinder-ziqq.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
