import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ParentSidebar from './ParentSidebar';
import { Card, Container, Row, Col, Spinner, Alert } from 'react-bootstrap';
import './style/AssignmentsPage.css';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const parentId = localStorage.getItem('parentId');

    if (!parentId) {
      setError('Parent not logged in.');
      setLoading(false);
      return;
    }

    API.get(`/parents/${parentId}/assignments`)
      .then((res) => {
        setAssignments(res.data);
      })
      .catch((err) => {
        console.error('Failed to load assignments:', err);
        setError('Failed to load assignments.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="dashboard-grid">
      <ParentSidebar />
      <div className="assignments-content">
        <Container fluid className="px-5 py-4">
          <h1 className="assignments-heading">
            <span role="img" aria-label="books">
              📚
            </span>{' '}
            Assignments
          </h1>

          {loading && (
            <div className="loading-state">
              <Spinner animation="border" variant="light" />
              <p className="loading-text">Loading assignments...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <Alert variant="danger" className="custom-alert">
                {error}
              </Alert>
            </div>
          )}

          {!loading && !error && (
            <>
              {assignments.length > 0 ? (
                <Row xs={1} sm={2} lg={3} className="assignments-grid g-4">
                  {assignments.map((assignment) => (
                    <Col key={assignment.id}>
                      <Card className="assignment-card">
                        <Card.Body>
                          <div className="card-header-meta">
                            <span className={`assignment-type ${assignment.type.toLowerCase()}`}>
                              {assignment.type.toUpperCase()}
                            </span>
                            <span className="due-date">Due: {assignment.dueDate}</span>
                          </div>
                          <Card.Title className="assignment-title">{assignment.title}</Card.Title>
                          <Card.Text className="assignment-description">
                            {assignment.description}
                          </Card.Text>
                        </Card.Body>
                        <Card.Footer className="assignment-footer">
                          <div className="footer-item">
                            <span className="footer-label">Subject:</span>
                            <span className="footer-value">
                              {assignment.subject?.subjectName || 'N/A'}
                            </span>
                          </div>
                          <div className="footer-item">
                            <span className="footer-label">Teacher:</span>
                            <span className="footer-value">
                              {`${assignment.teacher?.firstName || ''} ${
                                assignment.teacher?.lastName || ''
                              }`.trim() || 'N/A'}
                            </span>
                          </div>
                        </Card.Footer>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : (
                <div className="empty-state">
                  <Alert variant="info" className="custom-alert">
                    No assignments available for your child.
                  </Alert>
                </div>
              )}
            </>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AssignmentsPage;