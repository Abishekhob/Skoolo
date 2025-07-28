import React, { useEffect, useState, useCallback } from 'react';
import { Form, Button, Table, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import API from '../services/api';
import { FaUsersCog, FaCheckCircle, FaTimesCircle } from 'react-icons/fa'; // Added icons
import styles from './style/StudentPromotionPage.module.css';

const StudentPromotionPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [students, setStudents] = useState([]);
  const [promotions, setPromotions] = useState({});
  const [loading, setLoading] = useState(false);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedSection, setSelectedSection] = useState('');
  const [nextClasses, setNextClasses] = useState([]);
  const [academicYear, setAcademicYear] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch all classes initially for current and next class dropdowns
  useEffect(() => {
    API.get('/classes')
      .then(res => {
        setClasses(res.data);
        setNextClasses(res.data);
      })
      .catch(err => {
        console.error("Error fetching classes:", err);
        setErrorMsg('Failed to load classes.');
      });
  }, []);

  // Fetch sections based on selected current class
  const fetchSectionsForClass = useCallback((classId) => {
    setSelectedClass(classId);
    setSelectedSection(''); // Reset section when class changes
    setStudents([]); // Clear students
    setPromotions({}); // Clear promotions
    if (classId) {
      API.get(`/classes/${classId}/sections`)
        .then(res => setSections(res.data.sections))
        .catch(err => {
          console.error("Error fetching sections:", err);
          setErrorMsg('Failed to load sections for this class.');
          setSections([]);
        });
    } else {
      setSections([]);
    }
  }, []);

  // Fetch students for selected class and section
  const fetchStudentsForSection = useCallback((sectionId) => {
    setSelectedSection(sectionId);
    setStudents([]); // Clear students before loading new ones
    setPromotions({}); // Clear promotions before loading new ones

    if (selectedClass && sectionId) {
      setLoading(true);
      API.get(`/classes/${selectedClass}/sections/${sectionId}/details`)
        .then(res => {
          const studentList = res.data.students || [];
          setStudents(studentList);

          const initialPromotions = {};
          studentList.forEach(student => {
            initialPromotions[student.id] = {
              resultStatus: 'Promoted',
              nextClassId: '',
              nextSectionId: '',
              remarks: '',
              nextSections: []
            };
          });
          setPromotions(initialPromotions);
        })
        .catch(err => {
          console.error("Error fetching students:", err);
          setErrorMsg('Failed to load students for the selected section.');
          setStudents([]);
          setPromotions({});
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedClass]); // Depend on selectedClass to ensure it's up-to-date

  // Handle individual student promotion field changes
  const handleChange = useCallback((studentId, field, value) => {
    setPromotions(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [field]: value }
    }));
  }, []);

  // Handle change in 'Next Class' for a student, fetching new sections
  const handleNextClassChange = useCallback((studentId, nextClassId) => {
    setLoading(true); // Indicate loading for sections
    API.get(`/classes/${nextClassId}/sections`)
      .then(res => {
        const fetchedSections = res.data.sections || [];
        setPromotions(prev => ({
          ...prev,
          [studentId]: {
            ...prev[studentId],
            nextClassId,
            nextSectionId: '', // Reset nextSectionId when nextClassId changes
            nextSections: fetchedSections
          }
        }));
      })
      .catch(err => {
        console.error("Error fetching next class sections:", err);
        setErrorMsg('Failed to load sections for the selected next class.');
        setPromotions(prev => ({
            ...prev,
            [studentId]: { ...prev[studentId], nextClassId, nextSectionId: '', nextSections: [] }
        }));
      })
      .finally(() => {
          setLoading(false);
      });
  }, []);

  // Submit all promotions
  const handleSubmit = useCallback(async () => {
    setLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    if (!academicYear) {
        setErrorMsg('Please enter the Academic Year.');
        setLoading(false);
        return;
    }
    if (!selectedClass || !selectedSection || students.length === 0) {
        setErrorMsg('Please select a current class and section with students.');
        setLoading(false);
        return;
    }

    const formattedPromotions = students.map(student => ({
      studentId: student.id,
      resultStatus: promotions[student.id]?.resultStatus || 'Promoted',
      nextClassId: promotions[student.id]?.nextClassId || null,
      nextSectionId: promotions[student.id]?.nextSectionId || null,
      remarks: promotions[student.id]?.remarks || ''
    }));

    try {
      await API.post('/admin/promote-students', {
        academicYear,
        classId: selectedClass,
        sectionId: selectedSection,
        promotions: formattedPromotions
      });
      setSuccessMsg('Students promoted successfully!');
      setStudents([]); // Clear student list after successful promotion
      setPromotions({}); // Clear promotions data
      setSelectedClass(''); // Reset form
      setSelectedSection('');
      setAcademicYear('');
    } catch (err) {
      console.error("Error promoting students:", err);
      setErrorMsg(err.response?.data?.message || 'Failed to promote students. Please try again.');
    } finally {
      setLoading(false);
      setTimeout(() => {
        setSuccessMsg('');
        setErrorMsg('');
      }, 5000); // Clear messages after 5 seconds
    }
  }, [academicYear, selectedClass, selectedSection, students, promotions]);

  return (
    <div className={styles.promotionPageContainer}>
      <AdminSidebar />
      <div className={styles.contentArea}>
        <h3 className={styles.pageTitle}>
          <FaUsersCog className={styles.pageIcon} /> Student Promotion
        </h3>

        {successMsg && (
          <Alert variant="success" className={`${styles.customAlert} ${styles.alertSuccess} animate__animated animate__fadeInDown`}>
            <FaCheckCircle className="me-2" /> {successMsg}
          </Alert>
        )}
        {errorMsg && (
          <Alert variant="danger" className={`${styles.customAlert} ${styles.alertDanger} animate__animated animate__fadeInDown`}>
            <FaTimesCircle className="me-2" /> {errorMsg}
          </Alert>
        )}

        <Card className={styles.formCard}>
          <Card.Body>
            <h5 className={styles.cardTitle}>Promotion Filters</h5>
            <Form>
              <Row className="mb-4 g-3">
                <Col md={4} sm={6} xs={12}>
                  <Form.Group controlId="currentClassSelect">
                    <Form.Label className={styles.formLabel}>Current Class</Form.Label>
                    <Form.Select className={styles.formSelect} value={selectedClass} onChange={(e) => fetchSectionsForClass(e.target.value)}>
                      <option value="">Select Class</option>
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.className}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} sm={6} xs={12}>
                  <Form.Group controlId="currentSectionSelect">
                    <Form.Label className={styles.formLabel}>Current Section</Form.Label>
                    <Form.Select className={styles.formSelect} value={selectedSection} onChange={(e) => fetchStudentsForSection(e.target.value)} disabled={!selectedClass || sections.length === 0}>
                      <option value="">{selectedClass ? 'Select Section' : 'Select Class First'}</option>
                      {sections.map(sec => (
                        <option key={sec.id} value={sec.id}>{sec.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4} sm={12} xs={12}>
                  <Form.Group controlId="academicYearInput">
                    <Form.Label className={styles.formLabel}>Academic Year for Promotion</Form.Label>
                    <Form.Control
                      type="text"
                      className={styles.formControl}
                      placeholder="e.g., 2024-2025"
                      value={academicYear}
                      onChange={(e) => setAcademicYear(e.target.value)}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {loading && students.length === 0 ? ( // Only show spinner if no students are loaded yet
          <div className={styles.spinnerContainer}>
            <Spinner animation="border" variant="primary" className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading students...</p>
          </div>
        ) : students.length > 0 ? (
          <Card className={styles.dataCard}>
            <Card.Body>
              <h5 className={styles.cardTitle}>Student Promotion Status</h5>
              {/* Desktop Table View */}
              <div className="d-none d-lg-block">
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
                          <td className={styles.studentNameCell}>{student.firstName} {student.lastName}</td>
                          <td>
                            <Form.Select
                              className={styles.formSelect}
                              value={promo.resultStatus || 'Promoted'}
                              onChange={(e) => handleChange(student.id, 'resultStatus', e.target.value)}
                            >
                              <option value="Promoted">Promoted</option>
                              <option value="Repeated">Repeated</option>
                              <option value="Discontinued">Discontinued</option>
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
                              disabled={isDiscontinued || !promo.nextClassId || (promo.nextSections && promo.nextSections.length === 0)}
                              value={promo.nextSectionId || ''}
                              onChange={(e) => handleChange(student.id, 'nextSectionId', e.target.value)}
                            >
                              <option value="">{promo.nextClassId ? (promo.nextSections && promo.nextSections.length > 0 ? 'Select Section' : 'No sections') : 'Select Class First'}</option>
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
                              placeholder="Add remarks..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="d-lg-none">
                {students.map(student => {
                  const promo = promotions[student.id] || {};
                  const isDiscontinued = promo.resultStatus === 'Discontinued';
                  return (
                    <Card key={student.id} className={`${styles.studentCard} mb-3 ${isDiscontinued ? styles.discontinuedCard : ''}`}>
                      <Card.Body>
                        <Card.Title className={styles.studentCardTitle}>{student.firstName} {student.lastName}</Card.Title>
                        <hr className={styles.cardDivider} />
                        <Form.Group className="mb-3">
                          <Form.Label className={styles.formLabel}>Status</Form.Label>
                          <Form.Select
                            className={styles.formSelect}
                            value={promo.resultStatus || 'Promoted'}
                            onChange={(e) => handleChange(student.id, 'resultStatus', e.target.value)}
                          >
                            <option value="Promoted">Promoted</option>
                            <option value="Repeated">Repeated</option>
                            <option value="Discontinued">Discontinued</option>
                          </Form.Select>
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className={styles.formLabel}>Next Class</Form.Label>
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
                        </Form.Group>

                        <Form.Group className="mb-3">
                          <Form.Label className={styles.formLabel}>Next Section</Form.Label>
                          <Form.Select
                            className={styles.formSelect}
                            disabled={isDiscontinued || !promo.nextClassId || (promo.nextSections && promo.nextSections.length === 0)}
                            value={promo.nextSectionId || ''}
                            onChange={(e) => handleChange(student.id, 'nextSectionId', e.target.value)}
                          >
                            <option value="">{promo.nextClassId ? (promo.nextSections && promo.nextSections.length > 0 ? 'Select Section' : 'No sections') : 'Select Class First'}</option>
                            {(promo.nextSections || []).map(sec => (
                              <option key={sec.id} value={sec.id}>{sec.name}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>

                        <Form.Group>
                          <Form.Label className={styles.formLabel}>Remarks</Form.Label>
                          <Form.Control
                            type="text"
                            className={styles.formControl}
                            value={promo.remarks || ''}
                            onChange={(e) => handleChange(student.id, 'remarks', e.target.value)}
                            placeholder="Add remarks..."
                          />
                        </Form.Group>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>

              <div className="d-flex justify-content-end mt-4">
                <Button onClick={handleSubmit} className={styles.submitButton} disabled={loading || !academicYear || students.length === 0}>
                  {loading ? (
                    <>
                      <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" />
                      <span className="ms-2">Submitting...</span>
                    </>
                  ) : (
                    'Submit Promotions'
                  )}
                </Button>
              </div>
            </Card.Body>
          </Card>
        ) : (selectedClass && selectedSection && !loading && (
          <div className={styles.emptyState}>
            <p>No students found for the selected class and section. Please select valid filters or ensure students are assigned.</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudentPromotionPage;