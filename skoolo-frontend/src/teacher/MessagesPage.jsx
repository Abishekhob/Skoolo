import React, { useEffect, useState } from 'react';
import { Modal } from 'react-bootstrap';
import ChatWindow from './ChatWindow';
import { getUserIdFromRole } from '../utils/getUserIdFromRole';
import API from '../services/api';
import { Button, ListGroup, Offcanvas, Container, Row, Col, Spinner } from 'react-bootstrap';
import { FaPlus, FaCrown, FaEnvelopeOpenText, FaBars, FaArrowLeft } from 'react-icons/fa';
import TeacherSidebar from './TeacherSidebar';
import './style/MessagesPage.css';

const MessagesPage = () => {
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
  setProfileUser(null);
  setShowProfileModal(true);

  try {
    // Step 1: Get teacherId from userId
    const teacherIdRes = await API.get(`/teacher/profile/teacherId-by-userId/${user.id}`);
    const teacherId = teacherIdRes.data;

    if (!teacherId) {
      console.error("No teacherId found for user", user.id);
      return;
    }

    // Step 2: Get teacher profile by teacherId
    const profileRes = await API.get(`/teacher/profile/${teacherId}`);
    setProfileUser(profileRes.data);
  } catch (error) {
    console.error("Failed to fetch teacher profile", error);
  }
};





  useEffect(() => {
    async function init() {
      setLoading(true);
      const fetchedUserId = await getUserIdFromRole('teacherId');
      if (!fetchedUserId) {
        setLoading(false);
        return;
      }
      setUserId(fetchedUserId);

      try {
        const convRes = await API.get(`/conversations/user/${fetchedUserId}`);
        setConversations(convRes.data);
      } catch (error) {
        console.error("Failed to fetch conversations:", error);
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

  const isClassTeacher = (userIdToCheck) => {
   const userInAvailable = availableUsers.some(u => u.id === userIdToCheck && u.classTeacher);

    if (userInAvailable) return true;

    if (selectedConversation) {
      const otherUser = selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1;
      if (otherUser.id === userIdToCheck && otherUser.classTeacher
) return true;
    }
    return false;
  };

  const startChatWithUser = async (otherUser) => {
    try {
      const res = await API.post(`/conversations`, null, {
        params: { userId1: userId, userId2: otherUser.id }
      });

      const conversation = res.data;
      setConversations((prev) => {
        const exists = prev.find(c => c.id === conversation.id);
        return exists ? prev : [conversation, ...prev];
      });

      setSelectedConversation(conversation);
      setShowUserList(false);
    } catch (error) {
      console.error("Failed to start chat:", error);
    }
  };

  if (loading || !userId) {
    return (
      <div className="loading-overlay">
        <Spinner animation="border" role="status" className="text-primary" />
        <p className="loading-text">Loading messages...</p>
      </div>
    );
  }

  return (
   <Container fluid className="vh-100 d-flex flex-column">

      <Row className="h-100">
        {/* Sidebar */}
        <TeacherSidebar />

        {/* Main Messages Area */}
        <Col md={10} className="messages-main-content p-0">
          {/* Mobile Sidebar Toggle */}
          {!selectedConversation && (
            <Button
              variant="dark"
              className="d-md-none mobile-sidebar-toggle-btn"
              onClick={() => setShowSidebarOffcanvas(true)}
            >
              <FaBars /> Messages Menu
            </Button>
          )}

          {/* Offcanvas for Sidebar (Mobile) */}
          <Offcanvas show={showSidebarOffcanvas} onHide={() => setShowSidebarOffcanvas(false)} placement="start" className="d-md-none">
            <Offcanvas.Header closeButton>
              <Offcanvas.Title>Navigation</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body>
              <TeacherSidebar />
            </Offcanvas.Body>
          </Offcanvas>

          {/* Main Messages Layout */}
       <Row className="flex-grow-1 h-100 g-0">

            <Col xs={12} md={4} lg={3} className={`conversations-sidebar d-flex flex-column ${selectedConversation && window.innerWidth < 768 ? 'd-none' : 'd-flex'}`}>
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
                  <div className="text-center text-white-50 mt-5 empty-state-icon">
                    <FaEnvelopeOpenText size={50} className="mb-3" />
                    <p>No conversations yet.<br />Start a new one!</p>
                  </div>
                ) : (
                  conversations.map(c => {
                    const otherUser = c.user1.id === userId ? c.user2 : c.user1;
                    console.log("🧪 Raw Conversation:", JSON.stringify(c, null, 2));

                 console.log("User:", otherUser.firstName, otherUser.lastName, "isClassTeacher:", otherUser.classTeacher, "Computed:", isClassTeacher(otherUser.id));


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
      e.stopPropagation();  // prevent opening chat when clicking profile pic
      const otherUser = c.user1.id === userId ? c.user2 : c.user1;
      handleProfileClick(otherUser);
    }} style={{ cursor: 'pointer' }}>
      {otherUser.profilePicUrl ? (
        <img src={otherUser.profilePicUrl} alt="Profile" className="profile-pic-avatar" />
      ) : (
        `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}`
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
  </div>
</ListGroup.Item>

                    );
                  })
                )}
              </ListGroup>
            </Col>

            {/* Chat Window */}
          <Col xs={12} md={8} lg={9} className={`chat-area d-flex flex-column h-100 ${!selectedConversation && window.innerWidth < 768 ? 'd-none' : 'd-flex'}`}>

              {selectedConversation ? (
                <>
                  <div className="chat-header p-3 border-bottom d-flex align-items-center">
                    <Button variant="link" className="d-md-none me-3 back-to-conversations" onClick={() => setSelectedConversation(null)}>
                      <FaArrowLeft size={20} />
                    </Button>
                    <div className="user-avatar-placeholder smaller-avatar me-3">
  {(() => {
  const otherUser = selectedConversation.user1.id === userId ? selectedConversation.user2 : selectedConversation.user1;
 console.log("🟡 Chat Header →", otherUser.firstName, otherUser.lastName, " | classTeacher (data):", otherUser.classTeacher, " | Computed:", isClassTeacher(otherUser.id));

  return (
    <div className="user-avatar-placeholder smaller-avatar me-3">
      {otherUser.profilePicUrl ? (
        <img src={otherUser.profilePicUrl} alt="Profile" className="profile-pic-avatar" />
      ) : (
        `${otherUser.firstName.charAt(0)}${otherUser.lastName.charAt(0)}`
      )}
    </div>
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
                  </div>
                  <div className="d-flex flex-column flex-grow-1">
                   <ChatWindow
                    conversationId={selectedConversation.id}
                    userId={userId}
                    key={selectedConversation.id}
                  />
                  </div>
                </>
              ) : (
                <div className="chat-placeholder d-flex flex-column justify-content-center align-items-center text-muted">
                  <FaEnvelopeOpenText size={100} className="mb-4 text-light" />
                  <h4 className="text-white-50">Select a conversation to start chatting</h4>
                  <p className="text-white-50">Or click "Start New Chat" to begin a new discussion.</p>
                </div>
              )}
            </Col>
          </Row>

          {/* New Chat Offcanvas */}
        <Offcanvas show={showUserList} onHide={() => setShowUserList(false)} placement="end" className="dark-offcanvas">

            <Offcanvas.Header closeButton>
              <Offcanvas.Title className="text-white">Start New Chat</Offcanvas.Title>
            </Offcanvas.Header>
            <Offcanvas.Body className="offcanvas-body-custom custom-scroll">
              {availableUsers.length === 0 ? (
                <p className="text-muted text-center mt-3">No new users available to chat with.</p>
              ) : (
                <ListGroup>
                {availableUsers.length > 0 && (() => {
  console.log("🟢 New Chat Available Users:");
  availableUsers.forEach(user => {
console.log("→", user.firstName, user.lastName, "| classTeacher:", user.classTeacher);

  });
  return null;
})()}

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
    <img src={user.profilePicUrl} alt="Profile" className="profile-pic-avatar" />
  ) : (
    `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
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
        </Col>
      </Row>

   <Modal show={showProfileModal} onHide={() => setShowProfileModal(false)} centered>
      <Modal.Header closeButton className="profile-modal-header">
        <Modal.Title className="profile-modal-title">
          {profileUser ? `${profileUser.firstName} ${profileUser.lastName}'s Profile` : 'Loading...'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="profile-modal-body">
        {profileUser ? (
          <>
            {profileUser.profilePicUrl && (
              <img
                src={`http://localhost:8081${profileUser.profilePicUrl}`}
                alt="Profile"
                className="profile-image"
              />
            )}
          <div className="info-section">
  <p>
    <strong>Contact:</strong> {profileUser.contactNumber}
  </p>
  <p>
    <strong>Subjects:</strong> {profileUser.subjects.join(', ')}
  </p>

{profileUser.classTeacherOf && profileUser.classTeacherOf.length > 0 && (
  <div className="info-section">
    <p><strong>Class Teacher of:</strong></p>
    <ul>
      {profileUser.classTeacherOf.map((ct, idx) => (
        <li key={idx}>
          {ct.className} - {ct.sectionName}
        </li>
      ))}
    </ul>
  </div>
)}

</div>


            <h6>Class Assignments</h6>
            <ul className="class-assignments-list">
              {profileUser.classAssignments.length > 0 ? (
                profileUser.classAssignments.map((ca, idx) => (
                  <li key={idx} className="assignment-item">
                    {ca.className} - {ca.sectionName} - {ca.subjectName}
                  </li>
                ))
              ) : (
                <li className="assignment-item empty-state">
                  No class assignments found.
                </li>
              )}
            </ul>
          </>
        ) : (
          <p>Loading profile...</p>
        )}
      </Modal.Body>
    </Modal>

    </Container>
  );
};

export default MessagesPage;
