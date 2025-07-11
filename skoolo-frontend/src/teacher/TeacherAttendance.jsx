import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Table,
  Alert,
  Spinner,
} from 'react-bootstrap';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaCalendarAlt, FaChalkboardTeacher, FaExclamationTriangle, FaInfoCircle, FaHourglassHalf, FaSave, FaCheckCircle, FaTimesCircle, FaClock, FaSignOutAlt } from 'react-icons/fa'; // Added new icons
import API from '../services/api'; // Assuming this path is correct
import TeacherSidebar from './TeacherSidebar'; // Assuming this path is correct
import styles from './style/TeacherAttendance.module.css'; // Using CSS Modules

const TeacherAttendance = () => {
  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [markedByTeacherName, setMarkedByTeacherName] = useState('');
  const [canMark, setCanMark] = useState(false);
  const [loading, setLoading] = useState(false);
  const [date, setDate] = useState(new Date());

  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    API.get(`/teacher/${teacherId}/assigned-classes`)
      .then((res) => {
        setClassSections(res.data);
      })
      .catch((err) => {
        console.error('Failed to fetch assigned classes:', err);
      });
  }, [teacherId]);

  const handleClassChange = (cls) => {
    setSelectedClass(cls);
    setAttendance([]);
    setStudents([]);
    setAttendanceMarked(false);
    setCanMark(false);
    setMarkedByTeacherName('');
  };

 const handleLoadStudents = async () => {
  if (!selectedClass) {
    alert('Please select a class and section first!');
    return;
  }
  setLoading(true);

  try {
    const dateStr = date.toISOString().split('T')[0];

    // 🔐 Check if the teacher can mark attendance
    let canMarkFlag = false;
    try {
      const resCanMark = await API.get(
        `/attendance/can-mark?teacherId=${teacherId}&classId=${selectedClass.classId}&sectionId=${selectedClass.sectionId}`
      );
      canMarkFlag = resCanMark.data;
    } catch (err) {
      if (err.response && err.response.status === 403) {
        console.warn("You’re not authorized to mark attendance for this class.");
      } else {
        console.error("Error checking mark permission:", err);
        alert("Failed to check attendance permission. Please try again.");
      }
    }
    setCanMark(canMarkFlag);

    // 📅 Load existing attendance if available
    const resAttendance = await API.get(
      `/attendance/class/${selectedClass.classId}/section/${selectedClass.sectionId}?date=${dateStr}`
    );
    const existingAttendance = resAttendance.data;

    if (existingAttendance.length > 0) {
      setAttendanceMarked(true);
      setMarkedByTeacherName(
        existingAttendance[0].markedBy?.firstName + ' ' + existingAttendance[0].markedBy?.lastName || 'Unknown'
      );
      setAttendance(
        existingAttendance.map((a) => ({
          studentId: a.student.id,
          status: a.status,
        }))
      );
      setStudents(existingAttendance.map((a) => a.student));
    } else {
      const resStudents = await API.get(
        `/classes/${selectedClass.classId}/sections/${selectedClass.sectionId}/details`
      );
      setStudents(resStudents.data.students);
      setAttendance(
        resStudents.data.students.map((s) => ({
          studentId: s.id,
          status: 'present',
        }))
      );
      setAttendanceMarked(false);
    }
  } catch (err) {
    console.error('Failed to load data:', err);
    alert('Failed to load attendance data. Please try again.');
  } finally {
    setLoading(false);
  }
};

  const handleStatusChange = (studentId, status) => {
    setAttendance((prev) =>
      prev.map((a) => (a.studentId === studentId ? { ...a, status } : a))
    );
  };

  // Helper function to get icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case 'present': return <FaCheckCircle className={styles.iconPresent} />;
      case 'absent': return <FaTimesCircle className={styles.iconAbsent} />;
      case 'late': return <FaClock className={styles.iconLate} />;
      case 'leave': return <FaSignOutAlt className={styles.iconLeave} />;
      default: return null;
    }
  };

  const handleSubmit = async () => {
    if (!selectedClass) {
      alert('Please select a class before submitting attendance.');
      return;
    }
    if (attendance.length === 0) {
      alert('No students to submit attendance for. Please load the sheet.');
      return;
    }

    setLoading(true);
    try {
      const dateStr = date.toISOString().split('T')[0];
      const payload = attendance.map((a) => ({
        ...a,
        date: dateStr,
        classId: selectedClass.classId,
        sectionId: selectedClass.sectionId,
      }));
      await API.post(`/attendance/bulk?teacherId=${teacherId}`, payload);
      alert('✅ Attendance submitted successfully!');
      setAttendanceMarked(true);
      // Re-fetch attendance to get the "marked by" name updated
      handleLoadStudents(); 
    } catch (err) {
      console.error('❌ Failed to submit attendance:', err);
      alert('Failed to submit attendance. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className={styles.attendanceContainer}>
      <Row className="flex-nowrap h-100">
        <TeacherSidebar />

        <Col className={`${styles.contentCol} py-5 px-4`}>
          <h3 className={styles.heading}>
            <FaChalkboardTeacher /> Manage Attendance
          </h3>

          {/* Attendance Controls Card */}
          <Card className={styles.controlsCard}>
            <Card.Body className="d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
              {/* Date Picker */}
              <Form.Group controlId="attendanceDate" className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <FaCalendarAlt /> Select Date
                </Form.Label>
                <DatePicker
                  selected={date}
                  onChange={(d) => setDate(d)}
                  className={styles.formControl}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  popperPlacement="bottom-start"
                  calendarClassName={styles.darkThemeDatepicker}
                  wrapperClassName="react-datepicker-wrapper"
                />
              </Form.Group>

              {/* Class Selector */}
              <Form.Group controlId="classSelector" className={styles.formGroup}>
                <Form.Label className={styles.formLabel}>
                  <FaChalkboardTeacher /> Choose Class
                </Form.Label>
                <Form.Select
                  className={`${styles.formControl} ${styles.customSelect}`}
                  onChange={(e) => {
                    const index = e.target.value;
                    if (index !== '') handleClassChange(classSections[index]);
                    else setSelectedClass(null);
                  }}
                  value={selectedClass ? classSections.indexOf(selectedClass) : ''}
                >
                  <option value="">-- Select Class --</option>
                  {classSections.map((cls, idx) => (
                    <option key={idx} value={idx}>
                      {cls.className} - {cls.sectionName}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              {/* Load Attendance Button */}
              <Button
                variant="info"
                onClick={handleLoadStudents}
                className={`${styles.loadButton}`}
                disabled={!selectedClass || loading}
              >
                {loading ? <Spinner animation="border" size="sm" /> : <FaHourglassHalf />} Load Sheet
              </Button>
            </Card.Body>
          </Card>

          {/* Loading Overlay */}
          {loading && (
            <div className={styles.loadingOverlay}>
              <Spinner animation="border" variant="light" size="lg" />
              <p className={styles.loadingText}>Fetching attendance data...</p>
            </div>
          )}

          {/* Attendance Display */}
          {students.length > 0 && (
            <>
              {/* Alert for already marked attendance */}
              {attendanceMarked && (
                <Alert variant="info" className={`${styles.customAlert} ${styles.infoAlert}`}>
                  <FaInfoCircle size={20} />
                  Attendance already marked for this date by <strong>{markedByTeacherName}</strong>.
                </Alert>
              )}

              {/* Alert for not being able to mark attendance */}
              {!canMark && !attendanceMarked && (
                <Alert variant="warning" className={`${styles.customAlert} ${styles.warningAlert}`}>
                  <FaExclamationTriangle size={20} />
                  You are not assigned to the 1st period for this class today. Attendance marking is disabled.
                </Alert>
              )}

              {/* Responsive Table for larger screens */}
              <div className="d-none d-md-block">
                <Table striped hover variant="dark" responsive className={styles.attendanceTable}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th>#</th>
                      <th>Student</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((s, idx) => (
                      <tr key={s.id} className={styles.tableRow}>
                        <td>{idx + 1}</td>
                        <td className={styles.studentName}>
                          {s.firstName} {s.lastName}
                        </td>
                        <td>
                          {['present', 'absent', 'late', 'leave'].map((status) => (
                            <Form.Check
                              inline
                              key={`${s.id}-${status}`}
                              type="radio"
                              label={status.charAt(0).toUpperCase() + status.slice(1)}
                              id={`${s.id}-${status}`}
                              name={`status-${s.id}`}
                              checked={attendance.find((a) => a.studentId === s.id)?.status === status}
                              disabled={attendanceMarked || !canMark}
                              onChange={() => handleStatusChange(s.id, status)}
                              className={styles.formCheckInline}
                            />
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Card View for smaller screens */}
              <div className="d-md-none">
                <Row className="g-3 mt-3">
                  {students.map((s) => (
                    <Col key={s.id} xs={12}>
                      <Card className={styles.studentCard}>
                        <Card.Body>
                          <Card.Title className={styles.cardTitle}>
                            {s.firstName} {s.lastName}
                          </Card.Title>
                          <div className={styles.statusBadges}>
                            {['present', 'absent', 'late', 'leave'].map((status) => (
                              <Button
                                key={`${s.id}-${status}-card-btn`}
                                variant="outline-light"
                                className={`${styles.statusBadge} ${attendance.find((a) => a.studentId === s.id)?.status === status ? styles[status] : ''}`}
                                onClick={() => handleStatusChange(s.id, status)}
                                disabled={attendanceMarked || !canMark}
                              >
                                {getStatusIcon(status)}
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                              </Button>
                            ))}
                          </div>
                        </Card.Body>
                      </Card>
                    </Col>
                  ))}
                </Row>
              </div>

              {/* Submit Button */}
              {!attendanceMarked && canMark && (
                <div className="d-flex justify-content-center mt-5">
                  <Button
                    variant="success"
                    onClick={handleSubmit}
                    className={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : <FaSave />} Submit Attendance
                  </Button>
                </div>
              )}
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherAttendance;