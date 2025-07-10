import axios from "axios";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/conectionSlice";
import { useLocation } from "react-router-dom";
import socket from "../utils/socket";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const location = useLocation();
  const dispatch = useDispatch();

  const currentUserId = useSelector((store) => store.user?._id);
  const connections = useSelector((store) => store.connections);

  const fetchConnections = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });
      dispatch(addConnections(res.data.connection));
    } catch (err) {
      console.error("Error fetching connections:", err);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    try {
      const res = await axios.get(`${BASE_URL}/messages/${user._id}`, {
        withCredentials: true,
      });
      setMessages(res.data.messages);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  // Join socket room with current user ID
  useEffect(() => {
    if (currentUserId) {
      socket.emit("join_room", currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    fetchConnections();
    setSelectedUser(location.state?.user);
  }, []);

  useEffect(() => {
    if (location.state?.user) {
      handleSelectUser(location.state.user);
    }
  }, [location.state]);

  // Listen for incoming socket messages
  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        selectedUser &&
        (msg.fromUserId === selectedUser._id || msg.toUserId === selectedUser._id)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("receive_message");
    };
  }, [selectedUser]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const msgData = {
      fromUserId: currentUserId,
      toUserId: selectedUser._id,
      message,
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]); // Local echo
    setMessage("");
  };

  return (
    <div className="flex h-screen pt-16 pb-2">
      {/* Sidebar */}
      <div className="w-[30%] bg-base-200 overflow-y-auto border-r border-gray-300 hidden md:block">
        <h2 className="text-xl font-bold p-4">Chats</h2>
        {connections?.map((user) => {
          const imageUrl = user.photoUrl?.startsWith("http")
            ? user.photoUrl
            : `${BASE_URL}${user.photoUrl}`;
          return (
            <div
              key={user._id}
              onClick={() => handleSelectUser(user)}
              className="flex items-center gap-3 p-4 hover:bg-base-300 cursor-pointer"
            >
              <img
                src={imageUrl}
                alt={user.firstName}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium">{user.firstName} {user.lastName}</h3>
                <p className="text-xs text-gray-500 line-clamp-1">{user.about}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col h-screen bg-base-100">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="flex items-center gap-4 p-4 bg-base-300 sticky top-0 z-10 shadow-md">
              <img
                src={
                  selectedUser.photoUrl?.startsWith("http")
                    ? selectedUser.photoUrl
                    : `${BASE_URL}${selectedUser.photoUrl}`
                }
                className="w-12 h-12 rounded-full object-cover"
                alt={selectedUser.firstName}
              />
              <div>
                <h2 className="text-lg font-semibold">
                  {selectedUser.firstName} {selectedUser.lastName}
                </h2>
                <p className="text-sm text-gray-500">
                  {selectedUser.age}, {selectedUser.gender}
                </p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-base-200">
              {messages.map((msg) => (
                <div
                  key={msg._id || Math.random()}
                  className={`chat ${msg.fromUserId === currentUserId ? "chat-end" : "chat-start"}`}
                >
                  <div className="chat-bubble chat-bubble-neutral">
                    {msg.message}
                  </div>
                </div>
              ))}
            </div>

            {/* Input */}
            <div className="p-4 bg-base-300 border-t border-base-200 sticky bottom-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  className="input input-bordered w-full"
                  placeholder="Type a message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn btn-primary" onClick={handleSendMessage}>
                  Send
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400 text-xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;
