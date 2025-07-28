import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import API from '../services/api';
import { FaPlus, FaEdit, FaTrashAlt, FaSave, FaTimes, FaBookOpen } from 'react-icons/fa';
import './style/SubjectsPage.css';

const SubjectsPage = () => {
    const [subjects, setSubjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [newSubjectName, setNewSubjectName] = useState('');
    const [editingSubjectId, setEditingSubjectId] = useState(null);
    const [editingSubjectName, setEditingSubjectName] = useState('');

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [subjectToDelete, setSubjectToDelete] = useState(null);

    // Fetch Subjects
    const fetchSubjects = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const response = await API.get('/subjects');
            setSubjects(response.data);
        } catch (err) {
            console.error('Error fetching subjects:', err);
            setError('Failed to load subjects. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubjects();
    }, [fetchSubjects]);

    // Auto-dismiss success/error messages
    useEffect(() => {
        if (success) {
            const timer = setTimeout(() => setSuccess(''), 5000);
            return () => clearTimeout(timer);
        }
        if (error) {
            const timer = setTimeout(() => setError(''), 7000);
            return () => clearTimeout(timer);
        }
    }, [success, error]);

    // Add Subject
    const handleAddSubject = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!newSubjectName.trim()) {
            setError('Subject name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            await API.post('/subjects', { subjectName: newSubjectName });
            setNewSubjectName('');
            await fetchSubjects(); // Refresh the list
            setSuccess('Subject added successfully!');
        } catch (err) {
            console.error('Error adding subject:', err);
            setError(err.response?.data?.message || 'Failed to add subject. It might already exist.');
        } finally {
            setLoading(false);
        }
    };

    // Edit Subject
    const handleEditClick = (subject) => {
        setEditingSubjectId(subject.id);
        setEditingSubjectName(subject.subjectName);
    };

    const handleSaveEdit = async (subjectId) => {
        setError('');
        setSuccess('');
        if (!editingSubjectName.trim()) {
            setError('Subject name cannot be empty.');
            return;
        }

        setLoading(true);
        try {
            await API.put(`/subjects/${subjectId}`, { subjectName: editingSubjectName });
            setEditingSubjectId(null); // Exit edit mode
            setEditingSubjectName('');
            await fetchSubjects(); // Refresh the list
            setSuccess('Subject updated successfully!');
        } catch (err) {
            console.error('Error updating subject:', err);
            setError(err.response?.data?.message || 'Failed to update subject. It might already exist or name is invalid.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingSubjectId(null);
        setEditingSubjectName('');
    };

    // Delete Subject
    const handleDeleteClick = (subject) => {
        setSubjectToDelete(subject);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setError('');
        setSuccess('');
        setShowDeleteModal(false);
        if (!subjectToDelete) return;

        setLoading(true);
        try {
            await API.delete(`/subjects/${subjectToDelete.id}`);
            await fetchSubjects(); // Refresh the list
            setSuccess('Subject deleted successfully!');
        } catch (err) {
            console.error('Error deleting subject:', err);
            setError(err.response?.data?.message || 'Failed to delete subject. It might be in use.');
        } finally {
            setLoading(false);
            setSubjectToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSubjectToDelete(null);
    };

    // Render Logic for initial loading state
    if (loading && subjects.length === 0) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark-gradient">
                <Spinner animation="border" variant="light" role="status" className="initial-loading-spinner">
                    <span className="visually-hidden">Loading subjects...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="admin-layout-container">
            <Row className="g-0">
                <AdminSidebar />
                <Col md={10} className="main-content-area d-flex flex-column"> {/* Added flex-column */}
                    <div className="content-wrapper"> {/* New wrapper for sticky header */}
                        <div className="sticky-header"> {/* New div for sticky behavior */}
                            <h3 className="section-title mb-4">
                                <FaBookOpen className="me-2 icon-lg" />
                                Manage Subjects
                            </h3>

                            {/* Alerts */}
                            {error && <Alert variant="danger" className="custom-alert shake">{error}</Alert>}
                            {success && <Alert variant="success" className="custom-alert fade-in">{success}</Alert>}
                        </div>

                        <Container fluid className="p-4 content-scroll-area"> {/* Added content-scroll-area */}
                            {/* Add New Subject Card */}
                            <Card className="action-card mb-5">
                                <Card.Body>
                                    <Card.Title className="card-title-custom mb-3">Add New Subject</Card.Title>
                                    <Form onSubmit={handleAddSubject}>
                                        <Form.Group className="mb-3">
                                            <Form.Label className="form-label-custom">Subject Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., Mathematics, Science, History"
                                                value={newSubjectName}
                                                onChange={(e) => setNewSubjectName(e.target.value)}
                                                className="form-control-custom"
                                                required
                                            />
                                        </Form.Group>
                                        <Button variant="primary" type="submit" disabled={loading} className="w-100 btn-add-subject">
                                            {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : <><FaPlus className="me-2" /> Add Subject</>}
                                        </Button>
                                    </Form>
                                </Card.Body>
                            </Card>

                            {/* List Subjects Card */}
                            <Card className="data-card">
                                <Card.Body>
                                    <Card.Title className="card-title-custom mb-3">Existing Subjects</Card.Title>
                                    {subjects.length === 0 && !loading ? (
                                        <Alert variant="info" className="text-center custom-alert-info">No subjects found. Add a new one above!</Alert>
                                    ) : (
                                        <>
                                            {/* Desktop Table View */}
                                            <div className="table-responsive d-none d-lg-block">
                                                <Table striped bordered hover variant="dark" className="custom-table">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Subject Name</th>
                                                            <th className="text-center">Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {subjects.map((subject, index) => (
                                                            <tr key={subject.id}>
                                                                <td>{index + 1}</td>
                                                                <td>
                                                                    {editingSubjectId === subject.id ? (
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={editingSubjectName}
                                                                            onChange={(e) => setEditingSubjectName(e.target.value)}
                                                                            className="form-control-custom"
                                                                        />
                                                                    ) : (
                                                                        subject.subjectName
                                                                    )}
                                                                </td>
                                                                <td className="actions-column">
                                                                    {editingSubjectId === subject.id ? (
                                                                        <>
                                                                            <Button
                                                                                variant="success"
                                                                                size="sm"
                                                                                onClick={() => handleSaveEdit(subject.id)}
                                                                                className="me-2 btn-action"
                                                                                disabled={loading}
                                                                            >
                                                                                <FaSave /> Save
                                                                            </Button>
                                                                            <Button
                                                                                variant="secondary"
                                                                                size="sm"
                                                                                onClick={handleCancelEdit}
                                                                                className="btn-action"
                                                                                disabled={loading}
                                                                            >
                                                                                <FaTimes /> Cancel
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Button
                                                                                variant="warning"
                                                                                size="sm"
                                                                                onClick={() => handleEditClick(subject)}
                                                                                className="me-2 btn-action"
                                                                            >
                                                                                <FaEdit /> Edit
                                                                            </Button>
                                                                            <Button
                                                                                variant="danger"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteClick(subject)}
                                                                                className="btn-action"
                                                                            >
                                                                                <FaTrashAlt /> Delete
                                                                            </Button>
                                                                        </>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            </div>

                                            {/* Mobile Card View */}
                                            <div className="d-lg-none mobile-card-list">
                                                {subjects.map((subject, index) => (
                                                    <Card key={subject.id} className="mobile-subject-card mb-3">
                                                        <Card.Body>
                                                            <Card.Title className="mobile-card-title d-flex justify-content-between align-items-center">
                                                                <span>Subject {index + 1}</span>
                                                                <span className="subject-name-display">
                                                                    {editingSubjectId === subject.id ? (
                                                                        <Form.Control
                                                                            type="text"
                                                                            value={editingSubjectName}
                                                                            onChange={(e) => setEditingSubjectName(e.target.value)}
                                                                            className="form-control-custom compact-input"
                                                                        />
                                                                    ) : (
                                                                        subject.subjectName
                                                                    )}
                                                                </span>
                                                            </Card.Title>
                                                            <div className="d-flex justify-content-end action-buttons-mobile mt-3">
                                                                {editingSubjectId === subject.id ? (
                                                                    <>
                                                                        <Button
                                                                            variant="success"
                                                                            size="sm"
                                                                            onClick={() => handleSaveEdit(subject.id)}
                                                                            className="me-2 btn-action-mobile"
                                                                            disabled={loading}
                                                                        >
                                                                            <FaSave className="me-1" /> Save
                                                                        </Button>
                                                                        <Button
                                                                            variant="secondary"
                                                                            size="sm"
                                                                            onClick={handleCancelEdit}
                                                                            className="btn-action-mobile"
                                                                            disabled={loading}
                                                                        >
                                                                            <FaTimes className="me-1" /> Cancel
                                                                        </Button>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <Button
                                                                            variant="warning"
                                                                            size="sm"
                                                                            onClick={() => handleEditClick(subject)}
                                                                            className="me-2 btn-action-mobile"
                                                                        >
                                                                            <FaEdit className="me-1" /> Edit
                                                                        </Button>
                                                                        <Button
                                                                            variant="danger"
                                                                            size="sm"
                                                                            onClick={() => handleDeleteClick(subject)}
                                                                            className="btn-action-mobile"
                                                                        >
                                                                            <FaTrashAlt className="me-1" /> Delete
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </Card.Body>
                                                    </Card>
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </Card.Body>
                            </Card>
                        </Container>
                    </div>
                </Col>
            </Row>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered className="custom-modal">
                <Modal.Header closeButton className="modal-header-custom">
                    <Modal.Title>Confirm Deletion</Modal.Title>
                </Modal.Header>
                <Modal.Body className="modal-body-custom">
                    Are you sure you want to delete the subject "<strong>{subjectToDelete?.subjectName}</strong>"? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="modal-footer-custom">
                    <Button variant="secondary" onClick={cancelDelete} className="btn-modal-cancel">
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loading} className="btn-modal-delete">
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SubjectsPage;