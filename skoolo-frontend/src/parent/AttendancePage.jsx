import React, { useEffect, useState } from "react";
import API from "../services/api"; // adjust the import path accordingly
import ParentSidebar from "./ParentSidebar";
import { Spinner, Alert, Container } from "react-bootstrap"; // Using Alert and Container from Bootstrap
import "./style/AttendancePage.css"; // Import the custom CSS

const AttendancePage = () => {
  const parentId = localStorage.getItem("parentId");
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!parentId) {
      setError("Parent ID not found.");
      setLoading(false);
      return;
    }

    API.get(`/parents/${parentId}/attendance`)
      .then((res) => {
        setAttendanceList(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to fetch attendance.");
        setLoading(false);
        console.error(err);
      });
  }, [parentId]);

  return (
    <div className="attendance-wrapper">
      <ParentSidebar />
      <div className="attendance-main-content"> {/* Centralized content area */}
        <Container className="mt-5"> {/* Bootstrap Container for consistent padding */}
          <h2 className="attendance-heading">
            <span role="img" aria-label="calendar">🗓️</span> Attendance Records
          </h2>

          {loading && (
            <div className="loading-state">
              <Spinner animation="border" variant="light" /> {/* Use light variant for dark background */}
              <p className="loading-text">Loading attendance records...</p>
            </div>
          )}

          {error && (
            <div className="error-state">
              <Alert variant="danger" className="custom-alert">{error}</Alert>
            </div>
          )}

          {!loading && !error && attendanceList.length === 0 && (
            <div className="empty-state">
              <Alert variant="info" className="custom-alert">No attendance records found for your child.</Alert>
            </div>
          )}

          {!loading && !error && attendanceList.length > 0 && (
            <div className="attendance-table-container"> {/* Custom container for table styling */}
              <table className="attendance-table"> {/* Use custom table class */}
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Student</th>
                    <th>Marked By</th>
                  </tr>
                </thead>
                <tbody>
                  {attendanceList.map((att) => (
                    <tr key={att.id}>
                      <td>{new Date(att.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                      <td>
                        <span className={`attendance-status-badge ${att.status.toLowerCase()}`}>
                          {att.status.charAt(0).toUpperCase() + att.status.slice(1)}
                        </span>
                      </td>
                      <td>{att.studentName || 'N/A'}</td>
                      <td>{att.teacherName || 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Container>
      </div>
    </div>
  );
};

export default AttendancePage;