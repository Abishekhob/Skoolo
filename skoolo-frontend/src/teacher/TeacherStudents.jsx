import React, { useEffect, useState } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Alert,
  ListGroup,
  Badge,
} from 'react-bootstrap';
import { FaUsers, FaGraduationCap, FaMale, FaFemale, FaChalkboardTeacher, FaExclamationCircle } from 'react-icons/fa'; // Import icons
import TeacherSidebar from './TeacherSidebar';
import API from '../services/api';
import styles from './style/TeacherStudents.module.css'; // Import CSS Modules

const TeacherStudents = () => {
  const [classSections, setClassSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [students, setStudents] = useState([]);
  const [classInfo, setClassInfo] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    if (!teacherId) {
      setError('Teacher ID not found in local storage. Please log in again.');
      return;
    }

    setLoading(true);
    API.get(`/teacher/${teacherId}/assigned-classes`)
      .then((res) => {
        setClassSections(res.data);
        if (res.data.length > 0) {
          const first = res.data[0];
          handleClassClick(first.classId, first.sectionId); // Load first class by default
        } else {
          setError('No classes assigned to you.');
        }
      })
      .catch((err) => {
        console.error("Failed to load assigned classes:", err);
        setError('Failed to load assigned classes. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [teacherId]);

  const handleClassClick = (classId, sectionId) => {
    setLoading(true);
    setError(''); // Clear previous errors
    setSelectedClass({ classId, sectionId });
    setStudents([]); // Clear students from previous selection
    setClassInfo({}); // Clear class info from previous selection

    API.get(`/classes/${classId}/sections/${sectionId}/details`)
      .then((res) => {
        setStudents(res.data.students || []);
        setClassInfo({
          className: res.data.className,
          sectionName: res.data.sectionName,
          totalStudents: res.data.totalStudents,
          maleCount: res.data.maleCount,
          femaleCount: res.data.femaleCount,
          classTeacher: res.data.classTeacher,
        });
      })
      .catch((err) => {
        console.error("Failed to fetch student details:", err);
        setError('Failed to fetch student details for this class. Please try again.');
        setStudents([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  return (
    <Container fluid className={styles.mainContainer}>
      <Row className="flex-nowrap">
        {/* Teacher Sidebar - Assuming it handles its own styling */}
        <TeacherSidebar />

        {/* Class List Sidebar */}
        <Col xs={12} md={3} lg={2} className={`${styles.classListSidebar} py-4 d-flex flex-column`}>
          <h5 className={styles.sidebarHeading}>My Classes</h5>
          <ListGroup variant="flush" className="flex-grow-1">
            {classSections.length > 0 ? (
              classSections.map((cls, index) => {
                const isActive =
                  selectedClass?.classId === cls.classId &&
                  selectedClass?.sectionId === cls.sectionId;

                return (
                  <ListGroup.Item
                    key={`${cls.classId}-${cls.sectionId}`}
                    action
                    active={isActive}
                    onClick={() => handleClassClick(cls.classId, cls.sectionId)}
                    className={`${styles.classListItem} ${isActive ? styles.activeClass : ''}`}
                    aria-current={isActive ? "true" : undefined}
                  >
                    <span className={styles.classNameText}>{cls.className} - {cls.sectionName}</span>
                    {cls.isClassTeacher && (
                      <Badge className={styles.classTeacherBadge}>
                        👑 Class Teacher
                      </Badge>
                    )}
                  </ListGroup.Item>
                );
              })
            ) : (
              <p className="text-muted text-center pt-3">No classes found.</p>
            )}
          </ListGroup>
        </Col>

        {/* Student Details Content */}
        <Col xs={12} md={9} lg={10} className={`${styles.contentArea} py-4 px-4`}>
          <h3 className={styles.contentHeading}>
            <FaGraduationCap /> Student List
          </h3>

          {/* Loading and Error States */}
          {loading && (
            <div className={styles.loadingContainer}>
              <Spinner animation="border" variant="primary" className={styles.loadingSpinner} />
              <p className={styles.loadingText}>Loading student details...</p>
            </div>
          )}

          {error && (
            <Alert variant="danger" className={styles.errorAlert}>
              <FaExclamationCircle className="me-2" /> {error}
            </Alert>
          )}

          {/* Class Info and Student Table */}
          {!loading && !error && selectedClass && (
            <>
              {/* Class Summary Card */}
              <Card className={styles.summaryCard}>
                <Card.Body className="d-flex flex-wrap align-items-center justify-content-around gap-3">
                  <div className={styles.summaryItem}>
                    <FaGraduationCap className={styles.summaryIcon} />
                    <div className={styles.summaryText}>
                      <p className="mb-0">Class:</p>
                      <h5>{classInfo.className} - {classInfo.sectionName}</h5>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <FaUsers className={styles.summaryIcon} />
                    <div className={styles.summaryText}>
                      <p className="mb-0">Total Students:</p>
                      <h5>{classInfo.totalStudents || 0}</h5>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <FaMale className={styles.summaryIcon} />
                    <div className={styles.summaryText}>
                      <p className="mb-0">Male:</p>
                      <h5>{classInfo.maleCount || 0}</h5>
                    </div>
                  </div>
                  <div className={styles.summaryItem}>
                    <FaFemale className={styles.summaryIcon} />
                    <div className={styles.summaryText}>
                      <p className="mb-0">Female:</p>
                      <h5>{classInfo.femaleCount || 0}</h5>
                    </div>
                  </div>
                  {classInfo.classTeacher && (
                    <div className={styles.summaryItem}>
                      <FaChalkboardTeacher className={styles.summaryIcon} />
                      <div className={styles.summaryText}>
                        <p className="mb-0">Class Teacher:</p>
                        <h5>{classInfo.classTeacher}</h5>
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>

              <p className={styles.studentsCount}>
                👀 Loaded {students.length} students
              </p>

              {students.length > 0 ? (
                <div className={styles.tableWrapper}>
                  <Table
                    striped
                    hover
                    responsive="sm" // Enable responsive behavior for small screens and up
                    variant="dark"
                    className={styles.studentTable}
                  >
                    <thead className={styles.tableHead}>
                      <tr>
                        <th>#</th>
                        <th>Student Name</th>
                        <th>Gender</th>
                        <th>DOB</th>
                        <th>Contact</th>
                        <th>Address</th>
                        <th>Parent</th>
                        <th>Enrollment Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map((s, idx) => (
                        <tr key={s.id} className={styles.tableRow}>
                          <td>{idx + 1}</td>
                          <td className={styles.studentNameCol}>
                            {s.firstName} {s.lastName}
                          </td>
                          <td>{s.gender || 'N/A'}</td>
                          <td>{s.dob || 'N/A'}</td>
                          <td>{s.contactNumber || 'N/A'}</td>
                          <td className={styles.addressCol}>{s.address || 'N/A'}</td>
                          <td>{s.parentName || 'N/A'}</td>
                          <td>{s.enrollmentDate || 'N/A'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <Alert variant="info" className={styles.noStudentsAlert}>
                  No students found in this section for the selected class.
                </Alert>
              )}
            </>
          )}

          {!loading && !error && !selectedClass && classSections.length > 0 && (
            <Alert variant="info" className={styles.initialPrompt}>
              Please select a class from the left sidebar to view student details.
            </Alert>
          )}
           {!loading && !error && !selectedClass && classSections.length === 0 && (
            <Alert variant="info" className={styles.initialPrompt}>
              No classes assigned to you.
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default TeacherStudents;