import React, { useEffect, useState } from "react";
import { Container, Form, Button, Row, Col } from "react-bootstrap";
import AdminSidebar from "./AdminSidebar";
import API from "../services/api";
import "./style/SyllabusPage.css"; // Import the custom stylesheet
import { FaUpload, FaTrash, FaDownload, FaFilePdf } from "react-icons/fa";

const SyllabusPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [syllabusList, setSyllabusList] = useState([]);
  const [formData, setFormData] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
    file: null,
  });
  const [filters, setFilters] = useState({
    classId: "",
    sectionId: "",
    subjectId: "",
  });

  useEffect(() => {
    fetchClasses();
    fetchAllSyllabus();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      fetchSections(formData.classId);
    }
  }, [formData.classId]);

  useEffect(() => {
    if (formData.classId && formData.sectionId) {
      fetchSubjects(formData.classId, formData.sectionId);
    }
  }, [formData.classId, formData.sectionId]);

  const fetchClasses = async () => {
    const res = await API.get("/classes");
    setClasses(res.data);
  };

  const fetchSections = async (classId) => {
    const res = await API.get(`/classes/${classId}/sections`);
    setSections(res.data.sections || []);
  };

  const fetchSubjects = async (classId, sectionId) => {
    if (!classId || !sectionId) return;
    try {
      const res = await API.get(`/timetable/subjects`, {
        params: { classId, sectionId },
      });
      setSubjects(res.data);
    } catch (err) {
      setSubjects([]);
      console.error("Timetable not assigned for this class and section.");
    }
  };

  const fetchAllSyllabus = async () => {
    const res = await API.get("/syllabus/all");
    setSyllabusList(res.data);
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      setFormData({ ...formData, file: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.file) return alert("Please select a file");

    const uploadData = new FormData();
    uploadData.append("classId", formData.classId);
    uploadData.append("sectionId", formData.sectionId);
    uploadData.append("subjectId", formData.subjectId);
    uploadData.append("file", formData.file);

    try {
      await API.post("/syllabus/upload", uploadData);
      alert("Syllabus uploaded");
      setFormData({ classId: "", sectionId: "", subjectId: "", file: null });
      fetchAllSyllabus();
    } catch (error) {
      alert("Upload failed");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this syllabus?"))
      return;
    try {
      await API.delete(`/syllabus/${id}`);
      alert("Deleted successfully");
      fetchAllSyllabus();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (name === "classId") {
      fetchSections(value);
      setFilters((prev) => ({ ...prev, sectionId: "", subjectId: "" }));
    }
    if (name === "sectionId") {
      setFilters((prev) => ({ ...prev, subjectId: "" }));
    }
  };

  const resetFilters = () => {
    setFilters({ classId: "", sectionId: "", subjectId: "" });
    setSections([]);
    setSubjects([]);
    fetchAllSyllabus();
  };

  return (
    <Row className="m-0 syllabus-page-wrapper">
      <Col md={3} className="p-0">
        <AdminSidebar />
      </Col>
      <Col md={9} className="p-4 content-area">
        <Container>
          <div className="upload-section-card">
            <h3 className="mb-4 section-title">Upload Syllabus</h3>
            <Form onSubmit={handleSubmit}>
              <Row className="mb-3 g-3">
                <Col md={4}>
                  <Form.Select
                    name="classId"
                    value={formData.classId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Class</option>
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.id}>
                        {cls.className}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    name="sectionId"
                    value={formData.sectionId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map((sec) => (
                      <option key={sec.id} value={sec.id}>
                        {sec.name}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Select
                    name="subjectId"
                    value={formData.subjectId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subjectName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
              </Row>
              <Form.Group className="mb-4">
                <Form.Label>Upload PDF</Form.Label>
                <Form.Control
                  type="file"
                  name="file"
                  onChange={handleChange}
                  accept="application/pdf"
                  required
                />
              </Form.Group>
              <Button type="submit" className="upload-button-styled">
                <FaUpload className="me-2" /> Upload Syllabus
              </Button>
            </Form>
          </div>

          <hr className="my-5 divider" />
          <div className="existing-syllabus-section">
            <h4 className="mb-4 section-title">Existing Syllabus</h4>
            <Row className="mb-4 g-3 align-items-center">
              <Col md={3}>
                <Form.Select
                  name="classId"
                  value={filters.classId}
                  onChange={handleFilterChange}
                >
                  <option value="">All Classes</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.className}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  name="sectionId"
                  value={filters.sectionId}
                  onChange={handleFilterChange}
                  disabled={!filters.classId}
                >
                  <option value="">All Sections</option>
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.name}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Form.Select
                  name="subjectId"
                  value={filters.subjectId}
                  onChange={handleFilterChange}
                  disabled={!filters.classId || !filters.sectionId}
                >
                  <option value="">All Subjects</option>
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.subjectName}
                    </option>
                  ))}
                </Form.Select>
              </Col>
              <Col md={3}>
                <Button
                  variant="secondary"
                  className="w-100 reset-filter-button"
                  onClick={resetFilters}
                  disabled={
                    !filters.classId && !filters.sectionId && !filters.subjectId
                  }
                >
                  Reset Filters
                </Button>
              </Col>
            </Row>

            <Table bordered hover responsive className="styled-table">
              <thead>
                <tr>
                  <th>Class</th>
                  <th>Section</th>
                  <th>Subject</th>
                  <th>File</th>
                  <th>Download</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {syllabusList.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.className}</td>
                    <td>{item.sectionName}</td>
                    <td>{item.subjectName}</td>
                    <td>
                      <a href={item.fileUrl} target="_blank" rel="noreferrer">
                        {item.fileName}
                      </a>
                    </td>
                    <td>
                      <a href={item.fileUrl} download className="download-link">
                        <FaDownload />
                      </a>
                    </td>
                    <td>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleDelete(item.id)}
                        className="delete-button-styled"
                      >
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Container>
      </Col>
    </Row>
  );
};

export default SyllabusPage;