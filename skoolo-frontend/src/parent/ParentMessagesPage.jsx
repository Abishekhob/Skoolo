import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import ChatWindow from '../teacher/ChatWindow'; // Assuming this path is correct
import { getUserIdFromRole } from '../utils/getUserIdFromRole'; // Assuming this path is correct
import API from '../services/api'; // Assuming this path is correct
import { Button, ListGroup, Offcanvas, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaCrown, FaEnvelopeOpenText, FaBars, FaArrowLeft, FaInfoCircle } from 'react-icons/fa';

// Import the new CSS file
import './style/ParentMessagesPage.css';
import ParentSidebar from './ParentSidebar'; // Assuming this path is correct


const ParentMessagesPage = () => {
    const [conversations, setConversations] = useState([]);
    const [availableUsers, setAvailableUsers] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [userId, setUserId] = useState(null);
    const [showUserList, setShowUserList] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showSidebarOffcanvas, setShowSidebarOffcanvas] = useState(false);
    const [showProfileModal, setShowProfileModal] = useState(false);
    const [profileUser, setProfileUser] = useState(null);

    const handleProfileClick = async (user) => {
        setProfileUser(null); // Clear previous profile data
        setShowProfileModal(true);

        try {
            if (user.role === 'TEACHER') {
                const teacherIdRes = await API.get(`/teacher/profile/teacherId-by-userId/${user.id}`);
                const teacherId = teacherIdRes.data;

                if (!teacherId) {
                    console.error("No teacherId found for user", user.id);
                    return;
                }

                const profileRes = await API.get(`/teacher/profile/${teacherId}`);
                setProfileUser(profileRes.data);
            } else if (user.role === 'PARENT') {
                const profileRes = await API.get(`/parents/profile/${user.id}`);
                setProfileUser({
                    firstName: profileRes.data.firstName,
                    lastName: profileRes.data.lastName,
                    profilePicUrl: user.profilePicUrl, // Use the profilePicUrl from the user object in conversation
                    contactNumber: profileRes.data.contactNumber,
                    address: profileRes.data.address,
                    children: profileRes.data.children || [],
                });
            } else {
                console.error("Unknown role:", user.role);
            }
        } catch (error) {
            console.error("Failed to fetch profile", error);
            // Optionally, set an error message in the modal
        }
    };

    useEffect(() => {
        async function init() {
            setLoading(true);
            const fetchedUserId = await getUserIdFromRole('parentId');
            if (!fetchedUserId) {
                console.log('No userId found, stopping loading.');
                setLoading(false);
                return;
            }

            setUserId(fetchedUserId);
            try {
                const convRes = await API.get(`/conversations/user/${fetchedUserId}`);
                setConversations(convRes.data);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoading(false);
            }
        }
        init();
    }, []);

    const loadAvailableUsers = async () => {
        try {
            const res = await API.get(`/conversations/available-users/${userId}`);
            setAvailableUsers(res.data);
            setShowUserList(true);
        } catch (error) {
            console.error("Failed to load available users:", error);
        }
    };

    if (loading) {
        return (
            <div className="loading-overlay">
                <Spinner animation="border" role="status" className="text-primary" />
                <p className="loading-text">Loading messages...</p>
            </div>
        );
    }

    if (userId === null || userId === undefined) {
        return <div className="no-user-id">No user ID found. Please log in.</div>;
    }

    // Helper function to normalize profile pic URLs
const getProfilePicUrl = (url) => {
  if (!url) return null; // no pic available
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url; // full URL already
  }
  // Add base URL if relative path
  return `https://skoolo-production.up.railway.app${url.startsWith('/') ? '' : '/'}${url}`;
};


const startChatWithUser = async (user) => {
    try {
      const res = await API.post(`/conversations?userId1=${userId}&userId2=${user.id}`);

        setSelectedConversation(res.data);
        setShowUserList(false);

        // Refresh conversation list to include the new one
        const convRes = await API.get(`/conversations/user/${userId}`);
        setConversations(convRes.data);
    } catch (error) {
        console.error("Failed to start chat:", error);
    }
};


    return (
        <Container fluid className="app-container">
            {/* Sidebar (visible on md and up) */}
            <div className="main-sidebar d-none d-md-block">
                <ParentSidebar />
            </div>

            {/* Main Content Area */}
            <div className="main-content-area">
                {/* Mobile Sidebar Toggle Button */}
                <Button
                    variant="dark"
                    className="d-md-none mobile-sidebar-toggle-btn"
                    onClick={() => setShowSidebarOffcanvas(true)}
                >
                    <FaBars className="me-2" /> Menu
                </Button>

                {/* Mobile Sidebar Offcanvas */}
                <Offcanvas show={showSidebarOffcanvas} onHide={() => setShowSidebarOffcanvas(false)} placement="start" className="mobile-sidebar-offcanvas">
                    <Offcanvas.Header closeButton className="offcanvas-header-custom">
                        <Offcanvas.Title>Navigation</Offcanvas.Title>
                    </Offcanvas.Header>
                    <Offcanvas.Body className="offcanvas-body-custom">
                        <ParentSidebar />
                    </Offcanvas.Body>
                </Offcanvas>

                {/* Main Messages Layout */}
                <Row className="h-100 g-0 flex-nowrap">
                    {/* Conversations Sidebar */}
                    <Col xs={12} md={5} lg={4} xl={3} className={`conversations-sidebar d-flex flex-column ${selectedConversation && window.innerWidth < 768 ? 'd-none' : 'd-flex'}`}>
                        <div className="sidebar-header d-flex justify-content-between align-items-center mb-4">
                            <h5 className="mb-0 text-white">Conversations</h5>
                            <Button
                                variant="primary"
                                size="sm"
                                onClick={loadAvailableUsers}
                                className="start-chat-button shadow-sm"
                            >
                                <FaPlus className="me-2" /> New Chat
                            </Button>
                        </div>
                        <ListGroup className="conversation-list flex-grow-1 custom-scroll">
                            {conversations.length === 0 ? (
                                <div className="empty-state">
                                    <FaEnvelopeOpenText size={50} className="mb-3" />
                                    <p>No conversations yet.<br />Start a new one!</p>
                                </div>
                            ) : (
                                conversations.map(c => {
                                    const otherUser = c.user1.id === userId ? c.user2 : c.user1;
                                    const isSelected = selectedConversation?.id === c.id;
                                    return (
                                        <ListGroup.Item
                                            key={c.id}
                                            action
                                            active={isSelected}
                                            onClick={() => setSelectedConversation(c)}
                                            className={`conversation-item ${isSelected ? 'selected' : ''}`}
                                        >
                                            <div className="d-flex align-items-center">
                                                <div className="user-avatar-placeholder me-3" onClick={(e) => {
                                                    e.stopPropagation(); // Prevent selecting conversation when clicking avatar
                                                    handleProfileClick(otherUser);
                                                }}>
                                                    {otherUser.profilePicUrl ? (
                                                       <img src={getProfilePicUrl(otherUser.profilePicUrl)} alt="Profile" className="profile-pic-avatar" />

                                                    ) : (
                                                        `${otherUser.firstName?.charAt(0) || ''}${otherUser.lastName?.charAt(0) || ''}`
                                                    )}
                                                </div>
                                                <div className="flex-grow-1">
                                                    <div className="user-name">
                                                        {otherUser.firstName} {otherUser.lastName}
                                                        {otherUser.classTeacher && (
                                                            <span title="Class Teacher" className="ms-2 crown-icon">
                                                                <FaCrown />
                                                            </span>
                                                        )}
                                                    </div>
                                                    <small className="last-message-preview text-muted">Click to view chat</small>
                                                </div>
                                               <span
                                                role="button"
                                                tabIndex={0}
                                                className="info-icon-btn"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleProfileClick(otherUser);
                                                }}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' || e.key === ' ') {
                                                    e.preventDefault();
                                                    handleProfileClick(otherUser);
                                                    }
                                                }}
                                                style={{ cursor: 'pointer' }}
                                                >
                                                <FaInfoCircle size={16} />
                                                </span>

                                            </div>
                                        </ListGroup.Item>
                                    );
                                })
                            )}
                        </ListGroup>
                    </Col>

                    {/* Chat Window */}
                    <Col xs={12} md={7} lg={8} xl={9} className={`chat-area d-flex flex-column ${!selectedConversation && window.innerWidth < 768 ? 'd-none' : 'd-flex'}`}>
                        {selectedConversation ? (
                            <>
                                <div className="chat-header p-3 border-bottom d-flex align-items-center">
                                    <Button variant="link" className="d-md-none me-3 back-to-conversations" onClick={() => setSelectedConversation(null)}>
                                        <FaArrowLeft size={20} />
                                    </Button>
                                    <div className="user-avatar-placeholder smaller-avatar me-3" onClick={() => {
                                        const otherUser = selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1;
                                        handleProfileClick(otherUser);
                                    }}>
                                        {(() => {
                                            const otherUser = selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1;
                                            return otherUser.profilePicUrl ? (
                                             <img src={getProfilePicUrl(otherUser.profilePicUrl)} alt="Profile" className="profile-pic-avatar" />

                                            ) : (
                                                `${otherUser.firstName?.charAt(0) || ''}${otherUser.lastName?.charAt(0) || ''}`
                                            );
                                        })()}
                                    </div>
                                    <h5 className="mb-0 text-white flex-grow-1">
                                        {selectedConversation.user1.id === userId
                                            ? `${selectedConversation.user2.firstName} ${selectedConversation.user2.lastName}`
                                            : `${selectedConversation.user1.firstName} ${selectedConversation.user1.lastName}`}
                                        {(selectedConversation.user1.id === userId ? selectedConversation.user2.classTeacher : selectedConversation.user1.classTeacher) && (
                                            <span title="Class Teacher" className="ms-2 crown-icon">
                                                <FaCrown />
                                            </span>
                                        )}
                                    </h5>
                                    <Button variant="link" className="info-icon-btn text-white" onClick={() => {
                                        const otherUser = selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1;
                                        handleProfileClick(otherUser);
                                    }}>
                                        <FaInfoCircle size={20} />
                                    </Button>
                                </div>
                                <div className="d-flex flex-column flex-grow-1">
                                    <ChatWindow
                                        conversationId={selectedConversation.id}
                                        userId={userId}
                                        otherUser={selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1}
                                        key={selectedConversation.id}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="chat-placeholder">
                                <FaEnvelopeOpenText size={100} className="mb-4 text-light" />
                                <h4 className="text-white-50">Select a conversation to start chatting</h4>
                                <p className="text-white-50">Or click "New Chat" to begin a new discussion.</p>
                            </div>
                        )}
                    </Col>
                </Row>
            </div>

            {/* New Chat Offcanvas */}
            <Offcanvas show={showUserList} onHide={() => setShowUserList(false)} placement="end" className="dark-offcanvas">
                <Offcanvas.Header closeButton className="offcanvas-header-custom">
                    <Offcanvas.Title className="text-white">Start New Chat</Offcanvas.Title>
                </Offcanvas.Header>
                <Offcanvas.Body className="offcanvas-body-custom custom-scroll">
                    {availableUsers.length === 0 ? (
                        <p className="text-muted text-center mt-3">No new users available to chat with.</p>
                    ) : (
                        <ListGroup>
                            {availableUsers.map(user => (
                                <ListGroup.Item
                                    key={user.id}
                                    action
                                    onClick={() => startChatWithUser(user)}
                                    className="available-user-item"
                                >
                                    <div className="d-flex align-items-center">
                                        <div className="user-avatar-placeholder me-3 smaller-avatar">
                                            {user.profilePicUrl ? (
                                               <img src={getProfilePicUrl(user.profilePicUrl)} alt="Profile" className="profile-pic-avatar" />
                                            ) : (
                                                `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`
                                            )}
                                        </div>
                                        <div className="flex-grow-1 new-chat-user-name">
                                            {user.firstName} {user.lastName}
                                            {user.isClassTeacher && (
                                                <span title="Class Teacher" className="ms-2 crown-icon">
                                                    <FaCrown />
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    )}
                </Offcanvas.Body>
            </Offcanvas>

            {/* Profile Modal */}
            <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered className="profile-modal">
                <Modal.Header closeButton className="profile-modal-header">
                    <Modal.Title className="profile-modal-title">
                        {profileUser ? `${profileUser.firstName} ${profileUser.lastName}'s Profile` : 'Loading...'}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="profile-modal-body custom-scroll">
                    {profileUser ? (
                        <>
                            {profileUser.profilePicUrl && (
                                <div className="profile-image-container">
                                    <img
                                        src={`https://skoolo-production.up.railway.app${profileUser.profilePicUrl}`}
                                        alt="Profile"
                                        className="profile-image"
                                    />
                                </div>
                            )}
                            <div className="info-section">
                                <p>
                                    <strong>Contact:</strong> {profileUser.contactNumber || 'N/A'}
                                </p>

                                {profileUser.subjects && profileUser.subjects.length > 0 && (
                                    <p>
                                        <strong>Subjects:</strong> {profileUser.subjects.join(', ')}
                                    </p>
                                )}

                                {profileUser.classTeacherOf && profileUser.classTeacherOf.length > 0 && (
                                    <div className="sub-info-section">
                                        <p><strong>Class Teacher of:</strong></p>
                                        <ul className="info-list">
                                            {profileUser.classTeacherOf.map((ct, idx) => (
                                                <li key={idx}>
                                                    {ct.className} - {ct.sectionName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {profileUser.children && profileUser.children.length > 0 && (
                                    <div className="sub-info-section">
                                        <p><strong>Children:</strong></p>
                                        <ul className="info-list">
                                            {profileUser.children.map((child, idx) => (
                                                <li key={idx}>
                                                    {child.firstName} {child.lastName} - {child.className} {child.sectionName}
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {profileUser.address && (
                                    <p>
                                        <strong>Address:</strong> {profileUser.address}
                                    </p>
                                )}
                            </div>

                            {profileUser.classAssignments && profileUser.classAssignments.length > 0 && (
                                <>
                                    <h6>Class Assignments</h6>
                                    <ul className="class-assignments-list info-list">
                                        {profileUser.classAssignments.map((ca, idx) => (
                                            <li key={idx}>
                                                {ca.className} - {ca.sectionName} - {ca.subjectName}
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center my-4">
                            <Spinner animation="border" role="status" className="text-primary" />
                            <p className="text-muted mt-2">Loading profile details...</p>
                        </div>
                    )}
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ParentMessagesPage;