import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Row, Col, Spinner, Container, Button } from 'react-bootstrap';
import API from '../services/api';
import AdminSidebar from './AdminSideBar';
import './style/SectionDetails.css'; // This will contain updated styles
import AddStudentModal from './AddStudentModal';
import StudentTable from './StudentTable';
import TimetableTable from './TimetableTable';

const SectionDetails = () => {
  const { classId, sectionId } = useParams();

  // HOOKS
  const [loading, setLoading] = useState(true);
  const [sectionStats, setSectionStats] = useState({});
  const [students, setStudents] = useState([]);
  const [editStudentId, setEditStudentId] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    gender: '',
    dob: '',
    contactNumber: '',
    address: '',
    parentEmail: '',
    enrollmentDate: '',
  });
  const [timetable, setTimetable] = useState([]);

  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  // FETCH STUDENTS
  useEffect(() => {
    const fetchSectionDetails = async () => {
      try {
        const res = await API.get(`/classes/${classId}/sections/${sectionId}/details`);
        setSectionStats(res.data);
        setStudents(res.data.students);
      } catch (err) {
        console.error('Error fetching section details:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSectionDetails();
  }, [classId, sectionId]);

  // FETCH TIMETABLE
  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await API.get(`/classes/${classId}/sections/${sectionId}/timetable`);
        setTimetable(res.data);
      } catch (err) {
        console.error('Failed to fetch timetable:', err);
      }
    };
    fetchTimetable();
  }, [classId, sectionId]);

  // FILE UPLOADS
  const handleFileUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/admin/upload-students', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const updated = await API.get(`/classes/${classId}/sections/${sectionId}/details`);
      setSectionStats(updated.data);
      setStudents(updated.data.students);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    }
  };

  const handleTimetableUpload = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      await API.post('/admin/upload-timetable', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const res = await API.get(`/classes/${classId}/sections/${sectionId}/timetable`);
      setTimetable(res.data);
    } catch (err) {
      console.error('Timetable upload failed:', err);
      alert('Upload failed. Please try again.');
    }
  };

  // Drag-drop events
  const onFileChange = (e) => handleFileUpload(e.target.files[0]);
  const onDragOver = (e) => {
    e.preventDefault();
    dropRef.current.classList.add('drag-over');
  };
  const onDragLeave = () => dropRef.current.classList.remove('drag-over');
  const onDrop = (e) => {
    e.preventDefault();
    dropRef.current.classList.remove('drag-over');
    if (e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  // Student form
  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmitManual = async (e) => {
    e.preventDefault();
    try {
      await API.post('/admin/add-student', {
        ...formData,
        classId,
        sectionId,
      });
      const updated = await API.get(`/classes/${classId}/sections/${sectionId}/details`);
      setSectionStats(updated.data);
      setStudents(updated.data.students);
      setShowModal(false);
      setFormData({
        firstName: '',
        lastName: '',
        gender: '',
        dob: '',
        contactNumber: '',
        address: '', // Reset address
        parentEmail: '', // Reset parentEmail
        enrollmentDate: '', // Reset enrollmentDate
      });
    } catch (err) {
      console.error('Manual add failed:', err);
      alert('Failed to add student.');
    }
  };

  // Student edit
  const handleEdit = (student) => {
    setEditStudentId(student.id);
    setEditFormData({ ...student });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setEditStudentId(null);
    setEditFormData({});
  };

  const handleSave = async (id) => {
    try {
      await API.put(`/admin/update-student/${id}`, editFormData);
      const updated = await API.get(`/classes/${classId}/sections/${sectionId}/details`);
      setStudents(updated.data.students);
      setEditStudentId(null);
    } catch (err) {
      console.error('Update failed:', err);
      alert('Failed to update student.');
    }
  };

  const handleSaveEdit = async (editedTimetable) => {
    try {
      const enrichedTimetable = editedTimetable.map((entry) => {
        if (!entry.subjectName) {
          console.warn('Missing subjectName for entry:', entry);
        }
        return {
          ...entry,
          classId,
          sectionId,
          subjectName: entry.subject?.subjectName || '',
        };
      });
      console.log('Sending edited timetable:', enrichedTimetable);
      // PUT request to update timetable
      await API.put('/timetable/update', enrichedTimetable);
      // Optional: re-fetch the updated timetable
      const response = await API.get(`/classes/${classId}/sections/${sectionId}/timetable`);
      setTimetable(response.data); // update your timetable state
      alert('✅ Timetable updated successfully');
    } catch (error) {
      console.error('Update failed:', error);
      alert('❌ Failed to update timetable.');
    }
  };

  // LOADING STATE
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <Container fluid className="section-details-container">
      <Row className="g-0">
        <AdminSidebar />
        <Col md={10} className="section-content-area py-5 px-4">
          <div className="section-header d-flex justify-content-between align-items-center mb-4">
            <Button
              variant="outline-light"
              onClick={() => window.history.back()}
              className="back-button primary-btn" /* Added primary-btn class */
            >
              ← Back
            </Button>
            <h3 className="section-title flex-grow-1 text-center m-0">
              {sectionStats.className}-{sectionStats.sectionName}
            </h3>
            <div className="spacer"></div>
          </div>

          {/* Stat tiles */}
          <Row className="mb-5 text-center g-3">
            {[
              { label: 'Total Students', value: sectionStats.totalStudents },
              { label: 'Male', value: sectionStats.maleCount },
              { label: 'Female', value: sectionStats.femaleCount },
              { label: 'Class Teacher', value: sectionStats.classTeacher },
            ].map((tile, idx) => (
              <Col xs={12} sm={6} md={3} key={idx}>
                <Card className="stat-card shadow-sm">
                  <Card.Body>
                    <Card.Title className="stat-label">{tile.label}</Card.Title>
                    <Card.Text className="stat-value">{tile.value}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          <Card className="data-section-card mb-5 p-4 shadow-lg">
            <h4 className="card-title text-center mb-4">Student Management</h4>
            <div className="d-flex justify-content-between align-items-center flex-wrap mb-4 gap-3">
              {students.length > 0 && (
                <>
                  <Button
                    variant="outline-info" /* Changed from outline-info to outline-primary-custom */
                    size="sm"
                    href="/sample-students.xlsx"
                    download
                    className="download-sample-btn outline-primary-custom" /* Added outline-primary-custom */
                  >
                    ⬇️ Download Sample File
                  </Button>

                  <div
                    ref={dropRef}
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    onClick={() => fileInputRef.current.click()}
                    className="file-upload-area text-center"
                  >
                    <div className="small fw-semibold">📁 Drag & Drop or Click to Upload</div>
                    <small className="text-muted">Accepted: .csv, .xlsx, .xls</small>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept=".csv, .xlsx, .xls"
                      onChange={onFileChange}
                      style={{ display: 'none' }}
                    />
                  </div>

                  <Button
                    variant="success" /* Changed from success to primary-btn */
                    onClick={() => setShowModal(true)}
                    className="add-student-btn primary-btn" /* Added primary-btn */
                  >
                    + Add Student
                  </Button>
                </>
              )}
            </div>

            {students.length > 0 ? (
              <StudentTable
                students={students}
                editStudentId={editStudentId}
                editFormData={editFormData}
                handleEdit={handleEdit}
                handleEditChange={handleEditChange}
                handleCancel={handleCancel}
                handleSave={handleSave}
              />
            ) : (
                      <div className="d-flex justify-content-center align-items-center flex-grow-1"> {/* Added align-items-center and flex-grow-1 */}
                <Card className="empty-state-card"> {/* Removed shadow-sm */}
                  <Card.Body>
                    <h4 className="text-center mb-3">📭 No Students Found</h4>
                    <p className="text-center text-muted mb-3">
                      Download the sample file, fill in student details, and upload it below.
                    </p>

                    <div className="text-center mb-3">
                      <Button
                        href="/sample-students.xlsx"
                        download
                        size="sm"
                        className="outline-primary-custom" /* Uses the custom outline style */
                      >
                        ⬇️ Download Sample File
                      </Button>
                    </div>

                    <div
                      ref={dropRef}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onClick={() => fileInputRef.current.click()}
                      className="file-upload-area empty-state-upload p-4"
                    >
                      <p className="fs-5 mb-1">📤 Drag & Drop student file here</p>
                      <p className="mb-3">or click to upload from your system</p>
                      <input
                        type="file"
                        accept=".csv, .xlsx, .xls"
                        onChange={onFileChange}
                        ref={fileInputRef}
                        style={{ display: 'none' }}
                      />
                      <small className="text-muted d-block mb-2">
                        Accepted formats: .csv, .xlsx, .xls
                      </small>
                    </div>

                    <p className="text-center text-muted mt-4 mb-2">— or —</p>

                    <div className="text-center">
                      <Button
                        onClick={() => setShowModal(true)}
                        className="primary-btn" /* Uses the custom primary style */
                      >
                        + Add Student using form
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            )}
          </Card>

          {/* TIMETABLE SECTION */}
          <Card className="data-section-card p-3 shadow-lg">
            <h4 className="card-title text-center mb-4">Timetable Management</h4>
            <TimetableTable
              timetable={timetable}
              onFileUpload={handleTimetableUpload}
              onSaveEdit={handleSaveEdit}
            />
          </Card>
        </Col>
      </Row>

      {/* ADD STUDENT MODAL */}
      <AddStudentModal
        show={showModal}
        onHide={() => setShowModal(false)}
        formData={formData}
        onChange={handleInputChange}
        onSubmit={handleSubmitManual}
      />
    </Container>
  );
};

export default SectionDetails;