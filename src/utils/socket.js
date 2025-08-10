import { io } from "socket.io-client";

const socket = io("https://tinderdev.xyz", {
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;
