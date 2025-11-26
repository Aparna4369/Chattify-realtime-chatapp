import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Row, Col } from 'react-bootstrap';
import Sidebar from '../components/Sidebar';
import UserList from '../components/UserList';
import ChatBox from '../components/ChatBox';
import socket from '../socket';
import { toast } from "react-toastify";

const HomeScreen = () => {
  const [searchKey, setSearchKey] = useState('');
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  const [notifications, setNotifications] = useState([]);

  // 🔔 Listen for new message alerts
  useEffect(() => {
    socket.on("newMessageAlert", (msg) => {
      setNotifications((prev) => [...prev, msg]);

      // 🎉 Show toast popup
      toast.info(`New message from ${msg.senderName}`);
    });

    return () => {
      socket.off("newMessageAlert");
    };
  }, []);

  // ✔ Clear notifications when user opens chat
  useEffect(() => {
    if (selectedChatId) {
      socket.emit("clearNotifications");
    }
  }, [selectedChatId]);

  // Receive confirmation from backend
  useEffect(() => {
    socket.on("notificationsCleared", () => {
      setNotifications([]);
    });

    return () => {
      socket.off("notificationsCleared");
    };
  }, []);


  return (
    <div>
      <Header />

      <Row>
        <Col lg={4} md={5} sm={12}>
          {/* Pass notifications to sidebar */}
          <Sidebar onSearch={setSearchKey} notifications={notifications} />

          <UserList
            searchTerm={searchKey}
            onSelectUser={(chatId, user) => {
              setSelectedChatId(chatId);
              setSelectedUser(user);
            }}
          />
        </Col>

        <Col lg={8} md={7} sm={12}>
          {selectedChatId ? (
            <ChatBox chatId={selectedChatId} selectedUser={selectedUser} />
          ) : (
            <div className="text-center mt-5 text-muted">
              <h5>Select a user to start chatting 💬</h5>
            </div>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default HomeScreen;
