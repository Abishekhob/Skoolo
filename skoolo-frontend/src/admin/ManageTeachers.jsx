import React, { useEffect, useState } from 'react';
import {
  Container, Table, Button, Modal, Form, Row, Col, Dropdown, Card, InputGroup
} from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaPlus, FaUpload, FaUserPlus, FaFileExcel, FaUsersCog, FaInfoCircle } from 'react-icons/fa'; // Import icons
import API from '../services/api';
import AssignTeacherModal from './AssignTeacherModal'; // Assuming this is already styled well
import AdminSidebar from './AdminSidebar'; // Assuming this is already styled well
import AddTeacherModal from './AddTeacherModal'; // Assuming this is already styled well
import './style/ManageTeachers.css'; // Dedicated CSS for this component

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [allSubjects, setAllSubjects] = useState([]);
  const [teacherSubjects, setTeacherSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [timetable, setTimetable] = useState([]);

  const [editRowId, setEditRowId] = useState(null);
  const [editedTeacher, setEditedTeacher] = useState({});

  const [showAddModal, setShowAddModal] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    firstName: '', lastName: '', email: '', contactNumber: ''
  });
  const [uploadFileData, setUploadFileData] = useState(null);

  // Load all data on mount
  useEffect(() => {
    fetchTeachers();
    API.get('/classes').then(res => setClasses(res.data)).catch(console.error);
    API.get('/subjects').then(res => setAllSubjects(res.data)).catch(console.error);
  }, []);

  const fetchTeachers = () => {
    API.get('/teacher').then(res => setTeachers(res.data)).catch(console.error);
  }

  useEffect(() => {
    if (!selectedClass) {
      setSections([]);
      return;
    }
    API.get(`/classes/${selectedClass}/sections`)
      .then(res => {
        setSections(res.data.sections || []);
        setSelectedSection("");
      })
      .catch(console.error);
  }, [selectedClass]);

  const openAssignModal = (teacher) => {
    setSelectedTeacher(teacher);
    setShowAssignModal(true);
    setSelectedClass("");
    setSelectedSection("");
    setTimetable([]);
    API.get(`/admin/teachers/${teacher.id}/subjects`)
      .then(res => setTeacherSubjects(res.data))
      .catch(console.error);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedTeacher(null);
    setTeacherSubjects([]);
  };

  const handleSaveSubjects = () => {
    if (!selectedTeacher || teacherSubjects.length === 0) return;

    const selectedIds = teacherSubjects.map((subjName) => {
      const found = allSubjects.find(
        (subj) => subj.name === subjName || subj.subjectName === subjName
      );
      return found?.id;
    }).filter(Boolean); // removes undefined values

    API.put(`/admin/assign-subjects/${selectedTeacher.id}`, selectedIds)
      .then(() => alert("Subjects assigned successfully!"))
      .catch(console.error);
  };

  const fetchTimetable = () => {
    if (!selectedClass || !selectedSection) return;
    API.get(`/timetable/${selectedClass}/${selectedSection}`)
      .then(res => setTimetable(res.data))
      .catch(console.error);
  };

  const handleCellClick = (day, period) => {
    const subject = prompt("Enter subject to assign:");
    if (!subject || !teacherSubjects.includes(subject)) {
      alert("Invalid subject");
      return;
    }
    API.post('/timetable/assign', {
      teacherId: selectedTeacher.id,
      class: selectedClass,
      section: selectedSection,
      day,
      period,
      subject,
    }).then(fetchTimetable);
  };

  const handleMakeClassTeacher = () => {
    if (!selectedClass || !selectedSection) {
      alert("Select class and section");
      return;
    }
    API.post('/class-teacher', {
      teacherId: selectedTeacher.id,
      class: selectedClass,
      section: selectedSection,
    }).then(() => alert("Assigned as class teacher!"));
  };

  const addTeacher = () => {
    console.log("Sending new teacher data:", newTeacher);
    API.post('/admin/teachers/add-teacher', newTeacher, {
      headers: { 'Content-Type': 'application/json' },
    })
      .then(() => {
        alert("Teacher added successfully!");
        setShowAddModal(false);
        setNewTeacher({ firstName: '', lastName: '', email: '', contactNumber: '' });
        fetchTeachers(); // Refresh teacher list
      })
      .catch(err => {
        const errorMsg = err.response?.data || err.message || "Error adding teacher";
        alert(errorMsg);
        console.error("Add teacher error:", err);
      });
  };

  const handleFileUpload = (e) => {
    setUploadFileData(e.target.files[0]);
  };

  const uploadFile = () => {
    if (!uploadFileData) return alert("Please select a file to upload.");
    const formData = new FormData();
    formData.append("file", uploadFileData);

    API.post('/admin/teachers/upload', formData)
      .then(() => {
        alert("Teachers uploaded successfully!");
        setUploadFileData(null);
        fetchTeachers(); // Refresh teacher list
      })
      .catch(err => {
        const errorMsg = err.response?.data || err.message || "Upload failed";
        alert(errorMsg);
        console.error("Upload error:", err);
      });
  };

  const handleEditClick = (teacher) => {
    setEditRowId(teacher.id);
    setEditedTeacher({
      firstName: teacher.firstName || '',
      lastName: teacher.lastName || '',
      email: teacher.email || '',
      contactNumber: teacher.contactNumber || '',
    });
  };

  const handleSaveClick = (id) => {
    const updatedData = {
      firstName: editedTeacher.firstName,
      lastName: editedTeacher.lastName,
      email: editedTeacher.email,
      contactNumber: editedTeacher.contactNumber,
    };

    API.put(`/admin/teachers/${id}`, updatedData)
      .then(() => {
        alert("Teacher updated successfully!");
        setEditRowId(null);
        setEditedTeacher({});
        fetchTeachers(); // Refresh teacher list
      })
      .catch(err => {
        alert("Error updating teacher");
        console.error(err);
      });
  };

  const handleCancelClick = () => {
    setEditRowId(null);
    setEditedTeacher({});
  };

  const handleInputChange = (field, value) => {
    setEditedTeacher(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Row className="g-0 admin-layout">
      <AdminSidebar />
      <Col md={10} className="main-content-area">
        <Container fluid className="p-4">
          <h3 className="section-title mb-4">
            <FaUsersCog className="me-2 icon-lg" />
            Manage Teachers
          </h3>

          <div className="action-panel mb-4">
            <Card className="action-card">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                  <Button variant="primary" onClick={() => setShowAddModal(true)} className="add-teacher-btn mb-2 mb-md-0">
                    <FaUserPlus className="me-2" /> Add New Teacher
                  </Button>

                  <InputGroup className="upload-input-group">
                    <Form.Control
                      type="file"
                      onChange={handleFileUpload}
                      className="upload-file-input"
                      accept=".csv, .xlsx, .xls"
                    />
                    <Button variant="secondary" onClick={uploadFile} className="upload-btn">
                      <FaUpload className="me-2" /> Upload Teachers
                    </Button>
                  </InputGroup>
                </div>
                <small className="text-muted d-block text-center text-md-end">
                  <FaInfoCircle className="me-1" /> Accepted formats: .csv, .xlsx, .xls
                </small>
              </Card.Body>
            </Card>
          </div>

          {/* Desktop Table View */}
          <div className="table-responsive d-none d-lg-block data-table-container">
            <Table striped bordered hover responsive variant="dark" className="teachers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Contact Number</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher, i) => {
                  const isEditing = editRowId === teacher.id;
                  return (
                    <tr key={teacher.id}>
                      <td>{i + 1}</td>
                      <td>
                        {isEditing ? (
                          <>
                            <Form.Control
                              type="text"
                              placeholder="First Name"
                              value={editedTeacher.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="mb-1 edit-input"
                            />
                            <Form.Control
                              type="text"
                              placeholder="Last Name"
                              value={editedTeacher.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="edit-input"
                            />
                          </>
                        ) : (
                          <span className="teacher-name-display">{teacher.fullName}</span>
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control
                            type="email"
                            value={editedTeacher.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          teacher.email
                        )}
                      </td>
                      <td>
                        {isEditing ? (
                          <Form.Control
                            type="text"
                            value={editedTeacher.contactNumber}
                            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                            className="edit-input"
                          />
                        ) : (
                          teacher.contactNumber
                        )}
                      </td>
                      <td className="actions-column">
                        {isEditing ? (
                          <div className="d-flex flex-column flex-sm-row">
                            <Button
                              size="sm"
                              variant="success"
                              onClick={() => handleSaveClick(teacher.id)}
                              className="me-2 mb-2 mb-sm-0 save-btn"
                            >
                              <FaSave /> Save
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={handleCancelClick}
                              className="cancel-btn"
                            >
                              <FaTimes /> Cancel
                            </Button>
                          </div>
                        ) : (
                          <Dropdown className="action-dropdown">
                            <Dropdown.Toggle variant="info" id={`dropdown-actions-${teacher.id}`} size="sm">
                              Actions
                            </Dropdown.Toggle>
                            <Dropdown.Menu variant="dark">
                              <Dropdown.Item onClick={() => openAssignModal(teacher)}>
                                <FaUsersCog className="me-2" /> Assign Subjects/Class
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => handleEditClick(teacher)}>
                                <FaEdit className="me-2" /> Edit Details
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>

          {/* Mobile Card View */}
          <div className="d-lg-none mobile-cards-container">
            {teachers.map((teacher, i) => {
              const isEditing = editRowId === teacher.id;
              return (
                <Card key={teacher.id} className="teacher-card mb-3">
                  <Card.Body>
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <Card.Title className="teacher-card-title">
                        {isEditing ? (
                          <>
                            <Form.Control
                              type="text"
                              placeholder="First Name"
                              value={editedTeacher.firstName}
                              onChange={(e) => handleInputChange("firstName", e.target.value)}
                              className="mb-1 edit-input"
                            />
                            <Form.Control
                              type="text"
                              placeholder="Last Name"
                              value={editedTeacher.lastName}
                              onChange={(e) => handleInputChange("lastName", e.target.value)}
                              className="edit-input"
                            />
                          </>
                        ) : (
                          teacher.fullName
                        )}
                      </Card.Title>
                      <Dropdown className="action-dropdown">
                        <Dropdown.Toggle variant="info" id={`dropdown-actions-mobile-${teacher.id}`} size="sm">
                          Actions
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" align="end">
                          <Dropdown.Item onClick={() => openAssignModal(teacher)}>
                            <FaUsersCog className="me-2" /> Assign Subjects/Class
                          </Dropdown.Item>
                          <Dropdown.Item onClick={() => handleEditClick(teacher)}>
                            <FaEdit className="me-2" /> Edit Details
                          </Dropdown.Item>
                        </Dropdown.Menu>
                      </Dropdown>
                    </div>

                    <Card.Text className="teacher-info">
                      <strong className="info-label">Email:</strong>{' '}
                      {isEditing ? (
                        <Form.Control
                          type="email"
                          value={editedTeacher.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        teacher.email
                      )}
                    </Card.Text>
                    <Card.Text className="teacher-info">
                      <strong className="info-label">Contact:</strong>{' '}
                      {isEditing ? (
                        <Form.Control
                          type="text"
                          value={editedTeacher.contactNumber}
                          onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                          className="edit-input"
                        />
                      ) : (
                        teacher.contactNumber
                      )}
                    </Card.Text>

                    {isEditing && (
                      <div className="d-flex justify-content-end mt-3 button-group-mobile">
                        <Button
                          size="sm"
                          variant="success"
                          onClick={() => handleSaveClick(teacher.id)}
                          className="me-2 save-btn"
                        >
                          <FaSave /> Save
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={handleCancelClick}
                          className="cancel-btn"
                        >
                          <FaTimes /> Cancel
                        </Button>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          <AssignTeacherModal
            show={showAssignModal}
            handleClose={closeAssignModal}
            teacher={selectedTeacher}
            allSubjects={allSubjects}
            teacherSubjects={teacherSubjects}
            setTeacherSubjects={setTeacherSubjects}
            classes={classes}
            sections={sections}
            selectedClass={selectedClass}
            setSelectedClass={setSelectedClass}
            selectedSection={selectedSection}
            fetchTimetable={fetchTimetable}
            timetable={timetable}
            handleCellClick={handleCellClick}
            handleSaveSubjects={handleSaveSubjects}
            handleMakeClassTeacher={handleMakeClassTeacher}
          />

          <AddTeacherModal
            show={showAddModal}
            handleClose={() => setShowAddModal(false)}
            newTeacher={newTeacher}
            setNewTeacher={setNewTeacher}
            addTeacher={addTeacher}
          />
        </Container>
      </Col>
    </Row>
  );
};

export default ManageTeachers;