import React, { useState } from "react";
import { 
  Modal, Button, Badge, ListGroup, 
  Form, InputGroup, Alert, Spinner
} from "react-bootstrap";
import { 
  FaCrown, FaTrash, FaUsers, 
  FaEdit,FaUserPlus, FaSearch,
  FaDoorOpen
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetUsersQuery } from "../slices/userApiSlice";
import { 
  useAddUserToGroupMutation, 
  useRemoveUserFromGroupMutation, 
  useDeleteChatMutation,
  useRenameGroupMutation
} from "../slices/chatApiSlice";

const GroupInfoModal = ({ 
  show, 
  onHide, 
  chat = {},
  currentUser = {},
  setChats
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditingName, setIsEditingName] = useState(false);
  const [newGroupName, setNewGroupName] = useState(chat?.chatName || "");
  const [showAddMember, setShowAddMember] = useState(false);
  
  // Get all users
  const { data: users = [], isLoading: loadingUsers } = useGetUsersQuery();
  
  // API mutations
  const [addToGroup, { isLoading: addingMember }] = useAddUserToGroupMutation();
  const [removeFromGroup, { isLoading: removingMember }] = useRemoveUserFromGroupMutation();
  const [deleteChat, { isLoading: deletingChat }] = useDeleteChatMutation();
  const [renameGroup, { isLoading: renamingGroup }] = useRenameGroupMutation();
  
 
  const isAdmin = chat?.groupAdmin?._id === currentUser?._id;
  
  const otherMembers = chat?.users?.filter(user => 
    user?._id !== currentUser?._id
  ) || [];
  
  
  const availableUsers = users.filter(user => 
    user._id !== currentUser._id &&
    !chat?.users?.some(member => member._id === user._id) &&
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  

  const handleAddMember = async (userId) => {
    if (!isAdmin) {
      toast.error("Only admin can add members");
      return;
    }
    
    try {
      const result = await addToGroup({
        chatId: chat._id,
        userId
      }).unwrap();
      
      toast.success("Member added successfully");
      setShowAddMember(false);
      setSearchTerm("");
      
      // Update chats list
      if (setChats) {
        setChats(prev => prev.map(c => 
          c._id === chat._id ? result.chat : c
        ));
      }
      
    } catch (error) {
      toast.error(error.data?.message || "Failed to add member");
    }
  };
  
  // Handle remove member
  const handleRemoveMember = async (userId) => {
    if (!isAdmin && userId !== currentUser._id) {
      toast.error("Only admin can remove other members");
      return;
    }
    
    if (!window.confirm(
      userId === currentUser._id 
        ? "Are you sure you want to leave this group?"
        : "Are you sure you want to remove this member?"
    )) return;
    
    try {
      const result = await removeFromGroup({
        chatId: chat._id,
        userId
      }).unwrap();
      
      toast.success(
        userId === currentUser._id 
          ? "You left the group" 
          : "Member removed successfully"
      );
      
      
      if (setChats) {
        if (userId === currentUser._id) {
         
          setChats(prev => prev.filter(c => c._id !== chat._id));
        } else {
          
          setChats(prev => prev.map(c => 
            c._id === chat._id ? result.chat : c
          ));
        }
      }
      
      
      if (userId === currentUser._id) {
        onHide();
      }
      
    } catch (error) {
      toast.error(error.data?.message || "Failed to remove member");
    }
  };
  
 
  const handleRenameGroup = async () => {
    if (!isAdmin) {
      toast.error("Only admin can rename group");
      return;
    }
    
    if (!newGroupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    try {
      const result = await renameGroup({
        chatId: chat._id,
        chatName: newGroupName.trim()
      }).unwrap();
      
      toast.success("Group renamed successfully");
      setIsEditingName(false);
      
      
      if (setChats) {
        setChats(prev => prev.map(c => 
          c._id === chat._id ? result : c
        ));
      }
      
    } catch (error) {
      toast.error(error.data?.message || "Failed to rename group");
    }
  };
  
  // Handle delete group
  const handleDeleteGroup = async () => {
    if (!isAdmin) {
      toast.error("Only admin can delete the group");
      return;
    }
    
    if (!window.confirm("Are you sure you want to delete this group? This action cannot be undone.")) {
      return;
    }
    
    try {
      await deleteChat(chat._id).unwrap();
      
      toast.success("Group deleted successfully");
      
   
      if (setChats) {
        setChats(prev => prev.filter(c => c._id !== chat._id));
      }
      
      onHide();
      
    } catch (error) {
      toast.error(error.data?.message || "Failed to delete group");
    }
  };
  
  if (!chat || !chat._id) {
    return null;
  }
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <FaUsers className="me-2" />
          Group Information
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body>
     
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5>Group Name</h5>
            {isAdmin && !isEditingName && (
              <Button 
                variant="outline-secondary" 
                size="sm"
                onClick={() => setIsEditingName(true)}
              >
                <FaEdit className="me-1" />
                Edit
              </Button>
            )}
          </div>
          
          {isEditingName ? (
            <InputGroup className="mb-3">
              <Form.Control
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                placeholder="Enter new group name"
              />
              <Button 
                variant="success"
                onClick={handleRenameGroup}
                disabled={!newGroupName.trim() || renamingGroup}
              >
                {renamingGroup ? (
                  <Spinner size="sm" />
                ) : (
                  "Save"
                )}
              </Button>
              <Button 
                variant="secondary"
                onClick={() => {
                  setIsEditingName(false);
                  setNewGroupName(chat.chatName);
                }}
              >
                Cancel
              </Button>
            </InputGroup>
          ) : (
            <div className="d-flex align-items-center">
              <h4 className="mb-0">{chat.chatName}</h4>
              {isAdmin && (
                <Badge bg="warning" className="ms-3">
                  <FaCrown className="me-1" />
                  Admin
                </Badge>
              )}
            </div>
          )}
          
          <p className="text-muted small mt-2">
            Created on {new Date(chat.createdAt).toLocaleDateString()}
          </p>
        </div>
        
        
        <div className="mb-4">
          <h6>Group Admin</h6>
          <div className="d-flex align-items-center p-3 bg-light rounded">
            <div className="rounded-circle bg-primary text-white d-flex align-items-center justify-content-center me-3"
              style={{ width: '50px', height: '50px' }}>
              {chat.groupAdmin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div>
              <strong>{chat.groupAdmin?.name}</strong>
              <p className="text-muted small mb-0">{chat.groupAdmin?.email}</p>
            </div>
          </div>
        </div>
        
     
        <div className="mb-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6>
              Members ({chat.users?.length || 0})
            </h6>
            {isAdmin && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={() => setShowAddMember(!showAddMember)}
              >
                <FaUserPlus className="me-1" />
                Add Member
              </Button>
            )}
          </div>
          
       
          {showAddMember && isAdmin && (
            <div className="mb-4 p-3 border rounded">
              <h6 className="mb-3">Add New Member</h6>
              
              <InputGroup className="mb-3">
                <InputGroup.Text>
                  <FaSearch />
                </InputGroup.Text>
                <Form.Control
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
              
              {loadingUsers ? (
                <div className="text-center">
                  <Spinner size="sm" />
                </div>
              ) : availableUsers.length > 0 ? (
                <ListGroup>
                  {availableUsers.map(user => (
                    <ListGroup.Item
                      key={user._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="d-flex align-items-center">
                        <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                          style={{ width: '40px', height: '40px' }}>
                          {user.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <strong>{user.name}</strong>
                          <p className="text-muted small mb-0">{user.email}</p>
                        </div>
                      </div>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAddMember(user._id)}
                        disabled={addingMember}
                      >
                        {addingMember ? (
                          <Spinner size="sm" />
                        ) : (
                          "Add"
                        )}
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              ) : (
                <Alert variant="info" className="text-center">
                  No users found{searchTerm && ` for "${searchTerm}"`}
                </Alert>
              )}
            </div>
          )}
          
          
          <ListGroup>
           
            <ListGroup.Item className="d-flex justify-content-between align-items-center bg-light">
              <div className="d-flex align-items-center">
                <div className="rounded-circle bg-success text-white d-flex align-items-center justify-content-center me-3"
                  style={{ width: '40px', height: '40px' }}>
                  {currentUser.name?.[0]?.toUpperCase()}
                </div>
                <div>
                  <strong>{currentUser.name} (You)</strong>
                  <p className="text-muted small mb-0">{currentUser.email}</p>
                </div>
              </div>
              <Badge bg="info">You</Badge>
            </ListGroup.Item>
            
           
            {otherMembers.map(member => (
              <ListGroup.Item 
                key={member._id}
                className="d-flex justify-content-between align-items-center"
              >
                <div className="d-flex align-items-center">
                  <div className="rounded-circle bg-secondary text-white d-flex align-items-center justify-content-center me-3"
                    style={{ width: '40px', height: '40px' }}>
                    {member.name?.[0]?.toUpperCase()}
                  </div>
                  <div>
                    <strong>{member.name}</strong>
                    <p className="text-muted small mb-0">{member.email}</p>
                  </div>
                </div>
                
                <div className="d-flex gap-2">
                  {member._id === chat.groupAdmin?._id && (
                    <Badge bg="warning">
                      <FaCrown className="me-1" />
                      Admin
                    </Badge>
                  )}
                  
                  {(isAdmin || member._id === currentUser._id) && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleRemoveMember(member._id)}
                      disabled={removingMember}
                      title={member._id === currentUser._id ? "Leave group" : "Remove member"}
                    >
                      {member._id === currentUser._id ? (
                        <FaDoorOpen />
                      ) : (
                        <FaTrash />
                      )}
                    </Button>
                  )}
                </div>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </div>
        
       
        {isAdmin && (
          <Alert variant="danger">
            <h6>Danger Zone</h6>
            <p className="small mb-3">
              Deleting the group will remove all messages and members. This action cannot be undone.
            </p>
            <Button
              variant="danger"
              onClick={handleDeleteGroup}
              disabled={deletingChat}
            >
              {deletingChat ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Deleting...
                </>
              ) : (
                <>
                  <FaTrash className="me-2" />
                  Delete Group
                </>
              )}
            </Button>
          </Alert>
        )}
      </Modal.Body>
      
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupInfoModal;