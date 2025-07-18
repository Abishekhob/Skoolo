import React, { useEffect, useState } from 'react';
import { Form, Button, Table, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import AdminSidebar from './AdminSideBar'; // Assuming AdminSidebar is styled for dark theme
import API from '../services/api';
import styles from './style/StudentPromotionPage.module.css'; // Corrected: .module.css for CSS Modules

const StudentPromotionPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [promotions, setPromotions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  // --- FIX APPLIED HERE ---
  // Reinstated setSelectedSection to be a function returned by useState
  const [selectedSection, setSelectedSection] = useState('');
  // -------------------------
  const [nextClasses, setNextClasses] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    API.get('/classes').then(res => {
      setClasses(res.data);
      setNextClasses(res.data);
    });
  }, []);

  const fetchSections = (classId) => {
    setSelectedClass(classId);
    API.get(`/classes/${classId}/sections`).then(res => setSections(res.data.sections));
  };

  const fetchStudents = (sectionId) => {
    setSelectedSection(sectionId); // This will now correctly be a function
    setLoading(true);
    API.get(`/classes/${selectedClass}/sections/${sectionId}/details`)
      .then(res => {
        const studentList = res.data.students;
        setStudents(studentList);

        const initial = {};
        studentList.forEach(student => {
          initial[student.id] = {
            resultStatus: 'Promoted',
            nextClassId: '',
            nextSectionId: '',
            remarks: '',
            nextSections: []
          };
        });
        setPromotions(initial);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching students:", err);
        setLoading(false);
        // You might want to add an error message state here as well
      });
  };

  const handleChange = (studentId, field, value) => {
    setPromotions(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  };

  const handleNextClassChange = (studentId, nextClassId) => {
    API.get(`/classes/${nextClassId}/sections`).then(res => {
      const fetchedSections = res.data.sections;
      setPromotions(prev => ({
        ...prev,
        [studentId]: {
          ...prev[studentId],
          nextClassId,
          nextSectionId: '',
          nextSections: fetchedSections
        }
      }));
    });
  };

  const handleSubmit = () => {
    const formattedPromotions = students.map(student => ({
      studentId: student.id,
      ...promotions[student.id]
    }));

    API.post('/admin/promote-students', {
      academicYear,
      classId: selectedClass,
      sectionId: selectedSection,
      promotions: formattedPromotions
    }).then(() => {
      setSuccessMsg('Students promoted successfully!');
      // Optionally clear form or refetch students here
      setTimeout(() => setSuccessMsg(''), 5000); // Clear message after 5 seconds
    })
    .catch(err => {
        console.error("Error promoting students:", err);
        setSuccessMsg('Failed to promote students. Please try again.'); // Indicate failure
        setTimeout(() => setSuccessMsg(''), 5000); // Clear message after 5 seconds
    });
  };

  return (
    <div className={styles.promotionPageContainer}>
      <AdminSidebar />
      <div className={styles.contentArea}>
        <h3 className={styles.pageTitle}>Student Promotion</h3>

        {successMsg && <Alert variant={successMsg.includes('successfully') ? "success" : "danger"} className={styles.successAlert}>{successMsg}</Alert>}

        <Card className={styles.formCard}>
          <Card.Body>
            <Form>
              <Row className="mb-4 g-3">
                <Col md={4}>
                  <Form.Group controlId="currentClassSelect">
                    <Form.Label className={styles.formLabel}>Select Current Class</Form.Label>
                    <Form.Select className={styles.formSelect} onChange={(e) => fetchSections(e.target.value)}>
                      <option value="">Select</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="currentSectionSelect">
                    <Form.Label className={styles.formLabel}>Select Current Section</Form.Label>
                    <Form.Select className={styles.formSelect} onChange={(e) => fetchStudents(e.target.value)} disabled={!selectedClass}>
                      <option value="">Select</option>
                      {sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group controlId="academicYearInput">
                    <Form.Label className={styles.formLabel}>Academic Year</Form.Label>
                    <Form.Control
                      type="text"
                      className={styles.formControl}
                      placeholder="e.g. 2024-2025"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>


        {loading ? (
          <div className={styles.spinnerContainer}>
            <Spinner animation="border" variant="light" />
            <p>Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <Card className={styles.dataCard}>
            <Card.Body>
              <Table bordered hover responsive className={styles.promotionTable}>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Status</th>
                    <th>Next Class</th>
                    <th>Next Section</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map(student => {
                    const promo = promotions[student.id] || {};
                    const isDiscontinued = promo.resultStatus === 'Discontinued';
                    return (
                      <tr key={student.id} className={isDiscontinued ? styles.discontinuedRow : ''}>
                        <td>{student.firstName} {student.lastName}</td>

                        <td>
                          <Form.Select
                            className={styles.formSelect}
                            value={promo.resultStatus || ''}
                            onChange={(e) => handleChange(student.id, 'resultStatus', e.target.value)}
                          >
                            <option>Promoted</option>
                            <option>Repeated</option>
                            <option>Discontinued</option>
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Select
                            className={styles.formSelect}
                            disabled={isDiscontinued}
                            value={promo.nextClassId || ''}
                            onChange={(e) => handleNextClassChange(student.id, e.target.value)}
                          >
                            <option value="">Select</option>
                            {nextClasses.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.className}</option>
                            ))}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Select
                            className={styles.formSelect}
                            disabled={isDiscontinued || !promo.nextClassId}
                            value={promo.nextSectionId || ''}
                            onChange={(e) => handleChange(student.id, 'nextSectionId', e.target.value)}
                          >
                            <option value="">Select</option>
                            {(promo.nextSections || []).map(sec => (
                              <option key={sec.id} value={sec.id}>{sec.name}</option>
                            ))}
                          </Form.Select>
                        </td>

                        <td>
                          <Form.Control
                            type="text"
                            className={styles.formControl}
                            value={promo.remarks || ''}
                            onChange={(e) => handleChange(student.id, 'remarks', e.target.value)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
              <div className="d-flex justify-content-end mt-4">
                <Button onClick={handleSubmit} className={styles.submitButton} disabled={loading || !academicYear || students.length === 0}>
                  Submit Promotions
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (selectedClass && selectedSection && !loading && (
          <div className={styles.emptyState}>
            <p>No students found for the selected class and section.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPromotionPage;