import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import { Row, Col, Spinner, Alert } from "react-bootstrap";
import Sidebar from "../components/Sidebar";
import UserList from "../components/UserList";
import ChatBox from "../components/ChatBox";
import socket from "../socket";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useGetChatQuery, useCreateChatMutation } from "../slices/chatApiSlice";
import { toast } from "react-toastify";

const HomeScreen = () => {
  const [searchKey, setSearchKey] = useState("");
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [chatList, setChatList] = useState([]);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  
  const [createChat] = useCreateChatMutation();
  const { userInfo } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  const { data: chatData, isLoading: isLoadingChats, error: chatError } = useGetChatQuery();


  useEffect(() => {
    if (!userInfo) navigate("/login");
  }, [userInfo, navigate]);

  
  useEffect(() => {
    if (chatData) {
      console.log(' Chats loaded:', chatData.length);
      const updatedChats = chatData.map((c) => ({
        ...c,
        unreadCounts: c.unreadCounts || { [userInfo._id]: 0 },
      }));
      setChatList(updatedChats);
    }
  }, [chatData, userInfo]);

  
  useEffect(() => {
    if (!userInfo) return;

    socket.emit("setup", userInfo);

    const handleNewMessage = (msg) => {
      if (!msg?.chat || !msg?.savedMessage) return;

      const chatId = msg.chat._id;
      const senderId = msg.sender._id;

      setChatList((prev) => {
        const existing = prev.find(c => c._id === chatId);

        if (existing) {
          const increment =
            senderId !== userInfo._id && chatId !== selectedChat?._id ? 1 : 0;

          return prev.map((c) =>
            c._id === chatId
              ? {
                  ...c,
                  latestMessage: msg.savedMessage,
                  unreadCounts: {
                    ...c.unreadCounts,
                    [userInfo._id]:
                      (c.unreadCounts?.[userInfo._id] || 0) + increment,
                  },
                }
              : c
          );
        } else {
         
          return [
            ...prev,
            {
              ...msg.chat,
              latestMessage: msg.savedMessage,
              unreadCounts: { [userInfo._id]: senderId !== userInfo._id ? 1 : 0 },
            },
          ];
        }
      });
    };

    socket.on("newMessageAlert", handleNewMessage);
    return () => socket.off("newMessageAlert", handleNewMessage);
  }, [userInfo, selectedChat]);

 
  useEffect(() => {
    if (!selectedChat) return;

    setChatList((prev) =>
      prev.map((c) =>
        c._id === selectedChat._id
          ? { ...c, unreadCounts: { ...c.unreadCounts, [userInfo._id]: 0 } }
          : c
      )
    );
  }, [selectedChat, userInfo]);

  const handleSelectUser = async (chat, user) => {
    console.log(' User selected:', user?.email);
    console.log(' Existing chat:', chat?._id);
    
    if (!chat) {
     
      setIsCreatingChat(true);
      try {
        
        const data = await createChat({ userId: user._id }).unwrap();
       
        
        const newChat = {
          ...data,
          unreadCounts: { [userInfo._id]: 0 },
        };

    
        setChatList(prev => {
          if (!prev.find(c => c._id === newChat._id)) {
            return [...prev, newChat];
          }
          return prev;
        });

        setSelectedChat(newChat);
        setSelectedUser(user);
        
        toast.success(`Started chat with ${user.name}`);
      } catch (err) {
        console.error(' Chat creation failed:', err);
        toast.error(`Failed to start chat: ${err.data?.message || 'Unknown error'}`);
      } finally {
        setIsCreatingChat(false);
      }
    } else {
      
      console.log(' Using existing chat:', chat._id);
      setSelectedChat(chat);
      setSelectedUser(user);
    }
  };

  if (!userInfo) return null;

  if (isLoadingChats) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
        <p>Loading chats...</p>
      </div>
    );
  }

  if (chatError) {
    return (
      <div className="mt-5">
        <Alert variant="danger">
          Failed to load chats. Please try again.
        </Alert>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <Row>
        <Col lg={4} md={5} sm={12}>
          <Sidebar
            searchKey={searchKey}
            setSearchKey={setSearchKey}
            setChats={setChatList}
          />
          {isCreatingChat && (
            <div className="text-center p-2">
              <Spinner size="sm" /> Creating chat...
            </div>
          )}
          <UserList
            searchTerm={searchKey}
            chats={chatList}
            onSelectUser={handleSelectUser}
          />
        </Col>

        <Col lg={8} md={7} sm={12}>
          {selectedChat ? (
            <ChatBox
              key={selectedChat._id}
              chatId={selectedChat._id}
              chatData={selectedChat}
              selectedUser={selectedUser}
            />
          ) : (
            <div className="welcome-screen text-center mt-5">
              <div className="p-5 rounded bg-light">
                <h4>Welcome, {userInfo.name}! </h4>
                <p className="text-muted">
                  Select a user from the list to start chatting or continue an existing conversation.
                </p>
                <small className="text-info">
                  {chatList.length} chat(s) available
                </small>
              </div>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HomeScreen;