
// const socket = io(BASE_URL, {
//   withCredentials: true,
// });
import { io } from "socket.io-client";

const socket = io("https://tinderdev.xyz", {
  path: "/api/socket.io/",
  withCredentials: true,
  transports: ["websocket"],
});

export default socket;

