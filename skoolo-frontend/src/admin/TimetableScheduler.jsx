import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Card } from 'react-bootstrap';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa'; // Import icons
import API from '../services/api';
import TimetableTable from './TimetableTable'; // Assuming this component is also styled well
import AdminSidebar from './AdminSidebar'; // Assuming this component is styled well
import ScheduleTeacherModal from './ScheduleTeacherModal'; // Assuming this component is styled well
import './style/TimetableScheduler.css'; // Dedicated CSS for this component

const TimetableScheduler = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(() => localStorage.getItem('selectedClass') || '');
  const [selectedSection, setSelectedSection] = useState(() => localStorage.getItem('selectedSection') || '');

  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    day: '',
    period: '',
    teacherId: '',
    subjectName: '',
  });

  const handleCellClick = (day, period, subject, teacherId) => {
    setModalData({
      day,
      period,
      subjectId: subject?.id || '',
      subjectName: subject?.subjectName || '',
      teacherId,
    });
    setShowModal(true);
  };

  useEffect(() => {
    API.get('/admin/classes')
      .then(res => setClasses(res.data || []))
      .catch(error => console.error("Error fetching classes:", error));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      API.get(`/admin/classes/${selectedClass}/sections`)
        .then(res => setSections(res.data || []))
        .catch(error => console.error("Error fetching sections:", error));
    } else {
      setSections([]);
    }
  }, [selectedClass]);

  useEffect(() => {
    if (selectedClass && selectedSection) {
      setLoading(true);
      API.get(`/classes/${selectedClass}/sections/${selectedSection}/timetable`)
        .then(res => setTimetable(res.data || []))
        .catch(error => {
          console.error("Error fetching timetable:", error);
          setTimetable([]); // Clear timetable on error
        })
        .finally(() => setLoading(false));
    } else {
      setTimetable([]);
    }
  }, [selectedClass, selectedSection]);

  const refreshTimetableData = () => {
    if (selectedClass && selectedSection) {
      setLoading(true);
      API.get(`/classes/${selectedClass}/sections/${selectedSection}/timetable`)
        .then((res) => setTimetable(res.data || []))
        .catch(error => console.error("Error refreshing timetable:", error))
        .finally(() => setLoading(false));
    }
  };

  return (
    <Row className="g-0 admin-layout"> {/* Use g-0 for no gutters and a custom class */}
      <AdminSidebar /> {/* Sidebar remains on the left */}

      <Col md={10} className="main-content-area">
        <Container fluid className="p-4">
          <h3 className="section-title mb-4">
            <FaCalendarAlt className="me-2 icon-lg" />
            Timetable Scheduler
          </h3>

          <Card className="selection-card mb-4">
            <Card.Body>
              <Row className="align-items-center">
                <Col md={6} lg={4} className="mb-3 mb-md-0">
                  <Form.Group controlId="classSelect">
                    <Form.Label className="form-label-custom">Select Class:</Form.Label>
                    <Form.Select
                      className="form-select-custom"
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                        localStorage.setItem('selectedClass', e.target.value);
                        setSelectedSection(''); // Reset section when class changes
                        localStorage.removeItem('selectedSection');
                      }}
                    >
                      <option value="">-- Select Class --</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>
                          {cls.className}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>

                <Col md={6} lg={4}>
                  <Form.Group controlId="sectionSelect">
                    <Form.Label className="form-label-custom">Select Section:</Form.Label>
                    <Form.Select
                      className="form-select-custom"
                      value={selectedSection}
                      onChange={(e) => {
                        setSelectedSection(e.target.value);
                        localStorage.setItem('selectedSection', e.target.value);
                      }}
                      disabled={!selectedClass} // Disable section if no class is selected
                    >
                      <option value="">-- Select Section --</option>
                      {sections.map(sec => (
                        <option key={sec.id} value={sec.id}>
                          {sec.sectionName}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {loading ? (
            <div className="text-center my-5 loading-spinner-container">
              <Spinner animation="border" variant="light" className="loading-spinner" />
              <p className="loading-text mt-3">Loading timetable...</p>
            </div>
          ) : selectedClass && selectedSection ? (
            <div className="timetable-container">
              <TimetableTable
                timetable={timetable}
                classId={selectedClass}
                sectionId={selectedSection}
                refreshTimetable={refreshTimetableData}
                onCellClick={handleCellClick}
                showEditButton={false}
              />
            </div>
          ) : (
            <div className="empty-state-message text-center mt-5 p-4">
              <FaInfoCircle className="info-icon mb-3" />
              <p>
                Please select both **Class** and **Section** from the dropdowns above
                to view and manage the timetable.
              </p>
            </div>
          )}

          <ScheduleTeacherModal
            show={showModal}
            handleClose={() => setShowModal(false)}
            classId={selectedClass}
            sectionId={selectedSection}
            day={modalData.day}
            period={modalData.period}
            existingTeacherId={modalData.teacherId}
            subjectName={modalData.subjectName}
            subjectId={modalData.subjectId}
            onSuccess={() => {
              setShowModal(false);
              refreshTimetableData(); // Refresh timetable after successful schedule
            }}
          />
        </Container>
      </Col>
    </Row>
  );
};

export default TimetableScheduler;