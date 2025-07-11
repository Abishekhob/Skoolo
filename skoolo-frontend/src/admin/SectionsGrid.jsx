import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Card,
    Row,
    Col,
    Spinner,
    Container,
    Button,
    Alert,
} from 'react-bootstrap';
import API from '../services/api';
import AdminSidebar from './AdminSideBar';

// Define some reusable styles for consistency
const STYLES = {
    mainBackground: 'min-vh-100 bg-black text-white',
    cardHoverEffect: {
        transition: 'transform 0.2s ease-in-out',
        cursor: 'pointer',
    },
    cardColors: 'bg-secondary text-white shadow-lg border-light',
};

const SectionsGrid = () => {
    const { classId } = useParams();
    const navigate = useNavigate();

    const [sections, setSections] = useState([]);
    const [className, setClassName] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // State for handling errors

    /**
     * @description Fetches section data from the API.
     */
    const fetchSections = useCallback(async () => {
        setLoading(true); // Ensure loading is true on every fetch attempt
        setError(null);   // Clear any previous errors
        try {
            const res = await API.get(`/classes/${classId}/sections`);
            setSections(res.data.sections);
            setClassName(res.data.className);
        } catch (err) {
            console.error('Error loading sections:', err);
            setError('Failed to load sections. Please try again.'); // User-friendly error message
        } finally {
            setLoading(false);
        }
    }, [classId]); // Dependency on classId to re-fetch if it changes

    useEffect(() => {
        fetchSections();
    }, [fetchSections]); // Dependency on fetchSections useCallback

    /**
     * @description Handles click event for a section card, navigating to its details.
     * @param {string} sectionId - The ID of the section to navigate to.
     */
    const handleSectionClick = (sectionId) => {
        navigate(`/admin/classes/${classId}/sections/${sectionId}`);
    };

    // --- Render Logic ---

    // Loading State
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
                <Spinner animation="border" variant="light" role="status">
                    <span className="visually-hidden">Loading sections...</span>
                </Spinner>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className={`${STYLES.mainBackground} d-flex justify-content-center align-items-center vh-100`}>
                <Alert variant="danger" className="text-center">
                    <Alert.Heading>Oh Snap! Something went wrong.</Alert.Heading>
                    <p>{error}</p>
                    <Button variant="outline-danger" onClick={fetchSections}>
                        Retry Loading
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className={STYLES.mainBackground} style={{ overflowX: 'hidden' }}>
            <Container fluid className="p-0">
                <Row className="g-0">
                    {/* Admin Sidebar */}
                    <AdminSidebar />

                    {/* Main content area */}
                    <Col md={10} className="py-5 px-4">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <Button
                                variant="outline-light"
                                onClick={() => navigate(-1)}
                                className="me-2"
                            >
                                &larr; Back
                            </Button>

                            <h3 className="flex-grow-1 text-center m-0">
                                Class {className} - Select a Section
                            </h3>

                            {/* Spacer to visually center the title, matching back button's width */}
                            <div style={{ width: '90px' }}></div>
                        </div>

                        {sections.length === 0 ? (
                            <Alert variant="info" className="text-center mt-5">
                                No sections found for Class {className}.
                            </Alert>
                        ) : (
                            <Row className="g-4 justify-content-center"> {/* Added justify-content-center for better alignment */}
                                {sections.map((section) => (
                                    <Col key={section.id} xs={12} sm={6} md={4} lg={3}>
                                        <Card
                                            className={STYLES.cardColors}
                                            style={STYLES.cardHoverEffect}
                                            onClick={() => handleSectionClick(section.id)}
                                            onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
                                            onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1.0)')}
                                        >
                                            <Card.Body>
                                                <Card.Title className="text-center mb-3">
                                                    {className}-{section.name.toUpperCase()}
                                                </Card.Title>
                                                <Card.Text className="text-center text-light">
                                                    <small>
                                                        Students: <strong>{section.totalStudents || 0}</strong> <br />
                                                        Class Teacher: <strong>{section.classTeacher || 'Not Assigned'}</strong>
                                                    </small>
                                                </Card.Text>
                                            </Card.Body>
                                        </Card>
                                    </Col>
                                ))}
                            </Row>
                        )}
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default SectionsGrid;