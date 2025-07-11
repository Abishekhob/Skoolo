import { Col, Nav, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

const AdminSidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('selectedClass');
    localStorage.removeItem('selectedSection');
    navigate('/');
  };

  return (
    <Col
      md={2}
      className="bg-dark text-white p-3 position-sticky top-0"
      style={{ height: '100vh', zIndex: 1030 }}
    >
      <h4 className="mb-4">Admin Panel</h4>
      <Nav className="flex-column">

        <h6 className="text-secondary mt-3">📚 Classes</h6>
        <Nav.Link as={Link} to="/admin/classes" className="text-white">
          List All Classes
        </Nav.Link>

        <h6 className="text-secondary mt-4">👨‍🏫 Teachers</h6>
        <Nav.Link as={Link} to="/admin/teachers" className="text-white">
          Manage Teachers
        </Nav.Link>

        <h6 className="text-secondary mt-4">👨‍🏫 Teacher Scheduling</h6>
        <Nav.Link as={Link} to="/admin/timetable-scheduler" className="text-white">
          Assign Teachers to Periods
        </Nav.Link>

        {/* NEW ADDITION: Subjects */}
        <h6 className="text-secondary mt-4">📚 Subjects</h6>
        <Nav.Link as={Link} to="/admin/subjects" className="text-white">
          Manage Subjects
        </Nav.Link>
        {/* END NEW ADDITION */}

        <h6 className="text-secondary mt-4">👨‍👩‍👧‍👦 Parents</h6>
        <Nav.Link as={Link} to="/admin/parents" className="text-white">
          View All Parents
        </Nav.Link>

        <h6 className="text-secondary mt-4">💰 Fees</h6>
<Nav.Link as={Link} to="/admin/fees" className="text-white">
  Manage Fees
</Nav.Link>

        <Button variant="outline-light" className="mt-5" onClick={handleLogout}>
          Logout
        </Button>
      </Nav>
    </Col>
  );
};

export default AdminSidebar;