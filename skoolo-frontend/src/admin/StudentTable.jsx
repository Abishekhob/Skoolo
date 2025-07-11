import React from 'react';
import { Table, Form, Button } from 'react-bootstrap';

const StudentTable = ({
  students,
  editStudentId,
  editFormData,
  handleEdit,
  handleEditChange,
  handleCancel,
  handleSave
}) => {
  const sortedStudents = [...students].sort((a, b) => {
    const firstNameCompare = a.firstName.localeCompare(b.firstName);
    return firstNameCompare !== 0
      ? firstNameCompare
      : a.lastName.localeCompare(b.lastName);
  });

  return (
    <Table striped bordered hover variant="dark" responsive>
      <thead>
        <tr>
          <th>#</th><th>First Name</th><th>Last Name</th><th>Gender</th>
          <th>Date of Birth</th><th>Contact Number</th><th>Address</th>
          <th>Enrollment Date</th><th>Parent</th><th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {sortedStudents.map((student, index) => {
          const isEditing = editStudentId === student.id;
          return (
            <tr key={student.id}>
              <td>{index + 1}</td>
              {['firstName', 'lastName', 'gender', 'dob', 'contactNumber', 'address', 'enrollmentDate'].map((field) => (
                <td key={field}>
                  {isEditing ? (
                    field === 'gender' ? (
                      <Form.Select
                        size="sm"
                        name={field}
                        value={editFormData[field]}
                        onChange={handleEditChange}
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </Form.Select>
                    ) : (
                      <Form.Control
                        size="sm"
                        type={['dob', 'enrollmentDate'].includes(field) ? 'date' : 'text'}
                        name={field}
                        value={editFormData[field]}
                        onChange={handleEditChange}
                      />
                    )
                  ) : (
                    student[field]
                  )}
                </td>
              ))}
              <td>{student.parentName}</td>
              <td>
                {isEditing ? (
                  <>
                    <Button size="sm" className="me-2" variant="success" onClick={() => handleSave(student.id)}>Save</Button>
                    <Button size="sm" variant="secondary" onClick={handleCancel}>Cancel</Button>
                  </>
                ) : (
                  <>
                    <Button size="sm" className="me-2" variant="info" onClick={() => handleEdit(student)}>Edit</Button>
                    <Button size="sm" variant="danger">Delete</Button>
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
