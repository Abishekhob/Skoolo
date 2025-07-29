import React, { useEffect, useState } from 'react';
import {
  Container, Table, Button, Modal, Form, Row, Col, Dropdown, Card, InputGroup
} from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaPlus, FaUpload, FaUserPlus, FaFileExcel, FaUsersCog, FaInfoCircle } from 'react-icons/fa'; // Import icons
import API from '../services/api'; // Assuming this is your API service
import AssignTeacherModal from './AssignTeacherModal'; // Assuming this is already styled well
import AdminSidebar from './AdminSidebar'; // Assuming this is already styled well
import AddTeacherModal from './AddTeacherModal'; // Assuming this is already styled well
import styled from 'styled-components';

// --- Styled Components ---

const DashboardWrapper = styled.div`
  display: flex;
  min-height: 100vh; // Ensure it takes full viewport height
  background: linear-gradient(135deg, #f0f2f5 0%, #e0e5ec 100%); // Subtle gradient background

  .admin-sidebar {
    position: sticky; // Make sidebar sticky
    top: 0;
    height: 100vh;
    overflow-y: auto; // Allow sidebar to scroll if content is long
    flex-shrink: 0;
  }
`;

const MainContentArea = styled(Col)`
  flex-grow: 1;
  padding: 2rem;
  overflow-y: auto; // Allow main content to scroll
  max-height: 100vh; // Constrain height to enable scrolling within this area
`;

const SectionTitle = styled.h3`
  font-size: 2.2rem;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 2.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  letter-spacing: -0.02em;
  .icon-lg {
    font-size: 2.5rem;
    color: #007bff; // Primary color for the icon
  }

  @media (max-width: 768px) {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    .icon-lg {
      font-size: 2rem;
    }
  }
`;

const ActionPanel = styled.div`
  margin-bottom: 3rem;
  .action-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
    background: #ffffff;
    padding: 1.5rem 2rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 15px 40px rgba(0, 0, 0, 0.12);
    }

    .add-teacher-btn {
      background-color: #007bff;
      border-color: #007bff;
      padding: 0.75rem 1.5rem;
      font-size: 1.1rem;
      border-radius: 10px;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      gap: 0.5rem;

      &:hover {
        background-color: #0056b3;
        border-color: #004085;
        transform: translateY(-2px);
      }
    }

    .upload-input-group {
      .upload-file-input {
        border-top-left-radius: 10px;
        border-bottom-left-radius: 10px;
        border-color: #ced4da;
        &:focus {
          box-shadow: none;
          border-color: #80bdff;
        }
      }
      .upload-btn {
        background-color: #6c757d;
        border-color: #6c757d;
        border-top-right-radius: 10px;
        border-bottom-right-radius: 10px;
        padding: 0.75rem 1.5rem;
        font-size: 1.1rem;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transition: all 0.3s ease;

        &:hover {
          background-color: #5a6268;
          border-color: #545b62;
          transform: translateY(-2px);
        }
      }
      @media (max-width: 768px) {
        flex-direction: column;
        .upload-file-input, .upload-btn {
          width: 100%;
          border-radius: 10px !important; // Override for mobile
          margin-bottom: 0.5rem; // Add space between file input and button
        }
      }
    }

    .text-muted {
      font-size: 0.9rem;
      color: #7f8c8d !important;
      .me-1 {
        color: #95a5a6;
      }
    }

    @media (max-width: 768px) {
      padding: 1rem;
      .d-flex.flex-column.flex-md-row {
        flex-direction: column;
        align-items: stretch !important;
      }
      .add-teacher-btn, .upload-input-group {
        width: 100%;
        margin-bottom: 1rem !important;
      }
      .upload-input-group > * {
        width: 100%;
      }
    }
  }
`;

const DataTableContainer = styled.div`
  background: #ffffff;
  border-radius: 15px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
  overflow-x: auto; // Ensure table is scrollable horizontally on smaller screens
  padding: 1.5rem;

  .teachers-table {
    margin-bottom: 0; // Remove default table margin
    border-collapse: separate;
    border-spacing: 0;
    width: 100%;

    thead {
      background-color: #343a40;
      color: #ffffff;
      th {
        padding: 1rem 1.25rem;
        border-bottom: 2px solid #495057;
        font-weight: 600;
        font-size: 1rem;
        position: sticky; // Make header sticky
        top: 0;
        background-color: #343a40; // Ensure background for sticky header
        z-index: 10; // Ensure header is above scrolling content
      }
      tr:first-child th:first-child {
        border-top-left-radius: 12px;
      }
      tr:first-child th:last-child {
        border-top-right-radius: 12px;
      }
    }

    tbody {
      tr {
        transition: background-color 0.2s ease-in-out, transform 0.2s ease-in-out;
        &:hover {
          background-color: #f8f9fa;
          transform: scale(1.005);
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
      }
      td {
        padding: 1rem 1.25rem;
        vertical-align: middle;
        border-top: 1px solid #dee2e6;
        color: #34495e;

        .teacher-name-display {
          font-weight: 500;
          color: #2c3e50;
        }

        .edit-input {
          border-radius: 8px;
          border-color: #b0c4de;
          &:focus {
            border-color: #007bff;
            box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
          }
        }
      }
    }

    .actions-column {
      width: 180px; // Fixed width for actions column
      white-space: nowrap; // Prevent actions from wrapping
    }

    .save-btn, .cancel-btn {
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.2s ease;
    }

    .save-btn {
      background-color: #28a745;
      border-color: #28a745;
      &:hover {
        background-color: #218838;
        border-color: #1e7e34;
      }
    }

    .cancel-btn {
      background-color: #6c757d;
      border-color: #6c757d;
      &:hover {
        background-color: #5a6268;
        border-color: #545b62;
      }
    }

    .action-dropdown .dropdown-toggle {
      background-color: #17a2b8;
      border-color: #17a2b8;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.2s ease;

      &:hover {
        background-color: #138496;
        border-color: #117a8b;
      }
    }
    .action-dropdown .dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      background-color: #343a40; // Dark background for dropdown menu
      .dropdown-item {
        color: #ffffff;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1rem;
        &:hover {
          background-color: #007bff; // Highlight on hover
          color: #ffffff;
        }
      }
    }
  }
`;

const MobileCardsContainer = styled.div`
  .teacher-card {
    border: none;
    border-radius: 15px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.06);
    background: #ffffff;
    padding: 1.25rem 1.5rem;
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
    }

    .teacher-card-title {
      font-size: 1.4rem;
      font-weight: 600;
      color: #2c3e50;
      margin-bottom: 0.75rem;
    }

    .teacher-info {
      font-size: 0.95rem;
      color: #555;
      margin-bottom: 0.5rem;
      .info-label {
        font-weight: 600;
        color: #34495e;
      }
      .edit-input {
        border-radius: 8px;
        border-color: #b0c4de;
        font-size: 0.9rem;
        &:focus {
          border-color: #007bff;
          box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
        }
      }
    }

    .button-group-mobile {
      .save-btn, .cancel-btn {
        border-radius: 8px;
        padding: 0.5rem 1rem;
        font-size: 0.9rem;
        display: flex;
        align-items: center;
        gap: 0.3rem;
      }
    }

    .action-dropdown .dropdown-toggle {
      background-color: #17a2b8;
      border-color: #17a2b8;
      border-radius: 8px;
      padding: 0.5rem 1rem;
      font-size: 0.9rem;
    }
    .action-dropdown .dropdown-menu {
      border-radius: 8px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      background-color: #343a40; // Dark background for dropdown menu
      .dropdown-item {
        color: #ffffff;
        &:hover {
          background-color: #007bff; // Highlight on hover
        }
      }
    }
  }
`;

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
    API.get('/teacher').then(res => {
      // Assuming teacher objects might not have fullName, create it
      const teachersWithFullName = res.data.map(t => ({
        ...t,
        fullName: `${t.firstName || ''} ${t.lastName || ''}`.trim()
      }));
      setTeachers(teachersWithFullName);
    }).catch(console.error);
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
    <DashboardWrapper>
      <AdminSidebar className="admin-sidebar" />
      <MainContentArea md={10}>
        <Container fluid className="p-4">
          <SectionTitle>
            <FaUsersCog className="icon-lg" />
            Manage Teachers
          </SectionTitle>

          <ActionPanel>
            <Card className="action-card">
              <Card.Body>
                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                  <Button variant="primary" onClick={() => setShowAddModal(true)} className="add-teacher-btn mb-2 mb-md-0">
                    <FaUserPlus /> Add New Teacher
                  </Button>

                  <InputGroup className="upload-input-group">
                    <Form.Control
                      type="file"
                      onChange={handleFileUpload}
                      className="upload-file-input"
                      accept=".csv, .xlsx, .xls"
                    />
                    <Button variant="secondary" onClick={uploadFile} className="upload-btn">
                      <FaUpload /> Upload Teachers
                    </Button>
                  </InputGroup>
                </div>
                <small className="text-muted d-block text-center text-md-end">
                  <FaInfoCircle className="me-1" /> Accepted formats: .csv, .xlsx, .xls
                </small>
              </Card.Body>
            </Card>
          </ActionPanel>

          {/* Desktop Table View */}
          <DataTableContainer className="d-none d-lg-block">
            <Table striped bordered hover responsive className="teachers-table">
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
          </DataTableContainer>

          {/* Mobile Card View */}
          <MobileCardsContainer className="d-lg-none">
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
          </MobileCardsContainer>

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
      </MainContentArea>
    </DashboardWrapper>
  );
};

export default ManageTeachers;