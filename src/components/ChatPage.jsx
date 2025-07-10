import axios from "axios";
import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import { addConnections } from "../utils/conectionSlice";
import { useLocation } from "react-router-dom";
import socket from "../utils/socket";

const ChatPage = () => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const chatBoxRef = useRef(null);

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

  const fetchMessages = async (user, pageNo = 1) => {
    try {
      const res = await axios.get(`${BASE_URL}/messages/${user._id}?page=${pageNo}`, {
        withCredentials: true,
      });

      const reversed = res.data.messages.reverse();

      if (pageNo === 1) {
        setMessages(reversed);
        setTimeout(() => {
          if (chatBoxRef.current) {
            chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
          }
        }, 0);
      } else {
        setMessages((prev) => [...reversed, ...prev]);
      }

      if (reversed.length === 0) setHasMore(false);
    } catch (err) {
      console.error("Failed to fetch messages:", err);
    }
  };

  const handleSelectUser = async (user) => {
    setSelectedUser(user);
    setMessages([]);
    setPage(1);
    setHasMore(true);
    await fetchMessages(user, 1);
  };

  const loadMoreMessages = async () => {
    const prevScrollHeight = chatBoxRef.current.scrollHeight;
    await fetchMessages(selectedUser, page + 1);
    setPage((prev) => prev + 1);

    setTimeout(() => {
      const newScrollHeight = chatBoxRef.current.scrollHeight;
      chatBoxRef.current.scrollTop = newScrollHeight - prevScrollHeight;
    }, 0);
  };

  useEffect(() => {
    fetchConnections();
    if (location.state?.user) {
      setSelectedUser(location.state.user);
      fetchMessages(location.state.user, 1);
    }
  }, []);

  useEffect(() => {
    if (currentUserId) {
      socket.emit("join_room", currentUserId);
    }
  }, [currentUserId]);

  useEffect(() => {
    const chatBox = chatBoxRef.current;
    const handleScroll = () => {
      if (chatBox.scrollTop < 50 && hasMore) {
        loadMoreMessages();
      }
    };

    chatBox?.addEventListener("scroll", handleScroll);
    return () => chatBox?.removeEventListener("scroll", handleScroll);
  }, [messages, hasMore]);

  useEffect(() => {
    socket.on("receive_message", (msg) => {
      if (
        selectedUser &&
        (msg.fromUserId === selectedUser._id || msg.toUserId === selectedUser._id)
      ) {
        setMessages((prev) => {
          if (prev.some((m) => m._id === msg._id)) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => socket.off("receive_message");
  }, [selectedUser]);

  // scroll to bottom on new message
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = () => {
    if (message.trim() === "") return;

    const tempId = `temp-${Date.now()}`;

    const msgData = {
      fromUserId: currentUserId,
      toUserId: selectedUser._id,
      message,
      _id: tempId, // temp ID for React key
    };

    socket.emit("send_message", msgData);
    setMessages((prev) => [...prev, msgData]);
    setMessage("");
  };
  const handleDeleteMessage = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/messages/${id}`, { withCredentials: true });

      setMessages((prev) => prev.filter((msg) => msg._id !== id));
    } catch (err) {
      console.error("Error deleting message:", err);
      alert("Failed to delete message");
    }
  };

  return (
    <div className="flex h-screen pt-16 bg-base-100">
      {/* Sidebar */}
      <div className="w-[30%] max-w-sm border-r border-gray-300 bg-base-200 hidden md:flex flex-col">
        <h2 className="text-2xl font-bold p-6 border-b border-base-300">Chats</h2>
        <div className="flex-1 overflow-y-auto">
          {connections?.map((user) => {
            const imageUrl = user.photoUrl?.startsWith("http")
              ? user.photoUrl
              : `${BASE_URL}${user.photoUrl}`;

            return (
              <div
                key={user._id}
                onClick={() => handleSelectUser(user)}
                className="flex items-center gap-4 p-4 hover:bg-base-300 cursor-pointer transition"
              >
                <img
                  src={imageUrl}
                  alt={user.firstName}
                  className="w-12 h-12 rounded-full object-cover border border-white"
                />
                <div>
                  <h3 className="font-semibold text-base">{user.firstName} {user.lastName}</h3>
                  <p className="text-xs text-gray-500 truncate max-w-[150px]">{user.about}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-gradient-to-br from-base-100 to-base-200">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="flex items-center gap-4 p-4 bg-base-300 sticky top-0 z-20 shadow">
              <img
                src={
                  selectedUser.photoUrl?.startsWith("http")
                    ? selectedUser.photoUrl
                    : `${BASE_URL}${selectedUser.photoUrl}`
                }
                className="w-12 h-12 rounded-full object-cover border"
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

            {/* Chat Messages */}
            <div
  ref={chatBoxRef}
  className="flex-1 p-4 overflow-y-auto space-y-3 bg-base-100"
>
  {messages.map((msg) => {
    const isCurrentUser = msg.fromUserId === currentUserId;

    return (
      <div
        key={`${msg._id}-${msg.deleted}`} // avoid duplicate key issues
        className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}
      >
        <div className="relative group max-w-[85%] md:max-w-[70%]">
          <div
            className={`px-4 py-2 rounded-2xl text-white shadow transition-all duration-300 ${
              isCurrentUser
                ? "bg-blue-600 rounded-br-none"
                : "bg-gray-700 rounded-bl-none"
            } break-words whitespace-pre-wrap`}
          >
            {msg.deleted ? (
              <span className="italic text-gray-300">This message was deleted</span>
            ) : (
              msg.message
            )}
          </div>

          {/* Delete button */}
          {isCurrentUser && !msg.deleted && (
            <button
              onClick={() => handleDeleteMessage(msg._id)}
              className="absolute -top-2 -right-2 hidden group-hover:flex items-center justify-center w-6 h-6 text-xs text-white bg-red-500 hover:bg-red-600 rounded-full shadow"
              title="Delete"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    );
  })}
</div>



            
            <div className="p-4 bg-base-300 sticky bottom-0 border-t border-base-200">
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  className="input input-bordered w-full text-sm"
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                />
                <button className="btn btn-primary px-6" onClick={handleSendMessage}>
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
