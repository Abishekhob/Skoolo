import React from 'react';
import { Table, Form, Button } from 'react-bootstrap';

const StudentTable = ({
  students,
  editStudentId,
  editFormData,
  handleEdit,
  handleEditChange,
  handleCancel,
  handleSave,
  handleDelete // Assuming this prop exists for Delete button
}) => {
  const sortedStudents = [...students].sort((a, b) => {
    const firstNameCompare = a.firstName.localeCompare(b.firstName);
    return firstNameCompare !== 0
      ? firstNameCompare
      : a.lastName.localeCompare(b.lastName);
  });

  return (
    <Table striped bordered hover variant="dark" responsive className="student-table">
      <thead>
        <tr>{/* Ensure no whitespace/newlines between these <th> tags */}
          <th className="sticky-header-cell">#</th><th className="sticky-header-cell">First Name</th><th className="sticky-header-cell">Last Name</th><th className="sticky-header-cell">Gender</th><th className="sticky-header-cell">Date of Birth</th><th className="sticky-header-cell">Contact Number</th><th className="sticky-header-cell">Address</th><th className="sticky-header-cell">Enrollment Date</th><th className="sticky-header-cell">Parent Email</th><th className="sticky-header-cell actions-column">Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedStudents.map((student, index) => {
          const isEditing = editStudentId === student.id;
          return (
            <tr key={student.id}>{/* Ensure no whitespace/newlines between these <td> tags */}
              <td>{index + 1}</td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.firstName
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.lastName
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Select
                    size="sm"
                    name="gender"
                    value={editFormData.gender}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </Form.Select>
                ) : (
                  student.gender
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    name="dob"
                    value={editFormData.dob}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.dob
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="text"
                    name="contactNumber"
                    value={editFormData.contactNumber}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.contactNumber
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="text"
                    name="address"
                    value={editFormData.address}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.address
                )}
              </td>
              <td>
                {isEditing ? (
                  <Form.Control
                    size="sm"
                    type="date"
                    name="enrollmentDate"
                    value={editFormData.enrollmentDate}
                    onChange={handleEditChange}
                    className="form-control-table-sm"
                  />
                ) : (
                  student.enrollmentDate
                )}
              </td>
              <td>{student.parentName}</td>
              <td className="text-nowrap actions-cell">
                {isEditing ? (
                  <>
                    <Button size="sm" variant="success" className="me-1 table-action-btn" onClick={() => handleSave(student.id)}>Save</Button>
                    <Button size="sm" variant="secondary" className="table-action-btn" onClick={handleCancel}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" variant="info" className="me-1 table-action-btn" onClick={() => handleEdit(student)}>Edit</Button>
                    <Button size="sm" variant="danger" className="table-action-btn" onClick={() => handleDelete && handleDelete(student.id)}>Delete</Button>
                  </>
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </Table>
  );
};

export default StudentTable;