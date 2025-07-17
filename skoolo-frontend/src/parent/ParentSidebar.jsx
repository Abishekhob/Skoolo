import React, { useState } from 'react'; // useEffect and location hook are not used here as no state depends on window.innerWidth
import { Col, Offcanvas, Nav, Button } from 'react-bootstrap';
import { Link, useLocation } from 'react-router-dom';
import { MdMenu, MdAccountCircle, MdGrade, MdAccessTime, MdAssignment, MdCheckCircle, MdMessage, MdAttachMoney } from 'react-icons/md';
import './style/ParentSidebar.css'; // Import the CSS file

const ParentSidebar = () => {
  const [showSidebar, setShowSidebar] = useState(false); // Mobile sidebar is hidden by default
  const location = useLocation();

  const toggleSidebar = () => setShowSidebar(!showSidebar);

  const menuItems = [
    { name: 'Children Profile', path: '/parent/profile', icon: <MdAccountCircle /> },
    { name: 'Marks', path: '/parent/marks', icon: <MdGrade /> },
    { name: 'Timetable', path: '/parent/timetable', icon: <MdAccessTime /> },
    { name: 'Assignments', path: '/parent/assignments', icon: <MdAssignment /> },
    { name: 'Attendance', path: '/parent/attendance', icon: <MdCheckCircle /> },
    { name: 'Messages', path: '/parent/messages', icon: <MdMessage /> },
    { name: 'Fees', path: '/parent/fees', icon: <MdAttachMoney /> },
  ];

  return (
    <>
      {/* Mobile toggle button - Only visible on small screens (d-md-none) */}
      <button 
        className="menu-toggle-button" // Apply custom style
        onClick={toggleSidebar}
      >
        <MdMenu /> Menu
      </button>

      {/* Offcanvas for mobile sidebar - Only visible on small screens (d-md-none) */}
      <Offcanvas 
        show={showSidebar} 
        onHide={toggleSidebar} 
        placement="start" 
        className="styled-offcanvas" // Apply custom style
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
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} // Apply custom style and active state
                onClick={toggleSidebar} // Close sidebar on link click
              >
                {item.icon} {item.name}
              </Link>
            ))}
          </nav>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Desktop sidebar - Hidden on small screens (d-none) and visible on medium/large (d-md-block) */}
      <Col
        md={3} // Increased width slightly for better spacing
        className="desktop-sidebar-container d-none d-md-block" // Apply custom style
      >
        <h4 className="sidebar-header">Parent Dashboard</h4> {/* Apply custom style */}
        <nav className="nav-list"> {/* Apply custom style */}
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`} // Apply custom style and active state
            >
              {item.icon} {item.name}
            </Link>
          ))}
        </nav>
      </Col>
    </>
  );
};

export default ParentSidebar;