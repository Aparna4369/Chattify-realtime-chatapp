import React, { useEffect, useState, useRef, useCallback } from "react";
import { 
  useAddUserToGroupMutation as useAddToGroupMutation, 
  useRemoveUserFromGroupMutation as useRemoveFromGroupMutation,
  useRenameGroupMutation 
} from "../slices/chatApiSlice";
import {
  useGetMessagesQuery,
  useSendMessageMutation,
  useDeleteMessageMutation,
} from "../slices/messageApiSlice";
import socket from "../socket";
import { IoSend } from "react-icons/io5";
import { FaUsers, FaUser } from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/chatbox.css";
import CreateGroupModal from "./CreateGroupModal"; 
import GroupInfoModal from "./GroupInfoModal";
const ChatBox = ({ chatId, selectedUser, chatData }) => {
  
  
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const [showGroupInfo, setShowGroupInfo] = useState(false);
  
  // RTK Query for messages
  const { 
    data: messages = [], 
    isLoading, 
    error 
  } = useGetMessagesQuery(chatId, {
    skip: !chatId,
    refetchOnMountOrArgChange: true,
  });

  const [sendMessage] = useSendMessageMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  // Group management mutations
  const [addToGroup] = useAddToGroupMutation();
  const [removeFromGroup] = useRemoveFromGroupMutation();
  const [renameGroup] = useRenameGroupMutation();

  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [typing, setTyping] = useState(false);

  const typingTimeout = useRef(null);
  const messageEndRef = useRef(null);

  // Verify user has access to this chat (MOVE THIS AFTER HOOKS)
  const isUserInChat = chatData?.users?.some(u => u._id === userInfo._id);
  
  // Access denied check - NOW AFTER HOOKS
  if (chatId && !isUserInChat) {
    return (
      <div className="chatbox-container">
        <div className="alert alert-warning text-center m-3">
          <h5>Access Denied</h5>
          <p>You don't have permission to view this chat.</p>
        </div>
      </div>
    );
  }

  // Reset states when chat changes
  useEffect(() => {
    if (!chatId) return;
    
    setNewMessage("");
    setTyping(false);
    setIsTyping(false);
    setShowGroupInfo(false);
    
    console.log(' ChatBox mounted for chat:', chatId);
  }, [chatId]);

  // Socket listeners
  useEffect(() => {
    if (!chatId) return;

    socket.emit("joinChat", chatId);

    const handleNewMessage = (message) => {
      console.log('Socket message received for chat:', message.chat?._id);
      
      if (message.chat?._id === chatId) {
        toast.success(`New message from ${message.sender?.name}`);
      } else {
        toast.info(`New message from ${message.sender?.name}`);
      }
    };

    const handleTyping = () => setIsTyping(true);
    const handleStopTyping = () => setIsTyping(false);

    socket.on("newMessageAlert", handleNewMessage);
    socket.on("typing", handleTyping);
    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("newMessageAlert", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("stopTyping", handleStopTyping);
      socket.emit("leave group", chatId);
    };
  }, [chatId]);

  // Auto scroll to bottom
  useEffect(() => {
    if (messages.length > 0) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // Typing handler
  const typingHandler = useCallback((e) => {
    const value = e.target.value;
    setNewMessage(value);

    if (!typing) {
      setTyping(true);
      socket.emit("typing", chatId);
    }

    if (typingTimeout.current) clearTimeout(typingTimeout.current);

    typingTimeout.current = setTimeout(() => {
      socket.emit("stopTyping", chatId);
      setTyping(false);
    }, 2000);
  }, [chatId, typing]);

  // Send message
  const handleSend = useCallback(async (e) => {
    e.preventDefault();

    const text = newMessage.trim();
    if (!text || !chatId) return;

    const messageToSend = text;
    setNewMessage("");
    socket.emit("stopTyping", chatId);

    try {
      console.log(' Sending message to chat:', chatId);
      const sent = await sendMessage({
        chatId,
        sender: userInfo._id,
        text: messageToSend,
      }).unwrap();

      console.log(' Message sent successfully:', sent.savedMessage?._id);
      
      // Message will appear via socket or query refetch
      
    } catch (err) {
      console.error(' Send message error:', err);
      toast.error(`Failed to send message: ${err.data?.message || 'Unknown error'}`);
      setNewMessage(messageToSend); // Restore message
    }
  }, [chatId, newMessage, userInfo, sendMessage]);

  // Delete message
  const handleDeleteMessage = useCallback(async (msgId) => {
    if (!window.confirm("Delete this message?")) return;
    try {
      await deleteMessage(msgId).unwrap();
      toast.success("Message deleted");
    } catch (err) {
      console.error('Delete error:', err);
      toast.error("Failed to delete message");
    }
  }, [deleteMessage]);

  const getChatTitle = () => {
    if (!chatData) return selectedUser?.name || "Chat";

    if (chatData.isGroupChat) return chatData.chatName;

    const otherUser = chatData.users.find((u) => u._id !== userInfo._id);
    return otherUser?.name || "Chat";
  };

 
  const getParticipants = () => {
    if (!chatData?.isGroupChat) return null;
    
    const members = chatData.users || [];
    const otherMembers = members.filter(u => u._id !== userInfo._id);
    
    if (otherMembers.length === 0) {
      return "Only you";
    }
    
    const names = otherMembers.slice(0, 3).map(u => u.name);
    let result = names.join(', ');
    
    if (otherMembers.length > 3) {
      result += ` +${otherMembers.length - 3} more`;
    }
    
    return result;
  };

  const getMemberCount = () => {
    return chatData?.users?.length || 0;
  };

 
  const isGroupAdmin = () => {
    return chatData?.groupAdmin?._id === userInfo._id;
  };

  if (error) {
    return (
      <div className="chatbox-container">
        <div className="alert alert-danger text-center m-3">
          <h5>Error Loading Messages</h5>
          <p>{error.data?.message || 'Failed to load messages'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="chatbox-container">
      {/* Header */}
      <div className="chat-header">
        <div className="chat-header-left">
          {chatData?.isGroupChat ? (
            <div className="chat-avatar-group">
              <FaUsers size={24} />
            </div>
          ) : selectedUser?.image ? (
            <img src={selectedUser.image} alt="profile" className="chat-avatar" />
          ) : (
            <div className="chat-avatar-fallback">
              {selectedUser?.name?.[0]?.toUpperCase() || <FaUser size={20} />}
            </div>
          )}

          <div className="chat-header-info">
            <div className="chat-title-section">
              <h5>{getChatTitle()}</h5>
              {chatData?.isGroupChat && (
                <span className="member-count-badge">
                  {getMemberCount()} members
                </span>
              )}
              {isGroupAdmin() && chatData?.isGroupChat && (
                <span className="admin-badge" title="Group Admin">
                  Admin
                </span>
              )}
            </div>
            
            <div className="chat-subtitle">
              {chatData?.isGroupChat ? (
                <div className="group-info-line">
                  <span className="participants">{getParticipants()}</span>
                  <button 
                    className="group-info-btn"
                    onClick={() => setShowGroupInfo(true)}
                    title="Group info"
                  >
                    <FaUsers size={14} /> View members
                  </button>
                </div>
              ) : (
                <p className="status-text">
                  {isTyping ? "typing..." : (messages.length > 0 ? "online" : "Start chatting!")}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {chatData?.isGroupChat && (
          <div className="chat-header-right">
            <button 
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowGroupInfo(true)}
            >
              <FaUsers className="me-1" />
              Group Info
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="chat-messages">
        {isLoading ? (
          <div className="text-center p-4">
            <div className="spinner-border text-primary"></div>
            <p className="text-muted mt-2">Loading messages...</p>
          </div>
        ) : messages.length > 0 ? (
          messages.map((msg) => {
            const isMine = msg.sender?._id === userInfo._id;
            const time = msg.createdAt 
              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : '';

            return (
              <div
    key={msg._id}
    className={`chat-message-row ${isMine ? "sent" : "received"}`}
  >
    {!isMine && chatData?.isGroupChat && (
      <div className="message-sender">
        <strong>{msg.sender?.name}</strong>
      </div>
    )}
    
    <div className="chat-message-bubble-wrapper">
      <div className={`chat-message-bubble ${isMine ? 'mine' : 'others'}`}>
        <div className="message-text">{msg.text}</div>
        <div className="message-time">
          {time}
        </div>
      </div>

      {isMine && (
        <button
          onClick={() => handleDeleteMessage(msg._id)}
          className="delete-msg-btn"
          title="Delete message"
        >
          🗑
        </button>
      )}
    </div>
  </div>
            );
          })
        ) : (
          <div className="no-messages text-center p-5">
            <h5>No messages yet</h5>
            <p className="text-muted">
              {chatData?.isGroupChat 
                ? "Send a message to start the conversation!" 
                : "Say hello to start chatting!"}
            </p>
          </div>
        )}
        <div ref={messageEndRef}></div>
      </div>

      {/* Input */}
      <form className="chat-input" onSubmit={handleSend}>
        <input
          type="text"
          placeholder={
            chatData?.isGroupChat 
              ? `Message ${getChatTitle()}...` 
              : "Type a message..."
          }
          value={newMessage}
          onChange={typingHandler}
          disabled={!chatId}
        />
        <button 
          type="submit" 
          className="send-btn"
          disabled={!newMessage.trim() || !chatId}
        >
          <IoSend size={25} />
        </button>
      </form>
      
      {/* Group Info Modal */}
      {chatData?.isGroupChat && (
        <GroupInfoModal
          show={showGroupInfo}
          onHide={() => setShowGroupInfo(false)}
          chat={chatData}
          currentUser={userInfo}
          addToGroup={addToGroup}
          removeFromGroup={removeFromGroup}
          renameGroup={renameGroup}
        />
      )}
    </div>
  );
};

export default ChatBox;