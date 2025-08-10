import { io } from "socket.io-client";

// const socket = io(BASE_URL, {
//   withCredentials: true,
// });

const socket = io("http://tinderdev.xyz", {
  withCredentials: true,
  transports: ["websocket"], 
});


export default socket;
