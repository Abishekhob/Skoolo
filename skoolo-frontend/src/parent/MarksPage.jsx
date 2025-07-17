import React, { useEffect, useState } from 'react';
import API from '../services/api'; // Assuming this path is correct
import { Table, Spinner, Offcanvas, Button } from 'react-bootstrap';
import ParentSidebar from './ParentSidebar'; // Assuming this path is correct
import { FaBars, FaGraduationCap } from 'react-icons/fa';

// Import the new CSS file
import './style/MarksPage.css';

const MarksPage = () => {
    const parentId = localStorage.getItem('parentId');
    const [marks, setMarks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSidebarOffcanvas, setShowSidebarOffcanvas] = useState(false);

    useEffect(() => {
        if (!parentId) {
            setLoading(false);
            console.error("Parent ID not found in localStorage.");
            return;
        }

        API.get(`/parents/${parentId}/marks`)
            .then(res => {
                setMarks(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error('Error fetching marks:', err);
                setLoading(false);
            });
    }, [parentId]);

    const childName = marks.length > 0 ? marks[0].childName : '';

    const groupedByExam = marks.reduce((acc, mark) => {
        const exam = mark.examName || 'Uncategorized Exams';
        if (!acc[exam]) acc[exam] = [];
        acc[exam].push(mark);
        return acc;
    }, {});

    if (loading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" className="spinner-custom" />
                <p className="loading-text">Loading academic progress...</p>
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
                    variant="outline-light" // Changed to outline-light for dark theme contrast
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

                <div className="marks-dashboard-content">
                    <h2 className="page-title">Marks Dashboard</h2>
                    {childName ? (
                        <h5 className="child-name-title">{childName}'s Academic Progress</h5>
                    ) : (
                        <p className="no-child-info">No child information available, or marks not yet loaded.</p>
                    )}

                    {marks.length === 0 ? (
                        <div className="no-data-message-container">
                            <FaGraduationCap size={80} className="mb-4 no-data-icon" />
                            <p className="no-data-message">No marks available for your child yet. Please check back later!</p>
                        </div>
                    ) : (
                        <div className="marks-content-grid custom-scroll">
                            {Object.entries(groupedByExam).map(([examName, examMarks]) => (
                                <div key={examName} className="exam-section mb-5">
                                    <h5 className="exam-title">
                                        <span className="exam-icon">📝</span> {examName}
                                    </h5>
                                    <div className="table-responsive-wrapper">
                                        <Table responsive className="marks-table">
                                            <thead>
                                                <tr>
                                                    <th>Subject</th>
                                                    <th className="text-center">Marks Obtained</th>
                                                    <th className="text-center">Total Marks</th>
                                                    <th className="text-center">Grade</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {examMarks.map((mark) => (
                                                    <tr key={mark.markId}>
                                                        <td>{mark.subjectName || 'N/A'}</td>
                                                        <td className="text-center">{mark.marksObtained ?? '-'}</td>
                                                        <td className="text-center">{mark.maxMarks ?? '-'}</td>
                                                        <td className="text-center mark-grade">
                                                            {mark.grade || '-'}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MarksPage;