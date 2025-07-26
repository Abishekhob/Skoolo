import React, { useState } from 'react';
import { Col, Nav, Button, Navbar } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    FaTachometerAlt,
    FaCalendarAlt,
    FaUsers,
    FaCheckSquare,
    FaBookOpen,
    FaUserCircle,
    FaSignOutAlt,
    FaChartBar,
    FaBars,
    FaTimes,
    FaComments
} from 'react-icons/fa';
import './style/TeacherSidebar.css'; // Import the CSS file

const TeacherSidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('teacherId');
        navigate('/');
    };

    const isActive = (path) => location.pathname === path;

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    // Navigation items for easier management
    const navItems = [
        {
            category: 'Timetable',
            icon: FaCalendarAlt,
            items: [
                { path: '/teacher/timetable', label: 'View Timetable' }
            ]
        },
        {
            category: 'Students',
            icon: FaUsers,
            items: [
                { path: '/teacher/students', label: 'Student List' }
            ]
        },
        {
            category: 'Attendance',
            icon: FaCheckSquare,
            items: [
                { path: '/teacher/attendance', label: 'Manage Attendance' }
            ]
        },
        {
            category: 'Assignments',
            icon: FaBookOpen,
            items: [
                { path: '/teacher/assignments', label: 'Manage Assignments' }
            ]
        },
        {
            category: 'Grades / Assessments',
            icon: FaChartBar,
            items: [
                { path: '/teacher/grades', label: 'Manage Marks' }
            ]
        },
        {
            category: 'Communication',
            icon: FaComments,
            items: [
                { path: '/teacher/messages', label: 'Messages' }
            ]
        },
        {
            category: 'Profile',
            icon: FaUserCircle,
            items: [
                { path: '/teacher/profile', label: 'My Profile' }
            ]
        }
    ];

    return (
        <>
            {/* Mobile Header with Menu Toggle */}
            <div className="mobile-header d-lg-none">
                <Navbar className="mobile-navbar px-3 py-2">
                    <Navbar.Brand className="mobile-title">Teacher Panel</Navbar.Brand>
                    <Button 
                        variant="outline-light" 
                        className="mobile-menu-toggle"
                        onClick={toggleMobileMenu}
                    >
                        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
                    </Button>
                </Navbar>
            </div>

            {/* Overlay for mobile menu */}
            {isMobileMenuOpen && (
                <div className="mobile-overlay" onClick={closeMobileMenu}></div>
            )}

            {/* Sidebar */}
            <Col
                lg={2}
                className={`teacher-sidebar d-flex flex-column ${isMobileMenuOpen ? 'mobile-open' : ''}`}
            >
                <div className="sidebar-header">
                    <h4 className="sidebar-title d-none d-lg-block">
                        Teacher Panel
                    </h4>
                </div>
                
                <div className="sidebar-content">
                    <Nav className="flex-column flex-grow-1 nav-container">
                        {navItems.map((section, index) => (
                            <div key={index} className="nav-section">
                                <h6 className="nav-category">
                                    <section.icon className="category-icon" /> 
                                    <span className="category-text">{section.category}</span>
                                </h6>
                                {section.items.map((item, itemIndex) => (
                                    <Nav.Link
                                        key={itemIndex}
                                        as={Link}
                                        to={item.path}
                                        className={`nav-link-custom ${isActive(item.path) ? 'active' : ''}`}
                                        onClick={closeMobileMenu}
                                    >
                                        <span className="sub-nav-link">{item.label}</span>
                                    </Nav.Link>
                                ))}
                            </div>
                        ))}
                    </Nav>

                    <div className="logout-container">
                        <Button 
                            variant="outline-light" 
                            className="logout-button"
                            onClick={() => {
                                handleLogout();
                                closeMobileMenu();
                            }}
                        >
                            <FaSignOutAlt className="me-2" /> 
                            <span>Logout</span>
                        </Button>
                    </div>
                </div>
            </Col>
        </>
    );
};

export default TeacherSidebar;