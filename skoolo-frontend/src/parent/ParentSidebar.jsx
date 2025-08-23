import React, { useState } from 'react';
import { Col, Offcanvas } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  MdMenu, MdAccountCircle, MdGrade, MdAccessTime, MdAssignment, 
  MdCheckCircle, MdMessage, MdAttachMoney, MdSupportAgent, MdLogout
} from 'react-icons/md';

import './style/ParentSidebar.css';

const ParentSidebar = () => {
  const [showSidebar, setShowSidebar] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('token');
    sessionStorage.clear();
    
    // Redirect to login page
    navigate('/');
  };

  const menuItems = [
    { name: 'Children Profile', path: '/parent/profile', icon: <MdAccountCircle /> },
    { name: 'Marks', path: '/parent/marks', icon: <MdGrade /> },
    { name: 'Timetable', path: '/parent/timetable', icon: <MdAccessTime /> },
    { name: 'Assignments', path: '/parent/assignments', icon: <MdAssignment /> },
    { name: 'Syllabus', path: '/parent/syllabus', icon: <MdAssignment /> },
    { name: 'Attendance', path: '/parent/attendance', icon: <MdCheckCircle /> },
    { name: 'Messages', path: '/parent/messages', icon: <MdMessage /> },
    { name: 'Fees', path: '/parent/fees', icon: <MdAttachMoney /> },
    { name: 'Service Requests', path: '/parent/service-requests', icon: <MdSupportAgent /> }
  ];

  return (
    <>
      {/* Mobile toggle button */}
      <button 
        className="menu-toggle-button"
        onClick={toggleSidebar}
      >
        <MdMenu /> Menu
      </button>

      {/* Mobile Sidebar */}
      <Offcanvas 
        show={showSidebar} 
        onHide={toggleSidebar} 
        placement="start" 
        className="styled-offcanvas"
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Parent Dashboard</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <nav className="nav-list">
            {menuItems.map((item) => (
              <Link 
                key={item.path} 
                to={item.path} 
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={toggleSidebar}
              >
                {item.icon} {item.name}
              </Link>
            ))}
            {/* Logout for Mobile */}
            <button className="nav-item logout-btn" onClick={handleLogout}>
              <MdLogout /> Logout
            </button>
          </nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop Sidebar */}
      <Col
        md={3}
        className="desktop-sidebar-container d-none d-md-block"
      >
        <h4 className="sidebar-header">Parent Dashboard</h4>
        <nav className="nav-list">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon} {item.name}
            </Link>
          ))}
          {/* Logout for Desktop */}
          <button className="nav-item logout-btn" onClick={handleLogout}>
            <MdLogout /> Logout
          </button>
        </nav>
      </Col>
    </>
  );
};

export default ParentSidebar;
