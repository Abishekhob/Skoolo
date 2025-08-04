// AdminSidebar.jsx
import React, { useState, useEffect } from 'react';
import { Nav, Button, Accordion } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FaBars, FaTimes, FaChalkboardTeacher, FaBook, FaUsers, FaMoneyBillWave, FaGraduationCap, FaAngleDown, FaAngleUp } from 'react-icons/fa';
import { RiDashboardFill } from 'react-icons/ri';
import './style/AdminSidebar.css'; // Import the CSS file

const AdminSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To get the current path
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeKey, setActiveKey] = useState(""); // For accordion control

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedClass');
    localStorage.removeItem('selectedSection');
    navigate('/');
  };

  // Close sidebar on larger screens if it was open on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) { // md breakpoint in Bootstrap is 768px
        setSidebarOpen(false); // Close sidebar on desktop
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Set initial active accordion key based on current path
  useEffect(() => {
    if (location.pathname.startsWith("/admin/classes")) setActiveKey("0");
    else if (location.pathname.startsWith("/admin/teachers") || location.pathname.startsWith("/admin/timetable-scheduler")) setActiveKey("1");
    else if (location.pathname.startsWith("/admin/subjects")) setActiveKey("2");
    else if (location.pathname.startsWith("/admin/parents")) setActiveKey("3");
    else if (location.pathname.startsWith("/admin/fees")) setActiveKey("4");
    else if (location.pathname.startsWith("/admin/promotions")) setActiveKey("5");
    else if (location.pathname.startsWith("/admin/syllabus")) setActiveKey("6");
    else setActiveKey(""); // No active accordion if path doesn't match
  }, [location.pathname]);

  const navItems = [
    {
      title: "Classes",
      icon: <FaBook />,
      links: [
        { name: "List All Classes", path: "/admin/classes" },
      ],
      eventKey: "0",
    },
    {
      title: "Teachers",
      icon: <FaChalkboardTeacher />,
      links: [
        { name: "Manage Teachers", path: "/admin/teachers" },
        { name: "Assign Teachers to Periods", path: "/admin/timetable-scheduler" },
      ],
      eventKey: "1",
    },
    {
      title: "Subjects",
      icon: <FaBook />,
      links: [
        { name: "Manage Subjects", path: "/admin/subjects" },
      ],
      eventKey: "2",
    },
    {
      title: "Parents",
      icon: <FaUsers />,
      links: [
        { name: "View All Parents", path: "/admin/parents" },
      ],
      eventKey: "3",
    },
    {
      title: "Fees",
      icon: <FaMoneyBillWave />,
      links: [
        { name: "Manage Fees", path: "/admin/fees" },
      ],
      eventKey: "4",
    },
    {
      title: "Promotions",
      icon: <FaGraduationCap />,
      links: [
        { name: "Student Promotions", path: "/admin/promotions" },
      ],
      eventKey: "5",
    },
    {
  title: "Syllabus",
  icon: <FaBook />,
  links: [
    { name: "Manage Syllabus", path: "/admin/syllabus" },
  ],
  eventKey: "6",
}

  ];

  return (
    <>
      {/* Mobile Toggle Button */}
      <Button
        variant="primary"
        className="sidebar-toggle-btn d-md-none" // Only visible on small screens
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-controls="admin-sidebar-menu"
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <FaTimes /> : <FaBars />}
      </Button>

      <div
        className={`admin-sidebar bg-dark text-white p-3 d-flex flex-column ${sidebarOpen ? 'open' : ''}`}
      >
        <div className="sidebar-header d-flex justify-content-between align-items-center mb-4">
          <h4 className="m-0 d-flex align-items-center">
            <RiDashboardFill className="me-2" /> Admin Panel
          </h4>
          <Button
            variant="link"
            className="text-white d-md-none sidebar-close-btn" // Close button for mobile sidebar
            onClick={() => setSidebarOpen(false)}
            aria-label="Close sidebar"
          >
            <FaTimes />
          </Button>
        </div>

        <Nav className="flex-column flex-grow-1 sidebar-nav">
          <Accordion alwaysOpen activeKey={activeKey} onSelect={(eventKey) => setActiveKey(eventKey)}>
            {navItems.map((category, index) => (
              <Accordion.Item eventKey={category.eventKey} key={index} className="sidebar-accordion-item">
                <Accordion.Header className="sidebar-accordion-header">
                  <span className="sidebar-accordion-title">
                    {category.icon} {category.title}
                  </span>
                  {activeKey === category.eventKey ? <FaAngleUp /> : <FaAngleDown />}
                </Accordion.Header>
                <Accordion.Body className="sidebar-accordion-body p-0">
                  {category.links.map((link, linkIndex) => (
                    <Nav.Link
                      key={linkIndex}
                      as={Link}
                      to={link.path}
                      className={`sidebar-nav-link ${location.pathname === link.path ? 'active' : ''}`}
                      onClick={() => {
                        if (window.innerWidth <= 768) { // Close sidebar on mobile after clicking a link
                          setSidebarOpen(false);
                        }
                      }}
                    >
                      {link.name}
                    </Nav.Link>
                  ))}
                </Accordion.Body>
              </Accordion.Item>
            ))}
          </Accordion>

          <Button variant="outline-light" className="mt-auto sidebar-logout-btn" onClick={handleLogout}>
            Logout
          </Button>
        </Nav>
      </div>
    </>
  );
};

export default AdminSidebar;