import React, { useState } from "react";
import { 
  Modal, Button, Badge, ListGroup, 
  Form, InputGroup, Alert, Row, Col
} from "react-bootstrap";
import { 
  FaUserPlus, FaSearch, FaCheck, FaTimes, 
  FaUsers, FaCrown, FaTrash, FaUser
} from "react-icons/fa";
import { toast } from "react-toastify";
import { useGetUsersQuery } from "../slices/userApiSlice";
import { useCreateGroupChatMutation } from "../slices/chatApiSlice";
import "../styles/groupInfoModal.css";

const CreateGroupModal = ({ 
  show, 
  onHide,
  setChats 
}) => {
  const [groupName, setGroupName] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminSettings, setAdminSettings] = useState({
    canAddMembers: true,
    canDeleteGroup: true,
    onlyAdminCanDelete: true
  });
  
  
  const currentUser = JSON.parse(localStorage.getItem("userInfo")) || {};
  
  
  const { data: users = [] } = useGetUsersQuery();
  const [createGroupChat, { isLoading }] = useCreateGroupChatMutation();
  
 
  const filteredUsers = users.filter(user => 
    user._id !== currentUser._id &&  // Exclude current user
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  
  const handleUserSelect = (user) => {
    const isAlreadySelected = selectedUsers.some(u => u._id === user._id);
    
    if (isAlreadySelected) {
     
      setSelectedUsers(selectedUsers.filter(u => u._id !== user._id));
    } else { 
      setSelectedUsers([...selectedUsers, user]);
    }
  };
  

  const removeSelectedUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(user => user._id !== userId));
  };
  
  
  const handleCreateGroup = async () => {
   
    if (!groupName.trim()) {
      toast.error("Please enter a group name");
      return;
    }
    
    if (selectedUsers.length < 2) {
      toast.error("Please select at least 2 members");
      return;
    }
    
    try {
      
      const userIds = selectedUsers.map(user => user._id);
      
     
      const result = await createGroupChat({
        users: userIds,
        name: groupName.trim(),
        adminSettings: adminSettings  // Send admin settings to backend
      }).unwrap();
      
     
      toast.success(`Group "${groupName}" created successfully! You are the admin.`);
     
      if (setChats && result.chat) {
        setChats(prev => [result.chat, ...prev]);
      }
      
    
      setGroupName("");
      setSelectedUsers([]);
      setAdminSettings({
        canAddMembers: true,
        canDeleteGroup: true,
        onlyAdminCanDelete: true
      });
      onHide();
      
    } catch (error) {
      console.error("Create group error:", error);
      toast.error(error.data?.message || "Failed to create group");
    }
  };
  
  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="group-modal-header bg-primary text-white">
        <Modal.Title>
          <FaUserPlus className="me-2" />
          Create New Group
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="group-modal-body">
        {/* Group Name Input */}
        <div className="group-name-section mb-4">
          <h5 className="section-title mb-3">
            <FaCrown className="me-2 text-warning" />
            Group Name
          </h5>
          <Form.Control
            type="text"
            placeholder="Enter a name for your group (e.g., Family, Friends, Project Team)"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-name-input py-2"
            maxLength={50}
          />
          <Form.Text className="text-muted">
            {50 - groupName.length} characters remaining
          </Form.Text>
        </div>
        
        {/* Admin Info Card */}
        <Alert variant="info" className="mb-4">
          <div className="d-flex align-items-center">
            <FaCrown className="me-2 text-warning" size={20} />
            <div>
              <strong>You will be the Group Admin</strong>
              <p className="mb-0 small">
                As admin, you can manage members, delete the group, and control permissions.
              </p>
            </div>
          </div>
        </Alert>
        
        {/* Admin Settings */}
        <div className="admin-settings-section mb-4">
          <h6 className="section-title mb-3">
            <FaCrown className="me-2 text-warning" />
            Admin Settings
          </h6>
          
          <Row className="g-3">
            <Col md={6}>
              <Form.Check 
                type="switch"
                id="can-add-members"
                label="Admin can add new members"
                checked={adminSettings.canAddMembers}
                onChange={(e) => setAdminSettings({
                  ...adminSettings,
                  canAddMembers: e.target.checked
                })}
                className="mb-2"
              />
              <small className="text-muted">
                Only admin can invite new members to the group
              </small>
            </Col>
            
            <Col md={6}>
              <Form.Check 
                type="switch"
                id="only-admin-delete"
                label="Only admin can delete group"
                checked={adminSettings.onlyAdminCanDelete}
                onChange={(e) => setAdminSettings({
                  ...adminSettings,
                  onlyAdminCanDelete: e.target.checked
                })}
                className="mb-2"
              />
              <small className="text-muted">
                Restrict group deletion to admin only
              </small>
            </Col>
          </Row>
        </div>
        
       
        {selectedUsers.length > 0 && (
          <div className="selected-users-section mb-4">
            <h6 className="section-title mb-2">
              <FaUsers className="me-2" />
              Selected Members ({selectedUsers.length})
            </h6>
            <div className="d-flex flex-wrap gap-2 mb-3">
              {selectedUsers.map(user => (
                <Badge 
                  key={user._id} 
                  bg="primary" 
                  className="p-2 d-flex align-items-center selected-user-badge"
                >
                  <FaUser className="me-1" size={12} />
                  {user.name}
                  <Button
                    variant="link"
                    className="text-white p-0 ms-2"
                    style={{ fontSize: '0.7rem' }}
                    onClick={() => removeSelectedUser(user._id)}
                  >
                    <FaTimes />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}
        
       
        <div className="search-section mb-3">
          <h6 className="section-title mb-3">Add Initial Members</h6>
          <InputGroup>
            <InputGroup.Text>
              <FaSearch />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search users by name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </div>
        
        
        <div className="members-section">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="section-title">
              Available Users ({filteredUsers.length})
            </h6>
            <small className="text-muted">
              Click to select/deselect
            </small>
          </div>
          
          <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
            <ListGroup className="members-list">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(user => {
                  const isSelected = selectedUsers.some(u => u._id === user._id);
                  
                  return (
                    <ListGroup.Item
                      key={user._id}
                      className={`member-item ${isSelected ? 'selected' : ''}`}
                      onClick={() => handleUserSelect(user)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center">
                          <div className="member-avatar me-3">
                            {user.name?.[0]?.toUpperCase() || 'U'}
                          </div>
                          <div>
                            <strong className="d-block">{user.name}</strong>
                            <small className="text-muted">{user.email}</small>
                          </div>
                        </div>
                        
                        {isSelected ? (
                          <Badge bg="success" className="px-3">
                            <FaCheck className="me-1" />
                            Selected
                          </Badge>
                        ) : (
                          <Badge bg="outline-secondary" className="text-dark border">
                            Click to select
                          </Badge>
                        )}
                      </div>
                    </ListGroup.Item>
                  );
                })
              ) : (
                <Alert variant="info" className="text-center m-3">
                  <FaSearch className="mb-2" size={24} />
                  <p className="mb-0">No users found{searchTerm && ` for "${searchTerm}"`}</p>
                </Alert>
              )}
            </ListGroup>
          </div>
        </div>
        
       
        <Alert 
          variant={groupName.trim() && selectedUsers.length >= 2 ? "success" : "warning"}
          className="mt-4"
        >
          <div className="row">
            <div className="col-md-4">
              <strong> Group Name:</strong><br/>
              {groupName.trim() ? "✓ Provided" : "✗ Required"}
            </div>
            <div className="col-md-4">
              <strong> Members:</strong><br/>
              {selectedUsers.length}/2 minimum
            </div>
            <div className="col-md-4">
              <strong>Admin:</strong><br/>
              <FaCrown className="text-warning me-1" />
              {currentUser.name}
            </div>
          </div>
        </Alert>
      </Modal.Body>
      
      <Modal.Footer className="group-modal-footer">
        <Button 
          variant="secondary" 
          onClick={onHide}
          disabled={isLoading}
          className="close-btn"
        >
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleCreateGroup}
          disabled={isLoading || !groupName.trim() || selectedUsers.length < 2}
          className="create-btn px-4"
        >
          {isLoading ? (
            <>
              <span className="spinner-border spinner-border-sm me-2"></span>
              Creating...
            </>
          ) : (
            <>
              <FaCrown className="me-2" />
              Create Group as Admin
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default CreateGroupModal;