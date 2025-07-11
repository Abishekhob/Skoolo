import React from 'react';
import { Col, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt, // Dashboard
  FaCalendarAlt,    // Timetable
  FaUsers,          // Students
  FaCheckSquare,    // Attendance
  FaBookOpen,       // Assignments
  FaUserCircle,     // Profile
  FaSignOutAlt,     // Logout
  FaChartBar        // Mark
} from 'react-icons/fa';
import styles from './style/TeacherSidebar.module.css'; // Import CSS Modules

const TeacherSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // To get current path for active link

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('teacherId'); // Ensure teacher-specific ID is cleared
    navigate('/'); // Redirect to login page
  };

  const isActive = (path) => location.pathname === path;

  return (
    <Col
      md={2}
      className={`${styles.sidebar} d-flex flex-column p-3`}
    >
      <h4 className={styles.sidebarTitle}>
        Teacher Panel
      </h4>
      <Nav className="flex-column flex-grow-1">
        {/* Dashboard Link */}
        <Nav.Link
          as={Link}
          to="/teacher/dashboard"
          className={`${styles.navLink} ${isActive('/teacher/dashboard') ? styles.active : ''}`}
        >
          <FaTachometerAlt className={styles.navIcon} /> Dashboard
        </Nav.Link>

        {/* Timetable Section */}
        <h6 className={styles.navCategory}>
          <FaCalendarAlt className={styles.categoryIcon} /> Timetable
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/timetable"
          className={`${styles.navLink} ${isActive('/teacher/timetable') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>View Timetable</span>
        </Nav.Link>

        {/* Students Section */}
        <h6 className={styles.navCategory}>
          <FaUsers className={styles.categoryIcon} /> Students
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/students"
          className={`${styles.navLink} ${isActive('/teacher/students') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>Student List</span>
        </Nav.Link>

        {/* Attendance Section */}
        <h6 className={styles.navCategory}>
          <FaCheckSquare className={styles.categoryIcon} /> Attendance
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/attendance"
          className={`${styles.navLink} ${isActive('/teacher/attendance') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>Manage Attendance</span>
        </Nav.Link>

        {/* Assignments Section */}
        <h6 className={styles.navCategory}>
          <FaBookOpen className={styles.categoryIcon} /> Assignments
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/assignments"
          className={`${styles.navLink} ${isActive('/teacher/assignments') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>Manage Assignments</span>
        </Nav.Link>

        {/* Grades / Assessments Section */}
        <h6 className={styles.navCategory}>
          <FaChartBar className={styles.categoryIcon} /> Grades / Assessments
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/grades"
          className={`${styles.navLink} ${isActive('/teacher/grades') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>Manage Marks</span>
        </Nav.Link>

        {/* Messages Section */}
<h6 className={styles.navCategory}>
  <FaUserCircle className={styles.categoryIcon} /> Communication
</h6>
<Nav.Link
  as={Link}
  to="/teacher/messages"
  className={`${styles.navLink} ${isActive('/teacher/messages') ? styles.active : ''}`}
>
  <span className={styles.subNavLink}>Messages</span>
</Nav.Link>


        {/* Profile Section */}
        <h6 className={styles.navCategory}>
          <FaUserCircle className={styles.categoryIcon} /> Profile
        </h6>
        <Nav.Link
          as={Link}
          to="/teacher/profile"
          className={`${styles.navLink} ${isActive('/teacher/profile') ? styles.active : ''}`}
        >
          <span className={styles.subNavLink}>My Profile</span>
        </Nav.Link>

      </Nav>

      <div className="mt-auto pt-3"> {/* Push logout to bottom */}
        <Button variant="outline-light" className={styles.logoutButton} onClick={handleLogout}>
          <FaSignOutAlt className="me-2" /> Logout
        </Button>
      </div>
    </Col>
  );
};

export default TeacherSidebar;