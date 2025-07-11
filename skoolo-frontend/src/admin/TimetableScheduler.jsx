import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Spinner } from 'react-bootstrap';
import API from '../services/api';
import TimetableTable from './TimetableTable';
import AdminSidebar from './AdminSideBar';
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
});

const handleCellClick = (day, period, subject, teacherId) => {
  setModalData({
    day,
    period,
    subjectId: subject?.id || '', // ✅ correct
    subjectName: subject?.subjectName || '',
    teacherId,
  });
  setShowModal(true);
};


  useEffect(() => {
    API.get('/admin/classes').then(res => setClasses(res.data || []));
  }, []);

  useEffect(() => {
    if (selectedClass) {
      API.get(`/admin/classes/${selectedClass}/sections`).then(res => setSections(res.data || []));
    } else {
      setSections([]);
    }
  }, [selectedClass]);

useEffect(() => {
  if (selectedClass && selectedSection) {
    setLoading(true);
    API.get(`/classes/${selectedClass}/sections/${selectedSection}/timetable`)
      .then(res => setTimetable(res.data || []))
      .finally(() => setLoading(false));
  } else {
    setTimetable([]);
  }
}, [selectedClass, selectedSection]);


  return (
    <Row className="m-0 bg-dark text-white" style={{ minHeight: '100vh' }}>
      <AdminSidebar /> {/* ✅ Sidebar rendered on the left */}

      <Col md={10} className="py-4 px-4">
        <h3 className="mb-4">📅 Timetable Scheduler</h3>

        <Row className="mb-3">
          <Col md={4}>
            <Form.Label>Class</Form.Label>
           <Form.Select
  className="bg-dark text-white border-secondary"
  value={selectedClass}
  onChange={(e) => {
    setSelectedClass(e.target.value);
    localStorage.setItem('selectedClass', e.target.value);
  }}
>

              <option value="">-- Select Class --</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col md={4}>
            <Form.Label>Section</Form.Label>
            <Form.Select
  className="bg-dark text-white border-secondary"
  value={selectedSection}
  onChange={(e) => {
    setSelectedSection(e.target.value);
    localStorage.setItem('selectedSection', e.target.value);
  }}
>

              <option value="">-- Select Section --</option>
              {sections.map(sec => (
               <option key={sec.id} value={sec.id} style={{ backgroundColor: '#212529', color: 'white' }}>
  {sec.sectionName}
</option>

              ))}
            </Form.Select>
          </Col>
        </Row>

       {loading ? (
  <div className="text-center my-5">
    <Spinner animation="border" variant="light" />
  </div>
) : selectedClass && selectedSection ? (
  <TimetableTable
    timetable={timetable}
    classId={selectedClass}
    sectionId={selectedSection}
    refreshTimetable={() =>
      API.get(`/classes/${selectedClass}/sections/${selectedSection}/timetable`)
        .then((res) => setTimetable(res.data || []))
    }
    onCellClick={handleCellClick}
    showEditButton={false}
  />
) : (
  <div className="text-center text-white mt-5">
    <p>📌 Please select both <strong>Class</strong> and <strong>Section</strong> to view the timetable.</p>
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
  subjectName={modalData.subjectName}       // Optional (for UI)
  subjectId={modalData.subjectId}           // ✅ Required (used in backend call)
  onSuccess={() => {
    setShowModal(false);
    API.get(`/classes/${selectedClass}/sections/${selectedSection}/timetable`)
      .then((res) => setTimetable(res.data || []));
  }}
/>

      </Col>
    </Row>
  );
};

export default TimetableScheduler;
