import React, { useEffect, useState, memo } from 'react'; // Import memo
import {
    Container, Table, Button, Form, Row, Col, Dropdown, Card, InputGroup
} from 'react-bootstrap';
import { FaEdit, FaSave, FaTimes, FaPlus, FaUpload, FaUserPlus, FaInfoCircle, FaUsersCog, FaEllipsisV } from 'react-icons/fa';
import API from '../services/api';
import AssignTeacherModal from './AssignTeacherModal';
import AdminSidebar from './AdminSidebar';
import AddTeacherModal from './AddTeacherModal';

import styles from './style/ManageTeachers.module.css';

// Memoize the TeacherRow component to prevent unnecessary re-renders of individual rows
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
                            className={`${styles.editInput} mb-1`}
                        />
                        <Form.Control
                            type="text"
                            placeholder="Last Name"
                            value={editedTeacher.lastName}
                            onChange={(e) => handleInputChange("lastName", e.target.value)}
                            className={styles.editInput}
                        />
                    </>
                ) : (
                    <span className={styles.teacherNameDisplay}>{teacher.fullName}</span>
                )}
            </td>
            <td>
                {isEditing ? (
                    <Form.Control
                        type="email"
                        value={editedTeacher.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className={styles.editInput}
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
                        className={styles.editInput}
                    />
                ) : (
                    teacher.contactNumber
                )}
            </td>
            <td className={styles.actionsColumn}>
                {isEditing ? (
                    <div className="d-flex flex-column flex-sm-row">
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveClick(teacher.id)}
                            className={`${styles.saveBtn} me-2 mb-2 mb-sm-0`}
                        >
                            <FaSave /> Save
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelClick}
                            className={styles.cancelBtn}
                        >
                            <FaTimes /> Cancel
                        </Button>
                    </div>
                ) : (
                    <Dropdown className={styles.actionDropdown}>
                        <Dropdown.Toggle variant="info" id={`dropdown-actions-${teacher.id}`} size="sm" className={styles.dropdownToggle}>
                            Actions
                        </Dropdown.Toggle>
                        {/* The 'align' prop can be used for right alignment on dropdowns if needed */}
                        <Dropdown.Menu variant="dark" className={styles.dropdownMenu}>
                            <Dropdown.Item onClick={() => openAssignModal(teacher)} className={styles.dropdownItem}>
                                <FaUsersCog className="me-2" /> Assign Subjects/Class
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditClick(teacher)} className={styles.dropdownItem}>
                                <FaEdit className="me-2" /> Edit Details
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )}
            </td>
        </tr>
    );
});

// Memoize the TeacherCard component for mobile view
const TeacherCard = memo(({ teacher, i, isEditing, editedTeacher, handleInputChange, handleEditClick, handleSaveClick, handleCancelClick, openAssignModal }) => {
    return (
        <Card key={teacher.id} className={`${styles.teacherCard} mb-3`}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <Card.Title className={styles.teacherCardTitle}>
                        {isEditing ? (
                            <>
                                <Form.Control
                                    type="text"
                                    placeholder="First Name"
                                    value={editedTeacher.firstName}
                                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                                    className={`${styles.editInput} mb-1`}
                                />
                                <Form.Control
                                    type="text"
                                    placeholder="Last Name"
                                    value={editedTeacher.lastName}
                                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                                    className={styles.editInput}
                                />
                            </>
                        ) : (
                            teacher.fullName
                        )}
                    </Card.Title>
                    <Dropdown className={styles.actionDropdown}>
                        <Dropdown.Toggle variant="info" id={`dropdown-actions-mobile-${teacher.id}`} size="sm" className={styles.dropdownToggle}>
                            <FaEllipsisV />
                        </Dropdown.Toggle>
                        <Dropdown.Menu variant="dark" align="end" className={styles.dropdownMenu}>
                            <Dropdown.Item onClick={() => openAssignModal(teacher)} className={styles.dropdownItem}>
                                <FaUsersCog className="me-2" /> Assign Subjects/Class
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => handleEditClick(teacher)} className={styles.dropdownItem}>
                                <FaEdit className="me-2" /> Edit Details
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                </div>

                <Card.Text className={styles.teacherInfo}>
                    <strong className={styles.infoLabel}>Email:</strong>{' '}
                    {isEditing ? (
                        <Form.Control
                            type="email"
                            value={editedTeacher.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            className={styles.editInput}
                        />
                    ) : (
                        teacher.email
                    )}
                </Card.Text>
                <Card.Text className={styles.teacherInfo}>
                    <strong className={styles.infoLabel}>Contact:</strong>{' '}
                    {isEditing ? (
                        <Form.Control
                            type="text"
                            value={editedTeacher.contactNumber}
                            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                            className={styles.editInput}
                        />
                    ) : (
                        teacher.contactNumber
                    )}
                </Card.Text>

                {isEditing && (
                    <div className={styles.buttonGroupMobile}>
                        <Button
                            size="sm"
                            variant="success"
                            onClick={() => handleSaveClick(teacher.id)}
                            className={styles.saveBtn}
                        >
                            <FaSave /> Save
                        </Button>
                        <Button
                            size="sm"
                            variant="secondary"
                            onClick={handleCancelClick}
                            className={styles.cancelBtn}
                        >
                            <FaTimes /> Cancel
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

        // Optimistically update the UI before API call to reduce perceived latency
        setTeachers(prevTeachers =>
            prevTeachers.map(t => (t.id === id ? { ...t, ...updatedData, fullName: `${updatedData.firstName} ${updatedData.lastName}`.trim() } : t))
        );
        setEditRowId(null);
        setEditedTeacher({});


        API.put(`/admin/teachers/${id}`, updatedData)
            .then(() => {
                // No need to fetchTeachers() again if optimistically updated
                alert("Teacher updated successfully!");
            })
            .catch(err => {
                alert("Error updating teacher");
                console.error(err);
                // Revert UI on error if optimistic update was done
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
        <div className={styles.dashboardWrapper}>
            <AdminSidebar className={styles.adminSidebar} />
            <Col md={10} className={styles.mainContentArea}>
                <Container fluid className="p-4">
                    <h3 className={styles.sectionTitle}>
                        <FaUsersCog className={styles.iconLg} />
                        Manage Teachers
                    </h3>

                    <div className={styles.actionPanel}>
                        <Card className={styles.actionCard}>
                            <Card.Body>
                                <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-3">
                                    <Button variant="primary" onClick={() => setShowAddModal(true)} className={`${styles.addTeacherBtn} mb-2 mb-md-0`}>
                                        <FaUserPlus /> Add New Teacher
                                    </Button>

                                    <InputGroup className={styles.uploadInputGroup}>
                                        <Form.Control
                                            type="file"
                                            onChange={handleFileUpload}
                                            className={styles.formControl}
                                            accept=".csv, .xlsx, .xls"
                                        />
                                        <Button variant="secondary" onClick={uploadFile} className={styles.uploadBtn}>
                                            <FaUpload /> Upload Teachers
                                        </Button>
                                    </InputGroup>
                                </div>
                                <small className={`${styles.textMuted} d-block text-center text-md-end`}>
                                    <FaInfoCircle className="me-1" /> Accepted formats: .csv, .xlsx, .xls
                                </small>
                            </Card.Body>
                        </Card>
                    </div>

                    {/* Desktop Table View */}
                    {/* Added position: relative to dataTableContainer to establish a stacking context for dropdowns */}
                    <div className={`${styles.dataTableContainer} d-none d-lg-block`}>
                        {/* Added a responsive wrapper for the table to handle horizontal scrolling */}
                        <div className={styles.tableResponsiveWrapper}>
                            <Table striped bordered hover className={styles.teachersTable}>
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
                    <div className={`${styles.mobileCardsContainer} d-lg-none`}>
                        {teachers.map((teacher, i) => (
                            <TeacherCard
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
        </div>
    );
};

export default ManageTeachers;