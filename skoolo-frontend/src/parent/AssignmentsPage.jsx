import React, { useEffect, useState } from 'react';
import { Card, Container, Spinner, Alert } from 'react-bootstrap';
import { FaBook, FaChalkboardTeacher, FaCalendarAlt } from 'react-icons/fa';
import ParentSidebar from './ParentSidebar';
import API from '../services/api';
import './style/AssignmentsPage.css';

const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // NOTE: This logic determines the status tag for each assignment card.
  const getStatus = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate);
    const diffInDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));
    
    if (diffInDays <= 0) return 'Overdue';
    if (diffInDays <= 3) return 'Due Soon';
    return 'New';
  };

  useEffect(() => {
    const parentId = localStorage.getItem('parentId');

    if (!parentId) {
      setError('Parent not logged in.');
      setLoading(false);
      return;
    }

    // Faking a fetch with a slight delay for the loading state to be visible
    setTimeout(() => {
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
    }, 1000); // Simulate network latency
  }, []);

  return (
    <div className="dashboard-layout">
      <ParentSidebar />
      <div className="main-content">
        <Container fluid className="content-container">
          <header className="page-header">
            <h1 className="page-title">
              <FaBook className="title-icon" /> Assignments
            </h1>
          </header>

          {loading && (
            <div className="state-container loading-state">
              <Spinner animation="border" variant="info" />
              <p>Loading assignments...</p>
            </div>
          )}

          {error && (
            <div className="state-container error-state">
              <Alert variant="danger">
                {error}
              </Alert>
            </div>
          )}

          {!loading && !error && (
            <section className="assignments-grid">
              {assignments.length > 0 ? (
                assignments.map((assignment) => (
                  <Card key={assignment.id} className="assignment-card">
                    <Card.Body>
                      <div className="card-header-meta">
                        <span className={`status-tag ${getStatus(assignment.dueDate).toLowerCase().replace(' ', '-')}`}>
                          {getStatus(assignment.dueDate)}
                        </span>
                        {/* Optional: Add a checkmark if completed, using another field from your API */}
                        {assignment.isCompleted && <span className="status-tag completed-tag">Completed</span>}
                      </div>
                      <Card.Title className="assignment-title">{assignment.title}</Card.Title>
                      <Card.Text className="assignment-description">{assignment.description}</Card.Text>
                      
                      <div className="card-footer-meta">
                        <div className="footer-item">
                          <FaChalkboardTeacher />
                          <span>{`${assignment.teacher?.firstName || ''} ${assignment.teacher?.lastName || ''}`.trim() || 'N/A'}</span>
                        </div>
                        <div className="footer-item">
                          <FaBook />
                          <span>{assignment.subject?.subjectName || 'N/A'}</span>
                        </div>
                        <div className="footer-item">
                          <FaCalendarAlt />
                          <span>{assignment.dueDate}</span>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))
              ) : (
                <div className="state-container empty-state">
                  <Alert variant="info">
                    No assignments available for your child.
                  </Alert>
                </div>
              )}
            </section>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AssignmentsPage;