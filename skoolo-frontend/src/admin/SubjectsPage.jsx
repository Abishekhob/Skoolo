import React, { useState, useEffect, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Spinner, Alert, Modal } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';// Adjust path if necessary
import API from '../services/api'; // Adjust path to your API service

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
            setError('Failed to add subject. It might already exist.');
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
            setError('Failed to update subject. It might already exist or name is invalid.');
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
            setError('Failed to delete subject. It might be in use.');
        } finally {
            setLoading(false);
            setSubjectToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteModal(false);
        setSubjectToDelete(null);
    };


    // Render Logic
    if (loading && subjects.length === 0) { // Show spinner only if no data yet
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-black">
                <Spinner animation="border" variant="light" role="status">
                    <span className="visually-hidden">Loading subjects...</span>
                </Spinner>
            </div>
        );
    }

    return (
        <Container fluid className="min-vh-100 bg-black text-white p-0">
            <Row className="g-0">
                <AdminSidebar />
                <Col md={10} className="py-5 px-4">
                    <h3 className="mb-4 text-center">Manage Subjects</h3>

                    {error && <Alert variant="danger" className="mb-4">{error}</Alert>}
                    {success && <Alert variant="success" className="mb-4">{success}</Alert>}

                    {/* Add New Subject */}
                    <Card className="bg-dark text-white p-4 mb-5 shadow">
                        <Card.Title className="mb-3">Add New Subject</Card.Title>
                        <Form onSubmit={handleAddSubject}>
                            <Form.Group className="mb-3">
                                <Form.Label>Subject Name</Form.Label>
                                <Form.Control
                                    type="text"
                                    placeholder="e.g., Mathematics, Science, History"
                                    value={newSubjectName}
                                    onChange={(e) => setNewSubjectName(e.target.value)}
                                    className="bg-secondary text-white border-secondary"
                                    required
                                />
                            </Form.Group>
                            <Button variant="primary" type="submit" disabled={loading}>
                                {loading ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : 'Add Subject'}
                            </Button>
                        </Form>
                    </Card>

                    {/* List Subjects */}
                    <Card className="bg-dark text-white p-4 shadow">
                        <Card.Title className="mb-3">Existing Subjects</Card.Title>
                        {subjects.length === 0 && !loading ? (
                            <Alert variant="info" className="text-center">No subjects found. Add a new one above!</Alert>
                        ) : (
                            <Table striped bordered hover variant="dark" responsive>
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
                                                        className="bg-secondary text-white border-secondary"
                                                    />
                                                ) : (
                                                    subject.subjectName
                                                )}
                                            </td>
                                            <td className="text-center">
                                                {editingSubjectId === subject.id ? (
                                                    <>
                                                        <Button
                                                            variant="success"
                                                            size="sm"
                                                            onClick={() => handleSaveEdit(subject.id)}
                                                            className="me-2"
                                                            disabled={loading}
                                                        >
                                                            Save
                                                        </Button>
                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={handleCancelEdit}
                                                            disabled={loading}
                                                        >
                                                            Cancel
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <>
                                                        <Button
                                                            variant="warning"
                                                            size="sm"
                                                            onClick={() => handleEditClick(subject)}
                                                            className="me-2"
                                                        >
                                                            Edit
                                                        </Button>
                                                        <Button
                                                            variant="danger"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(subject)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card>
                </Col>
            </Row>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={cancelDelete} centered>
                <Modal.Header closeButton className="bg-dark text-white border-bottom border-secondary">
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body className="bg-dark text-white">
                    Are you sure you want to delete the subject "<strong>{subjectToDelete?.subjectName}</strong>"? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer className="bg-dark border-top border-secondary">
                    <Button variant="secondary" onClick={cancelDelete}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={confirmDelete} disabled={loading}>
                        {loading ? <Spinner as="span" animation="border" size="sm" /> : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default SubjectsPage;