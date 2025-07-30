import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner, Card } from 'react-bootstrap';
import { FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import API from '../services/api';
import TimetableTable from './TimetableTable';
import AdminSidebar from './AdminSidebar';
import ScheduleTeacherModal from './ScheduleTeacherModal';


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
    <Container fluid>
  <Row className="vh-100">
    <Col md={2} className="bg-dark text-white p-3 position-fixed h-100">
      <AdminSidebar />
    </Col>

    <Col md={{ span: 10, offset: 2 }} className="overflow-auto p-4" style={{ maxHeight: '100vh' }}>
      <h3 className="mb-4 d-flex align-items-center">
        <FaCalendarAlt className="me-2" />
        Timetable Scheduler
      </h3>

      <Card className="mb-4 bg-secondary text-white">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={6} lg={4} className="mb-3 mb-md-0">
              <Form.Group controlId="classSelect">
                <Form.Label>Select Class:</Form.Label>
                <Form.Select
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
                <Form.Label>Select Section:</Form.Label>
                <Form.Select
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
        <div className="text-center my-5">
          <Spinner animation="border" variant="light" />
          <p className="mt-3">Loading timetable...</p>
        </div>
      ) : selectedClass && selectedSection ? (
        <Card className="p-3 bg-dark text-white">
          <TimetableTable
            timetable={timetable}
            classId={selectedClass}
            sectionId={selectedSection}
            refreshTimetable={refreshTimetableData}
            onCellClick={handleCellClick}
            showEditButton={false}
          />
        </Card>
      ) : (
        <div className="text-center mt-5 p-4 bg-dark text-light border border-secondary rounded">
          <FaInfoCircle className="mb-3 fs-3 text-info" />
          <p>
            Please select both <strong>Class</strong> and <strong>Section</strong> to view the timetable.
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
    </Col>
  </Row>
</Container>

  );
};

export default TimetableScheduler;
