import React, { useEffect, useState } from 'react';
import { Modal, Form, Row, Col, Button, Dropdown, Alert } from 'react-bootstrap';
import API from '../services/api';

const AssignTeacherModal = ({
  show,
  handleClose,
  teacher,
  allSubjects,
  teacherSubjects,
  setTeacherSubjects,
  classes,
  sections,
  selectedClass,
  setSelectedClass,
  selectedSection,
  setSelectedSection,
  handleSaveSubjects,
}) => {
  const [currentClassTeacher, setCurrentClassTeacher] = useState(null);
  const [teacherAssignments, setTeacherAssignments] = useState([]);
  const [status, setStatus] = useState('');

  useEffect(() => {
    if (selectedClass && selectedSection) {
      API.get('/admin/teachers/class-teacher', {
        params: { classId: selectedClass, sectionId: selectedSection },
      })
        .then((res) => setCurrentClassTeacher(res.data))
        .catch(() => setCurrentClassTeacher(null));
    } else {
      setCurrentClassTeacher(null);
    }
  }, [selectedClass, selectedSection]);

  useEffect(() => {
    if (show && teacher?.id) {
      API.get(`/admin/teachers/${teacher.id}/class-teacher-of`)
        .then((res) => {
          if (Array.isArray(res.data)) setTeacherAssignments(res.data);
          else setTeacherAssignments([]);
        })
        .catch(() => setTeacherAssignments([]));
    }
  }, [show, teacher?.id]);

  const handleMakeClassTeacher = () => {
  API.post(
    `/admin/teachers/${teacher.id}/assign-class-teacher?sectionId=${selectedSection}`
  )
    .then(() => {
      setStatus('Assigned successfully!');
      setCurrentClassTeacher(teacher);
      return API.get(`/admin/teachers/${teacher.id}/class-teacher-of`);
    })
    .then((res) => {
      if (Array.isArray(res.data)) setTeacherAssignments(res.data);
    })
    .catch(() => setStatus('Failed to assign. Try again.'));
};

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      contentClassName="bg-dark text-white"
    >
      <Modal.Header closeButton closeVariant="white">
        <Modal.Title>Assign to {teacher?.fullName}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Class Teacher Assignments */}
       {teacher && teacherAssignments.length > 0 && (
  <Alert variant="info">
    <strong>{teacher.fullName}</strong> is currently class teacher for:

            <div className="mt-2 d-flex flex-wrap gap-2">
              {teacherAssignments.map((entry, idx) => (
                <span key={idx} className="badge bg-info text-dark px-3 py-2">
                  {entry}
                </span>
              ))}
            </div>
          </Alert>
        )}

        {/* Subjects Section */}
        <h6 className="mt-3">Subjects</h6>
        <div className="d-flex flex-wrap gap-2 mb-2">
        {teacherSubjects.map((subj, idx) => {
  const name = subj.name || subj.subjectName || subj;
  return (
    <span
      key={subj.id || name || idx}
      className="badge bg-primary d-flex align-items-center gap-2 px-3 py-2"
    >
      {name}
      <button
        type="button"
        className="btn-close btn-close-white btn-sm"
        aria-label="Remove"
        onClick={() =>
          setTeacherSubjects((prev) =>
            prev.filter((s) =>
              (s.name || s.subjectName || s) !== name
            )
          )
        }
      />
    </span>
  );
})}

        </div>

        <div className="d-flex gap-2 mb-3">
          <Dropdown>
            <Dropdown.Toggle variant="outline-light" id="subject-dropdown">
              Add More Subjects
            </Dropdown.Toggle>
           <Dropdown.Menu
  className="bg-dark text-white border border-secondary"
  style={{
    width: '300px',
    maxHeight: '300px',
    overflowY: 'auto',
    padding: '10px',
  }}
>
  {allSubjects.map((subj) => {
 const name = subj.name || subj.subjectName || subj;

    return (
      <Form.Check
        key={subj.id || name}
        type="checkbox"
        label={name}
        value={name}
        checked={teacherSubjects.includes(name)}
        onChange={(e) => {
          const val = e.target.value;
          setTeacherSubjects((prev) =>
            e.target.checked ? [...prev, val] : prev.filter((s) => s !== val)
          );
        }}
        className="mb-2 text-white"
      />
    );
  })}
</Dropdown.Menu>

          </Dropdown>

          <Button
            variant="outline-light"
            onClick={handleSaveSubjects}
            disabled={teacherSubjects.length === 0}
          >
            Save Subjects
          </Button>
        </div>

        <hr className="border-secondary" />

        {/* Class & Section Selection */}
        <h6 className="mt-3">Assign to Class & Section</h6>
        <Row className="mb-3">
          <Col>
            <Form.Label className="text-white">Class</Form.Label>
            <Form.Select
              className="bg-dark text-white border-secondary"
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
            >
              <option value="">-- Select --</option>
              {classes.map((cls) => (
                <option key={cls.id} value={cls.id}>
                  {cls.className}
                </option>
              ))}
            </Form.Select>
          </Col>

          <Col>
            <Form.Label className="text-white">Section</Form.Label>
            <Form.Select
              className="bg-dark text-white border-secondary"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              <option value="">-- Select --</option>
              {sections.map((sec) => (
                <option key={sec.id} value={sec.id}>
                  {sec.name}
                </option>
              ))}
            </Form.Select>
          </Col>
        </Row>

        {/* Current Class Teacher Info */}
        {currentClassTeacher && (
          <Alert variant="info" className="mt-2">
            Current Class Teacher:{' '}
            <strong>
              {typeof currentClassTeacher === 'object'
                ? currentClassTeacher.fullName
                : currentClassTeacher}
            </strong>
          </Alert>
        )}

        {/* Status */}
        {status && (
          <Alert
            variant={status.includes('success') ? 'success' : 'danger'}
            className="mt-2"
          >
            {status}
          </Alert>
        )}

        {/* Submit */}
        <Button
          className="w-100 mt-3"
          variant="success"
          onClick={handleMakeClassTeacher}
          disabled={!selectedClass || !selectedSection}
        >
          Make Class Teacher of selected class & section
        </Button>
      </Modal.Body>
    </Modal>
  );
};

export default AssignTeacherModal;
