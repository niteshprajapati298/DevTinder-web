import { io } from "socket.io-client";

// const socket = io(BASE_URL, {
//   withCredentials: true,
// });

const socket = io("https://tinderdev.xyz", {
  withCredentials: true,
  transports: ["websocket"], 
});


export default socket;
