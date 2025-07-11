import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert, Spinner } from 'react-bootstrap';
import {
    FaBookOpen,
    FaCalendarAlt,
    FaChalkboardTeacher,
    FaLayerGroup,
    FaGraduationCap,
    FaEdit,
    FaBell,
    FaPlusCircle,
    FaRegLightbulb,
    FaTimes, // Added for modal close button
    FaEye, // For general view icon in modal
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion'; // For animations
import Modal from 'react-modal'; // For the modal
import API from '../services/api';
import TeacherSidebar from './TeacherSidebar';
import './style/TeacherAssignments.css'; // Ensure this is linked!

// Set app element for react-modal for accessibility
Modal.setAppElement('#root'); // Or the ID of your main app container

const TeacherAssignments = () => {
    const teacherId = localStorage.getItem('teacherId');

    const [assignments, setAssignments] = useState([]);
    const [assignment, setAssignment] = useState({
        type: 'assignment',
        title: '',
        description: '',
        dueDate: '',
        classId: null,
        sectionId: null,
        subjectId: null,
    });
    const [classSections, setClassSections] = useState([]);
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [selectedAssignment, setSelectedAssignment] = useState(null); // State for modal
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility

    useEffect(() => {
        if (!teacherId) {
            setError('Teacher ID not found in local storage. Please log in.');
            return;
        }

        const fetchInitialData = async () => {
            setLoading(true);
            try {
                const [classesRes, assignmentsRes] = await Promise.all([
                    API.get(`/teacher/${teacherId}/assigned-classes`),
                    API.get('/assignments'),
                ]);
                setClassSections(classesRes.data);
                setAssignments(assignmentsRes.data);
            } catch (err) {
                console.error("❌ Failed to load initial data:", err);
                setError('Failed to load classes or assignments. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchInitialData();
    }, [teacherId]);

    const handleChange = (e) => {
        let { name, value } = e.target;

        if (['classId', 'sectionId', 'subjectId'].includes(name)) {
            value = value === '' ? null : parseInt(value);
        }

        if (name === 'classId') {
            const sectionsForClass = classSections.filter(cs => cs.classId === value);
            // Auto-select if only one section/subject exists for the chosen class
            const newSectionId = sectionsForClass.length === 1 ? sectionsForClass[0].sectionId : null;
            const newSubjectId = sectionsForClass.length === 1 ? sectionsForClass[0].subjectId : null;

            setAssignment(prev => ({
                ...prev,
                classId: value,
                sectionId: newSectionId,
                subjectId: newSubjectId,
            }));
        } else if (name === 'sectionId') {
            const subjectsForSection = classSections.filter(cs =>
                cs.classId === assignment.classId && cs.sectionId === value
            );
            const newSubjectId = subjectsForSection.length === 1 ? subjectsForSection[0].subjectId : null;

            setAssignment(prev => ({
                ...prev,
                sectionId: value,
                subjectId: newSubjectId,
            }));
        } else {
            setAssignment(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (loading) return;

        const { title, dueDate, classId, sectionId, subjectId, type, description } = assignment;

        if (!title || !dueDate || !classId || !sectionId || !subjectId) {
            setMessage('⚠️ Please fill in all required fields.');
            setTimeout(() => setMessage(''), 5000);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                type,
                title,
                description,
                dueDate,
                classEntity: { id: classId },
                section: { id: sectionId },
                subject: { id: subjectId },
                teacher: { id: parseInt(teacherId) },
            };

            await API.post('/assignments', payload);

            setMessage('✅ Assignment created successfully!');
            setTimeout(() => setMessage(''), 5000);
            const updatedAssignments = await API.get('/assignments');
            setAssignments(updatedAssignments.data);

            setAssignment({
                type: 'assignment',
                title: '',
                description: '',
                dueDate: '',
                classId: null,
                sectionId: null,
                subjectId: null,
            });
        } catch (err) {
            console.error('Create assignment failed:', err);
            setMessage('❌ Failed to create assignment. Please try again.');
            setTimeout(() => setMessage(''), 5000);
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type?.toLowerCase()) {
            case 'assignment': return <FaBookOpen />;
            case 'homework': return <FaEdit />;
            case 'reminder': return <FaBell />;
            case 'exam': return <FaGraduationCap />;
            case 'instruction': return <FaChalkboardTeacher />;
            default: return <FaTag />;
        }
    };

    const getSubjectNameByIds = (classId, sectionId, subjectId) => {
        const found = classSections.find(
            cs => cs.classId === classId && cs.sectionId === sectionId && cs.subjectId === subjectId
        );
        return found ? found.subjectName : 'N/A';
    };

    // Modal functions
    const openAssignmentModal = (assignmentData) => {
        setSelectedAssignment(assignmentData);
        setIsModalOpen(true);
    };

    const closeAssignmentModal = () => {
        setIsModalOpen(false);
        setSelectedAssignment(null);
    };

    // Custom styles for the modal (these will be moved to CSS, but kept here for now as you provided them this way)
    const customModalStyles = {
        content: {
            top: '50%',
            left: '50%',
            right: 'auto',
            bottom: 'auto',
            marginRight: '-50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(20, 20, 40, 0.7)', // Darker blue with more opacity for glass effect
            border: '1px solid rgba(100, 100, 180, 0.4)', // Blue-tinted border for luminosity
            backdropFilter: 'blur(15px)', // Stronger blur
            WebkitBackdropFilter: 'blur(15px)',
            borderRadius: '25px',
            boxShadow: '0 15px 50px 0 rgba(0, 0, 0, 0.65)', // Deeper shadow
            padding: '40px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '25px',
            position: 'relative',
            zIndex: 1000, // Ensure it's on top
        },
        overlay: {
            backgroundColor: 'rgba(0, 0, 0, 0.75)', // Darker overlay
            zIndex: 999, // Ensure overlay is beneath modal but above page
        },
    };


    return (
        <Row className="g-0 teacher-assignments-container">
            <TeacherSidebar />
            {/* New wrapper for content area to control padding/background */}
            <Col md={10} className="teacher-assignments-page-wrapper">
                <div className="teacher-content-area"> {/* Inner div for content alignment */}
                    <h3 className="mb-4 dashboard-title">📚 Manage Assignments</h3>

                    {message && <Alert variant={message.includes('✅') ? "success" : message.includes('⚠️') ? "warning" : "danger"} className="mb-3 custom-alert">{message}</Alert>}
                    {error && <Alert variant="danger" className="mb-3 custom-alert">{error}</Alert>}

                    <Form className="assignment-form glass-effect" onSubmit={handleSubmit}>
                        <Row className="mb-3 gx-3">
                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Title</Form.Label>
                                    <Form.Control
                                        name="title"
                                        value={assignment.title}
                                        onChange={handleChange}
                                        placeholder="Enter assignment title"
                                        autoComplete="off"
                                        className="form-control-dark"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Type</Form.Label>
                                    <Form.Select
                                        name="type"
                                        value={assignment.type}
                                        onChange={handleChange}
                                        className="form-select-dark"
                                    >
                                        <option value="assignment">Assignment</option>
                                        <option value="homework">Homework</option>
                                        <option value="reminder">Reminder</option>
                                        <option value="exam">Exam</option>
                                        <option value="instruction">Instruction</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Due Date</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dueDate"
                                        value={assignment.dueDate}
                                        onChange={handleChange}
                                        className="form-control-dark"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <Row className="mb-4 gx-3">
                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Class</Form.Label>
                                    <Form.Select
                                        name="classId"
                                        value={assignment.classId || ''}
                                        onChange={handleChange}
                                        className="form-select-dark"
                                    >
                                        <option value="">-- Select Class --</option>
                                        {[...new Set(classSections.map(cs => cs.classId))].map(classId => {
                                            const classInfo = classSections.find(cs => cs.classId === classId);
                                            return (
                                                <option
                                                    key={`class-${classId}`}
                                                    value={classId}
                                                >
                                                    {classInfo.className}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Section</Form.Label>
                                    <Form.Select
                                        name="sectionId"
                                        value={assignment.sectionId || ''}
                                        onChange={handleChange}
                                        className="form-select-dark"
                                        disabled={!assignment.classId}
                                    >
                                        <option value="">-- Select Section --</option>
                                        {[...new Set(classSections.filter(cs => cs.classId === assignment.classId).map(cs => cs.sectionId))].map(sectionId => {
                                            const sectionInfo = classSections.find(cs => cs.sectionId === sectionId);
                                            return (
                                                <option key={`section-${sectionId}`} value={sectionId}>
                                                    {sectionInfo.sectionName}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>
                            </Col>

                            <Col md={6} lg={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="form-label-dark">Subject</Form.Label>
                                    <Form.Select
                                        name="subjectId"
                                        value={assignment.subjectId || ''}
                                        onChange={handleChange}
                                        className="form-select-dark"
                                        disabled={!assignment.classId || !assignment.sectionId}
                                    >
                                        <option value="">-- Select Subject --</option>
                                        {[...new Set(classSections.filter(
                                            cs => cs.classId === assignment.classId && cs.sectionId === assignment.sectionId
                                        ).map(cs => cs.subjectId))].map(subjectId => {
                                            const subjectInfo = classSections.find(cs => cs.subjectId === subjectId);
                                            return (
                                                <option
                                                    key={`subject-${subjectId}`}
                                                    value={subjectId}
                                                >
                                                    {subjectInfo.subjectName}
                                                </option>
                                            );
                                        })}
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                        </Row>

                        <Form.Group className="mb-4">
                            <Form.Label className="form-label-dark">Description</Form.Label>
                            <Form.Control
                                as="textarea"
                                name="description"
                                value={assignment.description}
                                onChange={handleChange}
                                rows={4}
                                placeholder="Provide a detailed description for the assignment, including instructions or specific requirements..."
                                autoComplete="off"
                                className="form-control-dark"
                            />
                        </Form.Group>

                        <Button type="submit" disabled={loading} className="create-assignment-btn w-100">
                            {loading ? (
                                <>
                                    <Spinner animation="border" size="sm" className="me-2" /> Creating...
                                </>
                            ) : (
                                <>
                                    <FaPlusCircle className="me-2" /> Create New Assignment
                                </>
                            )}
                        </Button>
                    </Form>

                    <h5 className="mb-3 mt-5 all-assignments-heading">All Current Assignments</h5>
                    {loading && assignments.length === 0 ? (
                        <div className="text-center py-5">
                            <Spinner animation="border" role="status" variant="light">
                                <span className="visually-hidden">Loading assignments...</span>
                            </Spinner>
                            <p className="text-muted mt-3">Loading assignments...</p>
                        </div>
                    ) : assignments.length === 0 ? (
                        <motion.div
                            className="text-center text-muted no-assignments-found"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            <FaRegLightbulb size={50} className="mb-3" />
                            <p className="lead">No assignments found.</p>
                            <p>Start by creating one using the form above!</p>
                        </motion.div>
                    ) : (
                        // This is the main change: removed Row/Col around individual motion.divs
                        <div className="assignments-grid-container">
                            <AnimatePresence>
                                {assignments.map((a) => {
                                    const subjectName = getSubjectNameByIds(a.classEntity?.id, a.section?.id, a.subject?.id);

                                    return (
                                        <motion.div
                                            className="assignment-card glass-effect"
                                            onClick={() => openAssignmentModal(a)}
                                            role="button"
                                            tabIndex="0"
                                            onKeyPress={(e) => { if (e.key === 'Enter' || e.key === ' ') openAssignmentModal(a); }}
                                            whileHover={{
                                                y: -8,
                                                scale: 1.02,
                                                boxShadow: "0 18px 45px rgba(0, 0, 0, 0.7), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
                                            }}
                                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                                            initial={{ opacity: 0, y: 50 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            layout // Enables smooth re-layout when items are added/removed
                                            key={a.id} // Key should be on the outermost element of map
                                        >
                                            <div className="card-header">
                                                <h5 className="card-title-dark">
                                                    {getTypeIcon(a.type)} {a.title}
                                                </h5>
                                                <span className={`type-badge type-${a.type?.toLowerCase()}`}>
                                                    {a.type?.toUpperCase() || 'N/A'}
                                                </span>
                                            </div>

                                            <div className="card-details">
                                                <p><strong><FaCalendarAlt className="me-2" />Due:</strong> {a.dueDate}</p>
                                                <p><strong><FaGraduationCap className="me-2" />Class:</strong> {a.classEntity?.className || 'N/A'}</p>
                                                <p><strong><FaLayerGroup className="me-2" />Section:</strong> {a.section?.sectionName || 'N/A'}</p>
                                                <p><strong><FaBookOpen className="me-2" />Subject:</strong> {subjectName}</p>
                                            </div>

                                            {/* Short description for card preview */}
                                            <div className="card-description-wrapper">
                                                <p className="card-description">
                                                    {a.description ? `${a.description.substring(0, 120)}${a.description.length > 120 ? '...' : ''}` : 'No description provided.'}
                                                </p>
                                                {a.description && a.description.length > 120 && (
                                                    <Button
                                                        variant="link"
                                                        size="sm"
                                                        onClick={(e) => { e.stopPropagation(); openAssignmentModal(a); }} // Open modal on click
                                                        className="read-more-btn"
                                                        aria-label="Read more about this assignment"
                                                    >
                                                        <FaEye className="me-1" /> View Details
                                                    </Button>
                                                )}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div> {/* End teacher-content-area */}
            </Col>

            {/* Assignment Detail Modal */}
            <Modal
                isOpen={isModalOpen}
                onRequestClose={closeAssignmentModal}
                style={customModalStyles} // Will transfer these to CSS later
                contentLabel="Assignment Details"
            >
                {selectedAssignment && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                        className="modal-content-wrapper"
                    >
                        <Button
                            onClick={closeAssignmentModal}
                            className="modal-close-btn"
                            aria-label="Close assignment details"
                        >
                            <FaTimes />
                        </Button>

                        <div className="modal-header-content">
                            <h2 className="modal-title-dark">
                                {getTypeIcon(selectedAssignment.type)} {selectedAssignment.title}
                            </h2>
                            <span className={`type-badge type-${selectedAssignment.type?.toLowerCase()}`}>
                                {selectedAssignment.type?.toUpperCase() || 'N/A'}
                            </span>
                        </div>

                        <div className="modal-details-grid">
                            <p><strong><FaCalendarAlt /> Due:</strong> {selectedAssignment.dueDate}</p>
                            <p><strong><FaGraduationCap /> Class:</strong> {selectedAssignment.classEntity?.className || 'N/A'}</p>
                            <p><strong><FaLayerGroup /> Section:</strong> {selectedAssignment.section?.sectionName || 'N/A'}</p>
                            <p><strong><FaBookOpen /> Subject:</strong> {getSubjectNameByIds(selectedAssignment.classEntity?.id, selectedAssignment.section?.id, selectedAssignment.subject?.id)}</p>
                        </div>

                        <div className="modal-description-area">
                            <h4 className="modal-description-heading">Description:</h4>
                            <p className="modal-description-full">
                                {selectedAssignment.description || 'No description provided for this assignment.'}
                            </p>
                        </div>
                    </motion.div>
                )}
            </Modal>
        </Row>
    );
};

export default TeacherAssignments;