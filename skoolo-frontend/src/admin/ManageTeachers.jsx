import React, { useEffect, useState, memo } from 'react';
import {
    Container, Table, Button, Form, Row, Col, Dropdown, Card, InputGroup
} from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaUpload, FaUserPlus, FaInfoCircle, FaUsersCog, FaEllipsisV } from 'react-icons/fa';
import API from '../services/api'; // Assuming this path is correct
import AssignTeacherModal from './AssignTeacherModal'; // Assuming this path is correct
import AdminSidebar from './AdminSidebar'; // Assuming this path is correct
import AddTeacherModal from './AddTeacherModal'; // Assuming this path is correct

import './style/ManageTeachers.module.css'; // Updated to use the new CSS file

// Memoized TeacherRow component for desktop table view
const TeacherRow = memo(({ teacher, i, isEditing, editedTeacher, handleInputChange, handleEditClick, handleSaveClick, handleCancelClick, openAssignModal }) => {
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
                            className="dark-input mb-1"
                        />
                        <Form.Control
                            type="text"
                            placeholder="Last Name"
                            value={editedTeacher.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className="dark-input"
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
                        className="dark-input"
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
                        className="dark-input"
                    />
                ) : (
                    teacher.contactNumber
                )}
            </td>
            <td className="actions-column">
                {isEditing ? (
                    <div className="d-flex flex-column flex-sm-row justify-content-center">
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveClick(teacher.id)}
                            className="save-btn me-2 mb-2 mb-sm-0"
                        >
                            <FaSave className="me-1" /> Save
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelClick}
                            className="cancel-btn"
                        >
                            <FaTimes className="me-1" /> Cancel
                        </Button>
                    </div>
                ) : (
                    <div className="desktop-action-buttons d-none d-lg-flex justify-content-center">
                        <Button
                            size="sm"
                            variant="info"
                            onClick={() => openAssignModal(teacher)}
                            className="assign-btn me-2"
                        >
                            <FaUsersCog className="me-1" /> Assign
                        </Button>
                        <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleEditClick(teacher)}
                            className="edit-btn"
                        >
                            <FaEdit className="me-1" /> Edit
                        </Button>
                    </div>
                )}
                {/* Dropdown for mobile view */}
                {!isEditing && (
                    <Dropdown className="action-dropdown d-lg-none">
                        <Dropdown.Toggle variant="info" id={`dropdown-actions-${teacher.id}`} size="sm" className="dropdown-toggle-custom">
                            <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" className="dropdown-menu-custom">
                            <Dropdown.Item onClick={() => openAssignModal(teacher)} className="dropdown-item-custom">
                                <FaUsersCog className="me-2" /> Assign Subjects/Class
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditClick(teacher)} className="dropdown-item-custom">
                                <FaEdit className="me-2" /> Edit Details
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </td>
        </tr>
    );
});

// Memoized TeacherCard component for mobile view
const TeacherCard = memo(({ teacher, isEditing, editedTeacher, handleInputChange, handleEditClick, handleSaveClick, handleCancelClick, openAssignModal }) => {
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
                                    className="dark-input mb-1"
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    value={editedTeacher.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    className="dark-input"
                                />
                            </>
                        ) : (
                            teacher.fullName
                        )}
                    </Card.Title>
                    <Dropdown className="action-dropdown">
                        <Dropdown.Toggle variant="info" id={`dropdown-actions-mobile-${teacher.id}`} size="sm" className="dropdown-toggle-custom">
                            <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" align="end" className="dropdown-menu-custom">
                            <Dropdown.Item onClick={() => openAssignModal(teacher)} className="dropdown-item-custom">
                                <FaUsersCog className="me-2" /> Assign Subjects/Class
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditClick(teacher)} className="dropdown-item-custom">
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
                            className="dark-input"
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
                            className="dark-input"
                        />
                    ) : (
                        teacher.contactNumber
                    )}
                </Card.Text>

                {isEditing && (
                    <div className="button-group-mobile mt-3">
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveClick(teacher.id)}
                            className="save-btn me-2"
                        >
                            <FaSave className="me-1" /> Save
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelClick}
                            className="cancel-btn"
                        >
                            <FaTimes className="me-1" /> Cancel
                        </Button>
                    </div>
                )}
            </Card.Body>
        </Card>
    );
});

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

    useEffect(() => {
        fetchTeachers();
        API.get('/classes').then(res => setClasses(res.data)).catch(console.error);
        API.get('/subjects').then(res => setAllSubjects(res.data)).catch(console.error);
    }, []);

    const fetchTeachers = () => {
        API.get('/teacher').then(res => {
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
        }).filter(Boolean);

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
        API.post('/admin/teachers/add-teacher', newTeacher, {
            headers: { 'Content-Type': 'application/json' },
        })
            .then(() => {
                alert("Teacher added successfully!");
                setShowAddModal(false);
                setNewTeacher({ firstName: '', lastName: '', email: '', contactNumber: '' });
                fetchTeachers();
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
                fetchTeachers();
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

        setTeachers(prevTeachers =>
            prevTeachers.map(t => (t.id === id ? { ...t, ...updatedData, fullName: `${updatedData.firstName} ${updatedData.lastName}`.trim() } : t))
        );
        setEditRowId(null);
        setEditedTeacher({});

        API.put(`/admin/teachers/${id}`, updatedData)
            .then(() => {
                alert("Teacher updated successfully!");
            })
            .catch(err => {
                alert("Error updating teacher");
                console.error(err);
                fetchTeachers(); // Re-fetch to ensure data consistency
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
        <div className="dashboard-layout">
            <AdminSidebar />
            <div className="main-content-wrapper">
                <Container fluid className="p-4 dashboard-container">
                    <h3 className="section-title">
                        <FaUsersCog className="icon-lg me-2" />
                        Manage Teachers
                    </h3>

                    <div className="action-panel-container">
                        <Card className="action-card">
                            <Card.Body>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                                    <Button variant="primary" onClick={() => setShowAddModal(true)} className="add-teacher-btn mb-2 mb-md-0">
                                        <FaUserPlus className="me-1" /> Add New Teacher
                                    </Button>

                                    <InputGroup className="upload-input-group">
                                        <Form.Control
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="form-control-file dark-input"
                                            accept=".csv, .xlsx, .xls"
                                        />
                                        <Button variant="secondary" onClick={uploadFile} className="upload-btn">
                                            <FaUpload className="me-1" /> Upload Teachers
                                        </Button>
                                    </InputGroup>
                                </div>
                                <small className="text-muted-info d-block text-center text-md-end">
                                    <FaInfoCircle className="me-1" /> Accepted formats: .csv, .xlsx, .xls
                                </small>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Desktop Table View */}
                    <div className="data-table-container d-none d-lg-block">
                        <div className="table-responsive-wrapper">
                            <Table striped bordered hover className="teachers-table">
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
                                    {teachers.map((teacher, i) => (
                                        <TeacherRow
                                            key={teacher.id}
                                            teacher={teacher}
                                            i={i}
                                            isEditing={editRowId === teacher.id}
                                            editedTeacher={editedTeacher}
                                            handleInputChange={handleInputChange}
                                            handleEditClick={handleEditClick}
                                            handleSaveClick={handleSaveClick}
                                            handleCancelClick={handleCancelClick}
                                            openAssignModal={openAssignModal}
                                        />
                                    ))}
                                </tbody>
                            </Table>
                        </div>
                    </div>

                    {/* Mobile Card View */}
                    <div className="mobile-cards-container d-lg-none">
                        {teachers.map((teacher) => (
                            <TeacherCard
                                key={teacher.id}
                                teacher={teacher}
                                isEditing={editRowId === teacher.id}
                                editedTeacher={editedTeacher}
                                handleInputChange={handleInputChange}
                                handleEditClick={handleEditClick}
                                handleSaveClick={handleSaveClick}
                                handleCancelClick={handleCancelClick}
                                openAssignModal={openAssignModal}
                            />
                        ))}
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
            </div>
        </div>
    );
};

export default ManageTeachers;