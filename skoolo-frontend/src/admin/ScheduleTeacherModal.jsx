import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { FaChalkboardTeacher } from 'react-icons/fa'; // Icon for the modal title
import styled from 'styled-components';
import API from '../services/api'; // Assuming your API service path is correct

// Styled components for a polished look
const StyledModalHeader = styled(Modal.Header)`
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem 2rem;
  .modal-title {
    color: #e0e0e0;
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 1.5rem;
    font-weight: 600;
  }
  .btn-close {
    filter: invert(1) grayscale(100%) brightness(200%); /* Makes close button white */
    &:hover {
      opacity: 0.8;
    }
  }
`;

const StyledModalBody = styled(Modal.Body)`
  padding: 2rem;
  background: rgba(30, 30, 45, 0.8); /* Slightly transparent dark background */
  backdrop-filter: blur(8px); /* Glassmorphism effect */
  border-radius: 0 0 8px 8px; /* Match modal border radius */
`;

const InfoText = styled.p`
  color: #c0c0c0;
  margin-bottom: 0.75rem;
  font-size: 0.95rem;
  strong {
    color: #e0e0e0;
    font-weight: 500;
  }
`;

const CurrentTeacherInfo = styled(InfoText)`
  background-color: rgba(60, 60, 80, 0.5);
  padding: 0.7rem 1.2rem;
  border-radius: 6px;
  margin-bottom: 1.5rem;
  border-left: 4px solid #6c757d; /* Subtle highlight */
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  strong {
    color: #8be9fd; /* A light blue for emphasis */
  }
`;

const StyledFormSelect = styled(Form.Select)`
  background-color: rgba(40, 40, 55, 0.7) !important;
  color: #e0e0e0 !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: none !important;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  transition: border-color 0.2s ease-in-out, box-shadow 0.2s ease-in-out;

  &:focus {
    border-color: #007bff !important; /* Bootstrap primary blue */
    box-shadow: 0 0 0 0.25rem rgba(0, 123, 255, 0.25) !important;
  }

  option {
    background-color: #282a36; /* Darker background for options */
    color: #e0e0e0;
  }
`;

const StyledButton = styled(Button)`
  padding: 0.65rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  &.btn-success {
    background-color: #50fa7b; /* Drácula theme green */
    border-color: #50fa7b;
    color: #282a36; /* Dark text for contrast */

    &:hover {
      background-color: #69ff94;
      border-color: #69ff94;
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(80, 250, 123, 0.2);
    }
    &:active {
      transform: translateY(0);
      box-shadow: none;
    }
  }

  &.btn-secondary {
    background-color: rgba(90, 90, 110, 0.7);
    border-color: rgba(90, 90, 110, 0.7);
    color: #e0e0e0;

    &:hover {
      background-color: rgba(110, 110, 130, 0.8);
      border-color: rgba(110, 110, 130, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(90, 90, 110, 0.2);
    }
    &:active {
      transform: translateY(0);
      box-shadow: none;
    }
  }
`;

const StyledAlert = styled(Alert)`
  margin-top: 1.5rem;
  padding: 0.85rem 1.25rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 500;

  &.alert-success {
    background-color: #d4edda;
    border-color: #c3e6cb;
    color: #155724;
  }
  &.alert-danger {
    background-color: #f8d7da;
    border-color: #f5c6cb;
    color: #721c24;
  }
`;

const ScheduleTeacherModal = ({
  show,
  handleClose,
  classId,
  sectionId,
  day,
  period,
  existingTeacherId,
  subjectId,
  subjectName,
  onSuccess,
}) => {
  const [teachers, setTeachers] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState(existingTeacherId || '');
  const [status, setStatus] = useState('');
  const [existingTeacherName, setExistingTeacherName] = useState('');
  const [isLoading, setIsLoading] = useState(false); // New loading state

  useEffect(() => {
    if (show && subjectId) {
      setIsLoading(true); // Set loading true when fetching
      API.get(`/teacher/teachers/by-subject?subjectId=${subjectId}`)
        .then(res => {
          const data = res.data || [];
          setTeachers(data);

          if (existingTeacherId) {
            const found = data.find(t => t.id === existingTeacherId);
            setExistingTeacherName(found ? found.fullName : 'Unknown');
          } else {
            setExistingTeacherName('');
          }
          setStatus(''); // Clear previous status on re-open
        })
        .catch(error => {
          console.error("Failed to fetch teachers:", error);
          setTeachers([]);
          setExistingTeacherName('');
          setStatus('Failed to load teachers. Please try again.');
        })
        .finally(() => {
          setIsLoading(false); // Always set loading false
        });
    }
  }, [show, subjectId, existingTeacherId]);

  const handleAssign = () => {
    if (!selectedTeacherId) {
      setStatus('Please select a teacher.');
      return;
    }

    setStatus('Assigning...'); // Provide immediate feedback
    API.post('/timetable/assign-teacher-to-subject', {
      classId,
      sectionId,
      subjectId,
      teacherId: selectedTeacherId,
    })
      .then(() => {
        setStatus('Teacher assigned successfully!');
        onSuccess();
        setTimeout(() => handleClose(), 1500); // Close after a short delay to show success
      })
      .catch(() => {
        setStatus('Failed to assign teacher. Please check the network and try again.');
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered dialogClassName="modal-90w"> {/* Use dialogClassName for modal sizing */}
      <StyledModalHeader closeButton>
        <Modal.Title>
          <FaChalkboardTeacher /> Assign Teacher
        </Modal.Title>
      </StyledModalHeader>

      <StyledModalBody>
        <InfoText>
          <strong>Day:</strong> {day}, <strong>Period:</strong> {period}
        </InfoText>
        {subjectId && (
          <InfoText>
            <strong>Subject:</strong> {subjectName || '—'}
          </InfoText>
        )}

        {existingTeacherName && (
          <CurrentTeacherInfo>
            <strong>Currently Assigned:</strong> {existingTeacherName}
          </CurrentTeacherInfo>
        )}

        <Form.Group className="mb-4">
          <Form.Label className="text-white mb-2">Select Teacher</Form.Label>
          {isLoading ? (
            <div className="text-center py-3">
              <Spinner animation="border" size="sm" variant="info" />
              <span className="ms-2 text-info">Loading teachers...</span>
            </div>
          ) : (
            <StyledFormSelect
              value={selectedTeacherId}
              onChange={(e) => setSelectedTeacherId(e.target.value)}
              disabled={teachers.length === 0} // Disable if no teachers are available
            >
              <option value="">
                {teachers.length === 0 ? 'No teachers found for this subject' : '-- Choose a Teacher --'}
              </option>
              {teachers.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.fullName}
                </option>
              ))}
            </StyledFormSelect>
          )}
        </Form.Group>

        {status && (
          <StyledAlert variant={status.includes('success') ? 'success' : (status.includes('Failed') || status.includes('Please select')) ? 'danger' : 'info'} role="alert" aria-live="polite">
            {status}
          </StyledAlert>
        )}

        <div className="text-end pt-3">
          <StyledButton variant="secondary" className="me-3" onClick={handleClose}>
            Cancel
          </StyledButton>
          <StyledButton variant="success" onClick={handleAssign} disabled={!selectedTeacherId || isLoading}>
            Assign
          </StyledButton>
        </div>
      </StyledModalBody>
    </Modal>
  );
};

export default ScheduleTeacherModal;