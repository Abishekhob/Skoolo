import React, { useEffect, useState } from 'react';
import {
  Container, Table, Button, Modal, Form, Row, Col, Dropdown,
} from 'react-bootstrap';
import API from '../services/api';
import AssignTeacherModal from './AssignTeacherModal';
import AdminSidebar from './AdminSideBar';
import AddTeacherModal from './AddTeacherModal';

const ManageTeachers = () => {
  const [teachers, setTeachers] = useState([]);
  const [showModal, setShowModal] = useState(false);
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
    API.get('/teacher').then(res => setTeachers(res.data)).catch(console.error);
    API.get('/classes').then(res => setClasses(res.data)).catch(console.error);
    API.get('/subjects').then(res => setAllSubjects(res.data)).catch(console.error);
  }, []);

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
    setShowModal(true);
    setSelectedClass("");
    setSelectedSection("");
    setTimetable([]);
    API.get(`/admin/teachers/${teacher.id}/subjects`)
      .then(res => setTeacherSubjects(res.data))
      .catch(console.error);
  };

  const closeModal = () => {
    setShowModal(false);
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
  API.post('/admin/teachers/add-teacher', newTeacher)
    .then(() => {
      alert("Teacher added");
      setShowAddModal(false);
      setNewTeacher({ firstName: '', lastName: '', email: '', contactNumber: '' });
      API.get('/teacher').then(res => setTeachers(res.data));
    })
    .catch(err => alert("Error adding teacher"));
};

const handleFileUpload = (e) => {
  setUploadFileData(e.target.files[0]);
};

const uploadFile = () => {
  if (!uploadFileData) return alert("Select a file");
  const formData = new FormData();
  formData.append("file", uploadFileData);

  API.post('/admin/teachers/upload', formData)
    .then(() => {
      alert("Teachers uploaded!");
      setUploadFileData(null);
      API.get('/teacher').then(res => setTeachers(res.data));
    })
    .catch(err => alert("Upload failed"));
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
      API.get('/teacher').then(res => setTeachers(res.data));
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
  <Row className="g-0"> {/* Full-width row, no gutter */}
    <AdminSidebar /> {/* Left sidebar (2 columns) */}

    {/* Main content area */}
    <Col
  md={10}
  className="text-white min-vh-100 p-4"
  style={{ backgroundColor: '#0d1117' }} // GitHub dark background
>

      <h3 className="mb-4">Manage Teachers</h3>

      <div className="mb-3 d-flex justify-content-between">
  <Button variant="success" onClick={() => setShowAddModal(true)}>
    Add Teacher
  </Button>

  <Form.Group controlId="formFile" className="d-flex align-items-center">
    <Form.Control type="file" onChange={handleFileUpload} />
    <Button variant="secondary" onClick={uploadFile} className="ms-2">Upload</Button>
  </Form.Group>
</div>


      <Table striped bordered hover variant="dark">
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
        className="mb-2"
      />
      <Form.Control
        type="text"
        placeholder="Last Name"
        value={editedTeacher.lastName}
        onChange={(e) => handleInputChange("lastName", e.target.value)}
      />
    </>
  ) : (
    teacher.fullName
  )}
</td>

        <td>
          {isEditing ? (
            <Form.Control
              type="email"
              value={editedTeacher.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
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
            />
          ) : (
            teacher.contactNumber
          )}
        </td>
        <td>
          {isEditing ? (
            <>
              <Button
                size="sm"
                variant="success"
                onClick={() => handleSaveClick(teacher.id)}
              >
                Save
              </Button>{" "}
              <Button
                size="sm"
                variant="secondary"
                onClick={handleCancelClick}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                variant="primary"
                onClick={() => openAssignModal(teacher)}
              >
                Assign
              </Button>{" "}
              <Button
                size="sm"
                variant="warning"
                onClick={() => handleEditClick(teacher)}
              >
                Edit
              </Button>
            </>
          )}
        </td>
      </tr>
    );
  })}
</tbody>

      </Table>

      <AssignTeacherModal
        show={showModal}
        handleClose={closeModal}
        teacher={selectedTeacher}
        allSubjects={allSubjects}
        teacherSubjects={teacherSubjects}
        setTeacherSubjects={setTeacherSubjects}
        classes={classes}
        sections={sections}
        selectedClass={selectedClass}
        setSelectedClass={setSelectedClass}
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
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

    </Col>
  </Row>
);

};

export default ManageTeachers;
