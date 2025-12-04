import React, { useState } from "react";
import "../styles/sidebar.css";
import { FaSearch } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";
import CreateGroupModal from "./CreateGroupModal";

const Sidebar = ({ searchKey, setSearchKey, setChats, notifications = [], onNotificationClick }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openGroupModal, setOpenGroupModal] = useState(false);

   
  return (
    <div className="sidebar py-4">
      <div className="ms-4 mb-3">
        <button className="group-btn" onClick={() => setOpenGroupModal(true)}>
          + Create Group
        </button>
      </div>

      <div className="sidebar-top-row d-flex align-items-center ms-4">
        <form onSubmit={(e) => e.preventDefault()} className="d-flex align-items-center search-wrapper">
          <input
            type="text"
            value={searchKey}
            className="search"
            onChange={(e) => setSearchKey(e.target.value)}
            placeholder="Search..."
          />
          <button type="submit" className="searchBtn"><FaSearch /></button>
        </form>

        <div className="notification-icon position-relative ms-5">
          <IoNotifications
            size={28}
            className="text-danger"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            style={{ cursor: "pointer" }}
          />
          {notifications.length > 0 && <span className="notif-count">{notifications.length}</span>}
          {dropdownOpen && (
            <div className="notif-dropdown">
              {notifications.length === 0 ? (
                <p className="text-center text-muted p-2">No new messages</p>
              ) : (
                notifications.map((notif, idx) => (
                  <div key={idx} className="notif-item" onClick={() => onNotificationClick(notif)}>
                    <strong>{notif.sender.name}</strong>
                    <p className="m-0 small">{notif.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      
 <CreateGroupModal 
    show={openGroupModal}
    onHide={() => setOpenGroupModal(false)}
    setChats={setChats}  
  />

  

    </div>
  );
};


export default Sidebar;
