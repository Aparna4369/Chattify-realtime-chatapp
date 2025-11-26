import React, { useEffect, useState, useRef } from "react";
import { useGetMessagesQuery, useSendMessageMutation } from "../slices/messageApiSlice";
import socket from "../socket";
import "../styles/chatbox.css";
import { IoSend } from "react-icons/io5";
import { toast } from "react-toastify";

const ChatBox = ({ chatId, selectedUser }) => {
  const { data: messagesData = [], isLoading} = useGetMessagesQuery(chatId);
  const [sendMessage] = useSendMessageMutation();

  const [newMessage, setNewMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const messageEndRef = useRef(null);

  // Load initial messages
  useEffect(() => {
    if (messagesData?.allMessages) {
      setMessages(messagesData.allMessages);
    }
  }, [messagesData]);

  // Clear notifications when opening a chat
  useEffect(() => {
    if (chatId) {
      socket.emit("clearNotifications", chatId);
    }
  }, [chatId]);

  // SOCKET LISTENER
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handleMessageReceived = (message) => {
      // If the message is from someone else & is NOT the current chat → show toast
      if (message.sender !== userInfo?._id && message.chatId !== chatId) {
        toast.info(`New message from ${message.senderName}`);
      }

      // If message belongs to current open chat → append
      if (message.chatId === chatId) {
        setMessages((prev) => [...prev, message]);
      }
    };

    socket.on("messageReceived", handleMessageReceived);
    socket.on("typing", () => setIsTyping(true));
    socket.on("stopTyping", () => setIsTyping(false));

    return () => {
      socket.off("messageReceived", handleMessageReceived);
      socket.off("typing");
      socket.off("stopTyping");
    };
  }, [chatId]);

  // Auto scroll
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  let typingTimeout;

  const typingHandler = (e) => {
    setNewMessage(e.target.value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }

    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(() => {
      socket.emit("stopTyping", chatId);
      setTyping(false);
    }, 2000);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const messageData = {
      chatId,
      sender: userInfo?._id,
      text: newMessage,
    };

    try {
      const sent = await sendMessage(messageData).unwrap();
      setNewMessage("");

      socket.emit("stopTyping", chatId);
      setTyping(false);

      setMessages((prev) => [...prev, sent.savedMessage]);

      // Emit to server so it broadcasts
      socket.emit("newMessage", sent.savedMessage);
    } catch (err) {
      console.error("Error sending message", err);
    }
  };

  return (
    <div className="chatbox-container">
      <div className="chat-header">
        {selectedUser?.image ? (
          <img src={selectedUser.image} alt="profile" className="chat-avatar" />
        ) : (
          <div className="chat-avatar-fallback">
            {selectedUser?.name?.[0]?.toUpperCase()}
          </div>
        )}

        <div>
          <h5>{selectedUser?.name}</h5>
          <p className="status-text">{isTyping ? "typing..." : "online"}</p>
        </div>
      </div>

      <div className="chat-messages">
        {isLoading ? (
          <p className="text-center text-muted">Loading messages...</p>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const senderId =
              typeof msg.sender === "string" ? msg.sender : msg.sender?._id;

            const isMine = senderId === userInfo?._id;

            return (
              <div
                key={msg._id}
                className={`chat-message-row ${isMine ? "sent" : "received"}`}
              >
                <div className="chat-message-bubble">{msg.text}</div>
              </div>
            );
          })
        ) : (
          <p className="no-messages">No messages yet</p>
        )}

        <div ref={messageEndRef}></div>
      </div>

      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder="Type a message..."
          value={newMessage}
          onChange={typingHandler}
        />
        <button type="submit" className="send-btn">
          <IoSend size={22} />
        </button>
      </form>
    </div>
  );
};

export default ChatBox;
