import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ParentSidebar from './ParentSidebar';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import './style/AssignmentsPage.css'; // Import the custom CSS

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const parentId = localStorage.getItem("parentId");

    if (!parentId) {
      setError("Parent not logged in.");
      setLoading(false);
      return;
    }

    API.get(`/parents/${parentId}/assignments`)
      .then((res) => {
        setAssignments(res.data);
      })
      .catch((err) => {
        console.error("Failed to load assignments:", err);
        setError("Failed to load assignments.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="assignments-wrapper"> {/* Changed from parent-layout for clarity */}
      <ParentSidebar />
      <div className="assignments-content"> {/* Changed from parent-content for clarity */}
        <Container className="mt-5"> {/* Increased top margin for more breathing room */}
          <h3 className="assignments-heading">
            <span role="img" aria-label="books">📘</span> Assignments
          </h3>

          {loading && (
            <div className="loading-state">
              <Spinner animation="border" variant="light" /> {/* Use light variant for dark background */}
              <p className="loading-text">Loading assignments...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <Alert variant="danger" className="custom-alert">{error}</Alert> {/* Custom class for styling */}
            </div>
          )}

          {assignments.length === 0 && !loading && !error && (
            <div className="empty-state">
              <Alert variant="info" className="custom-alert">No assignments available for your child.</Alert> {/* Custom class for styling */}
            </div>
          )}

          <Row className="assignments-grid"> {/* Add a class for specific grid styling */}
            {assignments.map((assignment) => (
              <Col xs={12} md={6} lg={4} className="mb-4" key={assignment.id}> {/* xs=12 for full width on extra small screens */}
                <Card className="assignment-card"> {/* Custom class for styling */}
                  <Card.Body>
                    <Card.Title className="assignment-title">{assignment.title}</Card.Title>
                    <Card.Subtitle className="assignment-subtitle">
                      <span className={`assignment-type ${assignment.type.toLowerCase()}`}>{assignment.type.toUpperCase()}</span> {/* Dynamic class for type badges */}
                      <span className="separator">|</span>
                      <span className="due-date">Due: {assignment.dueDate}</span>
                    </Card.Subtitle>
                    <Card.Text className="assignment-description">{assignment.description}</Card.Text>
                  </Card.Body>
                  <Card.Footer className="assignment-footer"> {/* Custom class for styling */}
                    <div className="footer-item">
                      <span className="footer-label">Subject:</span>
                      <span className="footer-value">{assignment.subject?.subjectName || 'N/A'}</span>
                    </div>
                    <div className="footer-item">
                      <span className="footer-label">Teacher:</span>
                      <span className="footer-value">{`${assignment.teacher?.firstName || ''} ${assignment.teacher?.lastName || ''}`.trim() || 'N/A'}</span>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default AssignmentsPage;