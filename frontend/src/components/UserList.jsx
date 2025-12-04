import React, { useState } from "react";
import { Row, Col, Badge, Modal, Button } from "react-bootstrap";
import { useGetUsersQuery } from "../slices/userApiSlice";
import { useDeleteChatMutation } from "../slices/chatApiSlice";
import { FaTrash, FaExclamationTriangle } from "react-icons/fa";
import { toast } from "react-toastify";
import "../styles/sidebar.css";

const UserList = ({ chats = [], onSelectUser, searchTerm = "", setChats }) => {
  const loggedUser = JSON.parse(localStorage.getItem("userInfo")) || {};
  const { data: users = [] } = useGetUsersQuery();
  
  
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [chatToDelete, setChatToDelete] = useState(null);

  const [deleteChat, { isLoading: isDeleting }] = useDeleteChatMutation();

 
  const usersWithoutChats = users.filter(
    (user) => {
      if (!user?._id || user._id === loggedUser._id) return false;
      
      return !chats.some((chat) => {
        if (chat?.isGroupChat) return false;
        
        const chatUsers = chat?.users || [];
        return chatUsers.some((chatUser) => {
          return chatUser?._id === user._id;
        });
      });
    }
  );

 
  const allItems = [
    ...chats
      .filter(chat => chat?._id)
      .map(chat => ({ ...chat, type: 'chat' })),
    ...usersWithoutChats.map(user => ({ ...user, type: 'user' }))
  ];

  
  const filteredItems = allItems.filter((item) => {
    if (!item) return false;
    
    if (item.type === 'chat') {
      if (item.isGroupChat) {
        return item.chatName?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      } else {
        const otherUser = (item.users || []).find(u => u?._id !== loggedUser._id);
        return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
      }
    } else {
      return item.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false;
    }
  });

  const getDisplayInfo = (item) => {
    if (!item) return { name: '', avatar: null, email: null, unread: 0 };
    
    if (item.type === 'chat') {
      if (item.isGroupChat) {
        return {
          name: item.chatName || 'Group Chat',
          avatar: null,
          email: null,
          unread: item.unreadCounts?.[loggedUser._id] || 0,
          isGroup: true
        };
      } else {
        const otherUser = (item.users || []).find(u => u?._id !== loggedUser._id);
        return {
          name: otherUser?.name || 'Unknown User',
          avatar: otherUser?.image,
          email: otherUser?.email,
          unread: item.unreadCounts?.[loggedUser._id] || 0,
          isGroup: false
        };
      }
    } else {
      return {
        name: item.name || 'Unknown',
        avatar: item.image,
        email: item.email,
        unread: 0,
        isGroup: false
      };
    }
  };

const handleClick = (item) => {
  console.log(' CLICKED:', item.name, 'Type:', item.type);
  
  if (!item || !onSelectUser) return;
  
  if (item.type === 'chat') {
    const otherUser = item.isGroupChat 
      ? null 
      : (item.users || []).find(u => u?._id !== loggedUser._id);
    onSelectUser(item, otherUser);
  } else {
    console.log(' User without chat clicked - should create chat');
    onSelectUser(null, item);
  }
};

 
  const handleDeleteClick = (e, chat) => {
    e.stopPropagation();
    setChatToDelete(chat);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!chatToDelete) return;
    
    try {
      await deleteChat(chatToDelete._id).unwrap();
      
    
      if (setChats) {
        setChats(prev => prev.filter(chat => chat._id !== chatToDelete._id));
      }
      
      toast.success(
        chatToDelete.isGroupChat 
          ? "Group chat deleted successfully" 
          : "Chat deleted successfully"
      );
      
      setShowDeleteModal(false);
      setChatToDelete(null);
    } catch (error) {
      console.error("Delete chat error:", error);
      toast.error(
        error.data?.message || 
        (chatToDelete.isGroupChat 
          ? "Failed to delete group chat" 
          : "Failed to delete chat")
      );
    }
  };

  const cancelDelete = () => {
    setShowDeleteModal(false);
    setChatToDelete(null);
  };

  return (
    <div className="userlist-wrapper">
     
      <Modal show={showDeleteModal} onHide={cancelDelete} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            <FaExclamationTriangle className="text-warning me-2" />
            Delete Chat
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {chatToDelete && (
            <>
              <p className="mb-3">
                Are you sure you want to delete this {chatToDelete.isGroupChat ? 'group chat' : 'chat'}?
              </p>
              
              {chatToDelete.isGroupChat ? (
                <div className="alert alert-warning">
                  <strong>Group:</strong> {chatToDelete.chatName}<br/>
                  <small>This will delete the group for all members.</small>
                </div>
              ) : (
                <div className="alert alert-warning">
                  <strong>Chat with:</strong> {
                    (chatToDelete.users || [])
                      .find(u => u?._id !== loggedUser._id)?.name || 'Unknown user'
                  }
                </div>
              )}
              
              <p className="text-danger small">
                <FaExclamationTriangle /> This action cannot be undone. All messages will be permanently deleted.
              </p>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={cancelDelete} disabled={isDeleting}>
            Cancel
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmDelete} 
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Deleting...
              </>
            ) : (
              <>
                <FaTrash className="me-2" />
                Delete
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {filteredItems.length > 0 ? (
        filteredItems.map((item) => {
          if (!item) return null;
          
          const { name, avatar, email, unread, isGroup } = getDisplayInfo(item);
          const isUserWithoutChat = item.type === 'user';

          return (
            <div
              key={item.type === 'chat' ? item._id : `user-${item._id}`}
              className="user-row-wrapper"
              onClick={() => handleClick(item)}
              style={{
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <Row className="user-row align-items-center p-2">
                <Col xs="auto">
                  {avatar ? (
                    <img src={avatar} alt={name} className="profile-pic" />
                  ) : (
                    <div className="profile-pic fallback">
                      {name?.[0]?.toUpperCase() || 'U'}
                    </div>
                  )}
                </Col>

                <Col className="user-info">
                  <div className="d-flex align-items-center">
                    <span className="me-2">{name}</span>
                    {isGroup && (
                      <Badge bg="info" pill className="group-badge">
                        Group
                      </Badge>
                    )}
                  </div>
                  {email && <p className="text-muted small mb-0">{email}</p>}
                  {isUserWithoutChat && (
                    <small className="text-info">Click to start chat</small>
                  )}
                </Col>

                <Col xs="auto" className="d-flex align-items-center">
                  {/* Unread count badge */}
                  {unread > 0 && (
                    <Badge bg="danger" pill className="unread-badge me-2">
                      {unread}
                    </Badge>
                  )}
                </Col>
              </Row>

              
              {!isUserWithoutChat && (
                <button
                  className="delete-chat-button"
                  onClick={(e) => handleDeleteClick(e, item)}
                  title="Delete chat"
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: '#dc3545',
                    padding: '6px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    opacity: 0.7,
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '1';
                    e.currentTarget.style.background = 'rgba(220, 53, 69, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '0.7';
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <FaTrash size={14} />
                </button>
              )}
            </div>
          );
        })
      ) : (
        <p className="text-center text-muted mt-3">No chats or users found</p>
      )}
      
    </div>
  );
};

export default UserList;