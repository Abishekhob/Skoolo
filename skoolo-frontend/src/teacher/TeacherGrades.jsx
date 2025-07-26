import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Table, Alert, Spinner } from 'react-bootstrap';
import Select from 'react-select'; // For enhanced dropdown
import {
    AwardFill,
    Clipboard2CheckFill,
    PersonFill,
    ChevronDown,
    InfoCircleFill,
    ExclamationTriangleFill,
    XCircleFill,
    SendFill // Added for submit button
} from 'react-bootstrap-icons';
import Collapsible from 'react-collapsible';
import { motion } from 'framer-motion';

import TeacherSidebar from './TeacherSidebar';
import API from '../services/api'; // Assuming this is your API service

// Import the CSS file
import './style/TeacherGrades.css';

const TeacherGrades = () => {
    const teacherId = localStorage.getItem('teacherId');

    const [assignments, setAssignments] = useState([]);
    const [selectedAssignment, setSelectedAssignment] = useState(null);
    const [examName, setExamName] = useState('');
    const [academicYear, setAcademicYear] = useState('2025-2026'); // Default value

    const [students, setStudents] = useState([]);
    const [marksList, setMarksList] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [messageType, setMessageType] = useState('info');
    const [submittedMarks, setSubmittedMarks] = useState({});
    const [expandedExam, setExpandedExam] = useState(null);

    // Animation variants for Framer Motion
    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } }
    };

    const tableVariants = {
        hidden: { opacity: 0, scale: 0.98 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: 'easeOut' } }
    };

    useEffect(() => {
        // Fetch available assignments for the teacher
        API.get(`/teacher/${teacherId}/marking-assignments`)
            .then((res) => {
                const options = res.data.map((item) => ({
                    value: item,
                    label: `${item.className}-${item.sectionName} → ${item.subjectName}`
                }));
                setAssignments(options);
            })
            .catch((err) => console.error("Error fetching assignments:", err));

        // Fetch submitted marks
        fetchSubmittedMarks();
    }, [teacherId]);

    const fetchSubmittedMarks = () => {
        API.get(`/marks/by-teacher?teacherId=${teacherId}`)
            .then((res) => {
                const grouped = {};
                res.data.forEach((mark) => {
                    const key = `${mark.classEntity?.className}-${mark.section?.sectionName} | ${mark.examName} - ${mark.academicYear}`;
                    if (!grouped[key]) grouped[key] = [];
                    grouped[key].push(mark);
                });
                setSubmittedMarks(grouped);
            })
            .catch((err) => console.error("Error fetching submitted marks:", err));
    };

    const handleAssignmentSelect = (option) => {
        setSelectedAssignment(option);
        // Reset students and marks when a new assignment is selected
        setStudents([]);
        setMarksList([]);
        setExamName(''); // Clear exam name field
        setMessage(''); // Clear any previous messages
    };

    const fetchStudentsForAssignment = () => {
        if (!selectedAssignment) {
            setMessage('Please select an assignment first.');
            setMessageType('warning');
            return;
        }

        const { classId, sectionId } = selectedAssignment.value;
        setLoading(true);
        setMessage(''); // Clear previous messages

        API.get(`/students/by-class?classId=${classId}&sectionId=${sectionId}`)
            .then((res) => {
                if (res.data.length === 0) {
                    setMessage('No students found for this class and section.');
                    setMessageType('info');
                    setStudents([]);
                    setMarksList([]);
                } else {
                    setStudents(res.data);
                    const initialMarks = res.data.map((stu) => ({
                        studentId: stu.id,
                        marksObtained: '',
                        maxMarks: 100, // Default max marks
                    }));
                    setMarksList(initialMarks);
                    setMessage('Students loaded successfully. Enter marks below.');
                    setMessageType('success');
                }
                setLoading(false);
            })
            .catch((err) => {
                console.error("Error fetching students:", err);
                setMessage('Failed to load students. Please try again.');
                setMessageType('danger');
                setLoading(false);
            });
    };

    const handleMarksChange = (index, field, value) => {
        const updated = [...marksList];
        // Ensure value is a number if field is marksObtained or maxMarks
        const processedValue = (field === 'marksObtained' || field === 'maxMarks') ? (value === '' ? '' : Number(value)) : value;
        updated[index][field] = processedValue;
        setMarksList(updated);
    };

    const handleSubmitMarks = () => {
        if (!selectedAssignment) {
            setMessage('Please select an assignment before submitting marks.');
            setMessageType('warning');
            return;
        }
        if (!examName.trim()) {
            setMessage('Please enter the Exam Name.');
            setMessageType('warning');
            return;
        }
        if (students.length === 0) {
            setMessage('No students to submit marks for. Load students first.');
            setMessageType('warning');
            return;
        }

        const invalidMarks = marksList.some(m =>
            m.marksObtained === '' ||
            m.maxMarks === '' ||
            isNaN(m.marksObtained) ||
            isNaN(m.maxMarks) ||
            m.marksObtained < 0 ||
            m.maxMarks <= 0 ||
            m.marksObtained > m.maxMarks
        );

        if (invalidMarks) {
            setMessage('Please ensure all marks are valid numbers, non-negative, and marks obtained do not exceed max marks.');
            setMessageType('danger');
            return;
        }

        const payload = marksList.map((entry) => ({
            ...entry,
            subjectId: selectedAssignment.value.subjectId,
            classId: selectedAssignment.value.classId,
            sectionId: selectedAssignment.value.sectionId,
            examName: examName.trim(),
            academicYear,
            teacherId: teacherId
        }));

        setLoading(true);
        setMessage(''); // Clear previous messages

        API.post('/marks', payload)
            .then(() => {
                setMessage('✅ Marks submitted successfully!');
                setMessageType('success');
                // Clear fields after successful submission
                setSelectedAssignment(null);
                setStudents([]);
                setMarksList([]);
                setExamName('');
                setAcademicYear('2025-2026'); // Reset to default
                fetchSubmittedMarks(); // Re-fetch submitted marks to update the list
            })
            .catch((err) => {
                console.error("Error submitting marks:", err);
                setMessage('❌ Failed to submit marks. Please check input values.');
                setMessageType('danger');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const getGradeClass = (grade) => {
        switch (grade) {
            case 'A': return 'grade-a';
            case 'B': return 'grade-b';
            case 'C': return 'grade-c';
            case 'D': return 'grade-d';
            case 'F': return 'grade-f';
            case 'N/A': return 'grade-na';
            default: return '';
        }
    };

    const getAlertIcon = (type) => {
        switch (type) {
            case 'success': return <InfoCircleFill className="me-2" />;
            case 'warning': return <ExclamationTriangleFill className="me-2" />;
            case 'danger': return <XCircleFill className="me-2" />;
            default: return <InfoCircleFill className="me-2" />;
        }
    };

    return (
        <Row className="g-0 teacher-grades-container">
            <TeacherSidebar />
            <Col md={10} className="teacher-content-area">
                <motion.div
                    className="content-inner-wrapper"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    <h3 className="section-heading mb-4">
                        <Clipboard2CheckFill className="me-3" />
                        Grades / Assessments
                    </h3>

                    {message && (
                        <Alert variant={messageType} className={`custom-alert alert-${messageType} mb-4`}>
                            {getAlertIcon(messageType)}
                            {message}
                        </Alert>
                    )}

                    {/* Assignment Selection & Load Students Section */}
                    <motion.div
                        className="grade-entry-form card-glass p-4 mb-5"
                        variants={itemVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <h4 className="form-section-title mb-4">
                            <PersonFill className="me-2" /> Select Assignment & Load Students
                        </h4>
                        <Form className="mb-4">
                            <Row className="g-3 align-items-end">
                                <Col md={7}>
                                    <Form.Group controlId="assignmentSelect">
                                        <Form.Label className="form-label-dark">
                                            Choose Class-Section-Subject
                                        </Form.Label>
                                        <Select
                                            options={assignments}
                                            value={selectedAssignment}
                                            onChange={handleAssignmentSelect}
                                            placeholder="Select Class – Section – Subject"
                                            classNamePrefix="react-select-dark"
                                            isClearable
                                            styles={{
                                                control: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    backgroundColor: 'var(--input-bg-dark)',
                                                    borderColor: state.isFocused ? 'var(--primary-color)' : 'var(--border-dark)',
                                                    boxShadow: state.isFocused ? '0 0 0 0.25rem var(--primary-color-shadow)' : 'none',
                                                    color: 'var(--text-light)',
                                                    '&:hover': { borderColor: 'var(--primary-color-hover)' },
                                                    minHeight: '48px', // Consistent height
                                                }),
                                                singleValue: (baseStyles) => ({ ...baseStyles, color: 'var(--text-light)' }),
                                                input: (baseStyles) => ({ ...baseStyles, color: 'var(--text-light)' }),
                                                placeholder: (baseStyles) => ({ ...baseStyles, color: 'var(--text-placeholder)' }),
                                                menu: (baseStyles) => ({
                                                    ...baseStyles,
                                                    backgroundColor: 'var(--card-bg-dark)',
                                                    border: '1px solid var(--border-dark)',
                                                    boxShadow: 'var(--shadow-elevation-medium)',
                                                    borderRadius: '8px',
                                                    zIndex: 9999, // Ensure dropdown is above other content
                                                }),
                                                option: (baseStyles, state) => ({
                                                    ...baseStyles,
                                                    backgroundColor: state.isSelected ? 'var(--primary-color)' : (state.isFocused ? 'var(--input-hover-bg)' : 'var(--card-bg-dark)'),
                                                    color: 'var(--text-light)',
                                                    padding: '12px 20px',
                                                    '&:active': { backgroundColor: 'var(--primary-color-hover)' },
                                                }),
                                            }}
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={5}>
                                    <Button
                                        variant="primary"
                                        onClick={fetchStudentsForAssignment}
                                        className="load-students-btn w-100"
                                        disabled={!selectedAssignment || loading}
                                    >
                                        {loading && students.length === 0 ? (
                                            <>
                                                <Spinner animation="border" size="sm" className="me-2" /> Loading...
                                            </>
                                        ) : (
                                            <>
                                                Load Students <i className="bi bi-arrow-right"></i>
                                            </>
                                        )}
                                    </Button>
                                </Col>
                            </Row>
                        </Form>
                    </motion.div>

                    {/* Students Marks Entry Section */}
                    {students.length > 0 && (
                        <motion.div
                            variants={itemVariants}
                            initial="hidden"
                            animate="visible"
                            className="student-marks-entry-section card-glass p-4 mb-5"
                        >
                            <h4 className="form-section-title mb-4">
                                <AwardFill className="me-2" /> Enter Student Marks
                            </h4>
                            <Row className="mb-4 g-3">
                                <Col md={6}>
                                    <Form.Group controlId="examName">
                                        <Form.Label className="form-label-dark">
                                            Exam Name
                                        </Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="e.g., Midterm Exam, Unit Test 1"
                                            value={examName}
                                            onChange={(e) => setExamName(e.target.value)}
                                            className="form-control-dark"
                                        />
                                    </Form.Group>
                                </Col>
                                <Col md={6}>
                                    <Form.Group controlId="academicYear">
                                        <Form.Label className="form-label-dark">
                                            Academic Year
                                        </Form.Label>
                                        <Form.Control
                                            type="text" // Changed to text as years are usually strings "YYYY-YYYY"
                                            placeholder="e.g., 2025-2026"
                                            value={academicYear}
                                            onChange={(e) => setAcademicYear(e.target.value)}
                                            className="form-control-dark"
                                        />
                                    </Form.Group>
                                </Col>
                            </Row>

                            <motion.div
                                className="responsive-table-wrapper mb-4"
                                variants={tableVariants}
                                initial="hidden"
                                animate="visible"
                            >
                                <Table className="grades-table" responsive>
                                    <thead>
                                        <tr>
                                            <th>#</th>
                                            <th>Student Name</th>
                                            <th>Marks Obtained</th>
                                            <th>Max Marks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.map((stu, index) => (
                                            <tr key={stu.id}>
                                                <td>{index + 1}</td>
                                                <td>{stu.fullName}</td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={marksList[index]?.marksObtained || ''}
                                                        onChange={(e) => handleMarksChange(index, 'marksObtained', e.target.value)}
                                                        className="marks-input form-control-dark"
                                                        min="0"
                                                        max={marksList[index]?.maxMarks || 100}
                                                    />
                                                </td>
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        value={marksList[index]?.maxMarks || 100}
                                                        onChange={(e) => handleMarksChange(index, 'maxMarks', e.target.value)}
                                                        className="marks-input form-control-dark"
                                                        min="1"
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </motion.div>

                            <Button
                                variant="success"
                                onClick={handleSubmitMarks}
                                className="submit-marks-btn w-auto d-flex align-items-center justify-content-center"
                                disabled={loading || !examName.trim() || marksList.some(m => m.marksObtained === '' || m.maxMarks === '')}
                            >
                                {loading ? (
                                    <>
                                        <Spinner animation="border" size="sm" className="me-2" /> Submitting...
                                    </>
                                ) : (
                                    <>
                                        Submit Marks <SendFill className="ms-2" />
                                    </>
                                )}
                            </Button>
                        </motion.div>
                    )}

                    {loading && students.length === 0 && (
                        <div className="text-center my-5 loading-state">
                            <Spinner animation="border" role="status" className="spinner-lg">
                                <span className="visually-hidden">Loading students...</span>
                            </Spinner>
                            <p className="mt-3 text-muted">Loading student list...</p>
                        </div>
                    )}

                    {!loading && students.length === 0 && !message && (
                        <div className="no-entries-found my-5">
                            <InfoCircleFill className="icon-large mb-3" />
                            <p className="lead">Start by selecting an assignment to load students!</p>
                            <p className="lead2">Once selected, you can enter marks for the respective class and subject.</p>
                        </div>
                    )}

                    <hr className="my-5 hr-gradient" /> {/* Stylish separator */}

                    {/* Submitted Marks Section (Accordion Cards) */}
                    <h3 className="section-heading mb-4">
                        <AwardFill className="me-3" />
                        Submitted Marks Overview
                    </h3>

                    <div className="submitted-marks-list">
                        {Object.keys(submittedMarks).length === 0 ? (
                            <div className="no-entries-found my-5">
                                <InfoCircleFill className="icon-large mb-3" />
                                <p className="lead">No submitted marks found.</p>
                                <p className="text-muted">Start submitting marks to see them here!</p>
                            </div>
                        ) : (
                            Object.entries(submittedMarks).map(([examKey, marksArray]) => (
                                <motion.div
                                    key={examKey}
                                    className="submitted-exam-card card-glass mb-4"
                                    variants={itemVariants}
                                    initial="hidden"
                                    animate="visible"
                                >
                                    <Collapsible
                                        trigger={
                                            <div className="submitted-exam-header">
                                                <div className="header-title-group">
                                                    <Clipboard2CheckFill className="me-2" />
                                                    <h5>{examKey}</h5>
                                                </div>
                                                <ChevronDown className={`accordion-icon ${expandedExam === examKey ? 'expanded' : ''}`} />
                                            </div>
                                        }
                                        open={expandedExam === examKey}
                                        onOpening={() => setExpandedExam(examKey)}
                                        onClosing={() => setExpandedExam(null)}
                                        transitionTime={300}
                                        easing="ease-in-out"
                                    >
                                        <div className="submitted-exam-content">
                                            <div className="responsive-table-wrapper">
                                                <Table className="grades-table" responsive>
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Student</th>
                                                            <th>Marks</th>
                                                            <th>Max</th>
                                                            <th>Grade</th>
                                                            <th>Subject</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {marksArray.map((mark, idx) => (
                                                            <tr key={mark.id || idx}>
                                                                <td>{idx + 1}</td>
                                                                <td>{mark.student?.fullName}</td>
                                                                <td>{mark.marksObtained}</td>
                                                                <td>{mark.maxMarks}</td>
                                                                <td className="grade-cell">
                                                                    <span className={`grade-badge ${getGradeClass(mark.grade)}`}>
                                                                        {mark.grade || 'N/A'}
                                                                    </span>
                                                                </td>
                                                                <td>{mark.subject?.subjectName}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>
                                        </div>
                                    </Collapsible>
                                </motion.div>
                            ))
                        )}
                    </div>
                </motion.div>
            </Col>
        </Row>
    );
};

export default TeacherGrades;