import React, { useState } from 'react';
import '../styles/home.css';
import { FaSearch } from "react-icons/fa";
import { IoNotifications } from "react-icons/io5";

const Sidebar = ({ onSearch, notifications = [] }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };

  return (
    <div className='sidebar py-4'>

      {/* 🔍 SEARCH + 🔔 NOTIFICATION IN ONE LINE */}
      <div className="sidebar-top-row d-flex align-items-center ms-4">

        {/* Search box */}
        <form 
          onSubmit={(e) => e.preventDefault()} 
          className="d-flex align-items-center search-wrapper"
        >
          <input
            type="text"
            value={searchTerm}
            className='search'
            onChange={handleChange}
            placeholder='search...'
          />
          <button type='submit' className='searchBtn'>
            <FaSearch />
          </button>
        </form>

        {/* Notification Icon */}
        <div className="notification-icon position-relative ms-5">
          <IoNotifications size={28} className="text-danger" />

          {notifications.length > 0 && (
            <span className="notif-count">
              {notifications.length}
            </span>
          )}
        </div>

      </div>

    </div>
  );
};

export default Sidebar;
