import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Card } from 'react-bootstrap';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import API from '../services/api';
import TimetableTable from './TimetableTable';
import AdminSidebar from './AdminSidebar';
import ScheduleTeacherModal from './ScheduleTeacherModal';
import './style/TimetableScheduler.css';

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
    subjectId: '',
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
    document.body.classList.add('dark-theme');
    return () => {
      document.body.classList.remove('dark-theme');
    };
  }, []);

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
          setTimetable([]);
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
    <div className="admin-layout-wrapper">
     <div className="admin-sidebar">
  <AdminSidebar />
</div>


      <div className="main-content-area scrollable-content">
        <Container fluid className="p-4 timetable-scheduler-container">
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
                        setSelectedSection('');
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
                      disabled={!selectedClass}
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
              <Spinner animation="border" variant="primary" className="loading-spinner" />
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
                Please select both <strong>Class</strong> and <strong>Section</strong> from the dropdowns above
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
              refreshTimetableData();
            }}
          />
        </Container>
      </div>
    </div>
  );
};

export default TimetableScheduler;
