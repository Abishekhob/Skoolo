import React, { useEffect, useState } from 'react';
import { Modal, Form, Button, Alert } from 'react-bootstrap';
import API from '../services/api';

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

  useEffect(() => {
    if (show && subjectId) {
      API.get(`/teacher/teachers/by-subject?subjectId=${subjectId}`)
        .then(res => {
          const data = res.data || [];
          setTeachers(data);

          // ✅ Find current teacher's name
          if (existingTeacherId) {
            const found = data.find(t => t.id === existingTeacherId);
            if (found) {
              setExistingTeacherName(found.fullName);
            } else {
              setExistingTeacherName('Unknown');
            }
          } else {
            setExistingTeacherName('');
          }
        })
        .catch(() => {
          setTeachers([]);
          setExistingTeacherName('');
        });
    }
  }, [show, subjectId, existingTeacherId]);

  const handleAssign = () => {
    if (!selectedTeacherId) {
      setStatus('Please select a teacher.');
      return;
    }

    API.post('/timetable/assign-teacher-to-subject', {
      classId,
      sectionId,
      subjectId,
      teacherId: selectedTeacherId,
    })
      .then(() => {
        setStatus('Assigned successfully!');
        onSuccess();
        handleClose();
      })
      .catch(() => {
        setStatus('Failed to assign. Try again.');
      });
  };

  return (
    <Modal show={show} onHide={handleClose} centered contentClassName="bg-dark text-white">
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Assign Teacher</Modal.Title>
      </Modal.Header>

      <Modal.Body>
       <p className="mb-1">
  <strong>Day:</strong> {day}, <strong>Period:</strong> {period}
</p>
{subjectId && (
  <p className="mb-3">
    <strong>Subject:</strong> {subjectName || '—'}
  </p>
)}


        {existingTeacherName && (
          <p className="mb-3">
            <strong>Currently Assigned:</strong> {existingTeacherName}
          </p>
        )}

        {status && (
          <Alert variant={status.includes('success') ? 'success' : 'danger'} className="mt-2">
            {status}
          </Alert>
        )}

        <Form.Group className="mb-3">
          <Form.Label>Select Teacher</Form.Label>
          <Form.Select
            className="bg-dark text-white border-secondary"
            value={selectedTeacherId}
            onChange={(e) => setSelectedTeacherId(e.target.value)}
          >
            <option value="">-- Choose a Teacher --</option>
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>
                {t.fullName}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <div className="text-end">
          <Button variant="secondary" className="me-2" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAssign}>
            Assign
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default ScheduleTeacherModal;
