import React from 'react';
import { Modal, Form, Button } from 'react-bootstrap';

const AddStudentModal = ({
  show,
  onHide,
  formData,
  onChange,
  onSubmit
}) => {
  return (
    <Modal show={show} onHide={onHide} backdrop="static" centered>
      <Modal.Header closeButton className="bg-dark text-white">
        <Modal.Title>Add New Student</Modal.Title>
      </Modal.Header>
      <Modal.Body className="bg-dark text-white">
        <Form onSubmit={onSubmit}>
          <Form.Group className="mb-2">
            <Form.Label>First Name</Form.Label>
            <Form.Control name="firstName" required value={formData.firstName} onChange={onChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Last Name</Form.Label>
            <Form.Control name="lastName" required value={formData.lastName} onChange={onChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Gender</Form.Label>
            <Form.Select name="gender" required value={formData.gender} onChange={onChange}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Date of Birth</Form.Label>
            <Form.Control type="date" name="dob" required value={formData.dob} onChange={onChange} />
          </Form.Group>
          <Form.Group className="mb-2">
            <Form.Label>Contact Number</Form.Label>
            <Form.Control name="contactNumber" required value={formData.contactNumber} onChange={onChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Address</Form.Label>
            <Form.Control name="address" value={formData.address} onChange={onChange} required />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Parent Email</Form.Label>
            <Form.Control type="email" name="parentEmail" required value={formData.parentEmail} onChange={onChange} />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Enrollment Date</Form.Label>
            <Form.Control type="date" name="enrollmentDate" required value={formData.enrollmentDate} onChange={onChange} />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button variant="secondary" onClick={onHide} className="me-2">Cancel</Button>
            <Button type="submit" variant="primary">Add</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

// ✅ THIS IS THE CRUCIAL LINE
export default AddStudentModal;
