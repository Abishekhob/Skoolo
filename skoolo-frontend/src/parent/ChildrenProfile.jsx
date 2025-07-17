import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { Card, Row, Col, Spinner, Button, Offcanvas } from 'react-bootstrap';
import ParentSidebar from './ParentSidebar';
// Changed FaChildReaching to FaUserGraduate
import { FaBars, FaUserGraduate } from 'react-icons/fa';
import './style/ChildrenProfile.css';

const ChildrenProfile = () => {
    const parentId = localStorage.getItem('parentId');
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebarOffcanvas, setShowSidebarOffcanvas] = useState(false);

    useEffect(() => {
        if (!parentId) {
            setLoading(false);
            console.error("Parent ID not found in localStorage.");
            return;
        }

        API.get(`/parents/${parentId}/children`)
            .then((res) => {
                setChildren(res.data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching children:', err);
                setLoading(false);
            });
    }, [parentId]);

    if (loading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" className="spinner-custom" />
                <p className="loading-text">Loading children profiles...</p>
            </div>
        );
    }

    return (
        <div className="app-container">
            {/* Parent Sidebar (visible on md and up) */}
            <div className="main-sidebar d-none d-md-block">
                <ParentSidebar />
            </div>

            {/* Main Content Area */}
            <div className="main-content-area">
                {/* Mobile Sidebar Toggle Button */}
                <Button
                    variant="outline-light"
                    className="d-md-none mobile-sidebar-toggle-btn"
                    onClick={() => setShowSidebarOffcanvas(true)}
                >
                    <FaBars className="me-2" /> Menu
                </Button>

                {/* Mobile Sidebar Offcanvas */}
                <Offcanvas
                    show={showSidebarOffcanvas}
                    onHide={() => setShowSidebarOffcanvas(false)}
                    placement="start"
                    className="mobile-sidebar-offcanvas"
                >
                    <Offcanvas.Header closeButton className="offcanvas-header-custom">
                        <Offcanvas.Title>Navigation</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="offcanvas-body-custom">
                        <ParentSidebar />
                    </Offcanvas.Body>
                </Offcanvas>

                <div className="main-content-wrapper">
                    <h2 className="page-title">Children Profile</h2>
                    {children.length === 0 ? (
                        <div className="no-data-message-container">
                            {/* Changed FaChildReaching to FaUserGraduate */}
                            <FaUserGraduate size={80} className="mb-4 no-data-icon" />
                            <p className="no-data-message">No children profiles available for your account yet. Please contact support if you believe this is an error.</p>
                        </div>
                    ) : (
                        <Row className="children-cards-grid">
                            {children.map((child) => (
                                <Col xs={12} sm={6} md={6} lg={4} key={child.id} className="mb-4">
                                    <Card className="child-profile-card">
                                        <Card.Body>
                                            <Card.Title className="card-title-custom">
                                                {child.firstName} {child.lastName}
                                            </Card.Title>
                                            <Card.Text className="card-text-custom">
                                                <span className="detail-label">Class:</span> {child.currentClass?.className || 'N/A'} <br />
                                                <span className="detail-label">Section:</span> {child.currentSection?.sectionName || 'N/A'} <br />
                                                <span className="detail-label">Gender:</span> {child.gender || 'N/A'}
                                            </Card.Text>
                                        </Card.Body>
                                    </Card>
                                </Col>
                            ))}
                        </Row>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ChildrenProfile;