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
import API from '../services/api'; // Assuming this path is correct
import AdminSidebar from './AdminSidebar';

// Icons (ensure react-icons is installed: npm install react-icons)
import { IoArrowBackOutline } from "react-icons/io5";

// Import the dedicated CSS file
import './style/SectionsGrid.css';

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
        setError(null);    // Clear any previous errors
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
            <div className="loading-overlay-full">
                <Spinner animation="border" variant="light" />
                <p className="loading-text">Summoning sections...</p>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="error-overlay-full">
                <Alert variant="danger" className="error-alert">
                    <Alert.Heading className="error-heading">Oh Snap! Something went wrong.</Alert.Heading>
                    <p className="error-message">{error}</p>
                    <Button variant="outline-light" onClick={fetchSections} className="retry-button">
                        Retry Loading
                    </Button>
                </Alert>
            </div>
        );
    }

    return (
        <div className="sections-grid-page">
            <Container fluid className="p-0 h-100">
                <Row className="g-0 h-100">
                    {/* Admin Sidebar */}
                    <AdminSidebar />

                    {/* Main content area */}
                    <Col md={10} className="sections-main-content py-5 px-4">
                        <div className="sections-header-bar mb-5">
                            <Button
                                variant="outline-light"
                                onClick={() => navigate(-1)}
                                className="back-button"
                            >
                                <IoArrowBackOutline className="me-1" /> Back
                            </Button>

                            <h3 className="page-title flex-grow-1 text-center m-0">
                                <span className="text-gradient">Class {className}</span> - Select a Section
                            </h3>

                            {/* Spacer to visually center the title, matching back button's width */}
                            <div style={{ width: '90px' }}></div>
                        </div>

                        {sections.length === 0 ? (
                            <div className="no-sections-found">
                                <Alert variant="info" className="no-sections-alert">
                                    <span role="img" aria-label="info emoji">ℹ️</span> No sections found for <span className="fw-bold">{className}</span>.
                                </Alert>
                            </div>
                        ) : (
                            <Row className="g-4 justify-content-center">
                                {sections.map((section) => (
                                    <Col key={section.id} xs={12} sm={6} md={4} lg={3} xxl={3} className="d-flex">
                                        <Card
                                            className="section-card flex-grow-1"
                                            onClick={() => handleSectionClick(section.id)}
                                        >
                                            <Card.Body className="d-flex flex-column justify-content-center align-items-center text-center">
                                                <Card.Title className="section-card-title mb-3">
                                                    {className}-{section.name.toUpperCase()}
                                                </Card.Title>
                                                <Card.Text className="section-card-text">
                                                    <span className="info-item">Students: <span className="info-value">{section.totalStudents || 0}</span></span>
                                                    <span className="info-item">Class Teacher: <span className="info-value">{section.classTeacher || 'Not Assigned'}</span></span>
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