import { Container, Row, Col } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';

const AdminDashboard = () => {
  return (
    <Container fluid>
      <Row>
        <AdminSidebar />

        {/* Main content */}
        <Col md={10} className="p-4 bg-light min-vh-100">
          <h2>Welcome, Admin!</h2>
          <p>Choose an option from the left panel to get started.</p>

          {/* You can switch the content based on state or route here */}
          <div className="mt-4">
            <p>This is your dashboard overview.</p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard;
