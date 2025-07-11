import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const AddTeacherModal = ({
  show,
  handleClose,
  newTeacher,
  setNewTeacher,
  addTeacher
}) => {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Add New Teacher</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              value={newTeacher.firstName}
              onChange={(e) => setNewTeacher({ ...newTeacher, firstName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              value={newTeacher.lastName}
              onChange={(e) => setNewTeacher({ ...newTeacher, lastName: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Email</Form.Label>
            <Form.Control
              value={newTeacher.email}
              onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
            />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control
              value={newTeacher.contactNumber}
              onChange={(e) => setNewTeacher({ ...newTeacher, contactNumber: e.target.value })}
            />
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={addTeacher}>
          Add
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddTeacherModal;
