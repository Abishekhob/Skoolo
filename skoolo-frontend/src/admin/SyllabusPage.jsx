import React, { useEffect, useState, useMemo } from "react";
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

  // --- Data Fetching ---
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
    try {
      const res = await API.get("/classes");
      setClasses(res.data);
    } catch (err) {
      console.error("Failed to fetch classes", err);
    }
  };

  const fetchSections = async (classId) => {
    try {
      const res = await API.get(`/classes/${classId}/sections`);
      setSections(res.data.sections || []);
    } catch (err) {
      console.error("Failed to fetch sections", err);
      setSections([]);
    }
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
      console.warn("Timetable not assigned for this class and section.");
    }
  };

  const fetchAllSyllabus = async () => {
    try {
      const res = await API.get("/syllabus/all");
      setSyllabusList(res.data);
    } catch (err) {
      console.error("Failed to fetch syllabus list", err);
    }
  };

  // --- Event Handlers ---
  const handleFormChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
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
      fetchSubjects(filters.classId, value);
      setFilters((prev) => ({ ...prev, subjectId: "" }));
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
      alert("Syllabus uploaded successfully!");
      setFormData({ classId: "", sectionId: "", subjectId: "", file: null });
      fetchAllSyllabus();
    } catch (error) {
      alert("Upload failed. Please check the form data.");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this syllabus?")) return;
    try {
      await API.delete(`/syllabus/${id}`);
      alert("Syllabus deleted successfully!");
      fetchAllSyllabus();
    } catch (err) {
      alert("Delete failed.");
      console.error(err);
    }
  };

  const resetFilters = () => {
    setFilters({ classId: "", sectionId: "", subjectId: "" });
    fetchAllSyllabus();
  };

  // --- Filtered List Memoization ---
  const filteredSyllabusList = useMemo(() => {
    return syllabusList.filter((item) => {
      const classMatch = filters.classId
        ? item.classId.toString() === filters.classId
        : true;
      const sectionMatch = filters.sectionId
        ? item.sectionId.toString() === filters.sectionId
        : true;
      const subjectMatch = filters.subjectId
        ? item.subjectId.toString() === filters.subjectId
        : true;
      return classMatch && sectionMatch && subjectMatch;
    });
  }, [syllabusList, filters]);

  return (
    <div className="syllabus-page-wrapper">
      <AdminSidebar />
      <div className="content-area">
        <Container fluid>
          <div className="section-card upload-card mb-5">
            <h3 className="section-title">Upload Syllabus</h3>
            <Form onSubmit={handleSubmit} className="upload-form">
              <Row className="g-3">
                <Col md={4}>
                  <Form.Select
                    name="classId"
                    value={formData.classId}
                    onChange={handleFormChange}
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
                    onChange={handleFormChange}
                    required
                    disabled={!formData.classId}
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
                    onChange={handleFormChange}
                    required
                    disabled={!formData.sectionId}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {sub.subjectName}
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col xs={12}>
                  <Form.Group className="mb-3">
                    <Form.Label>Syllabus File (PDF)</Form.Label>
                    <Form.Control
                      type="file"
                      name="file"
                      onChange={handleFormChange}
                      accept="application/pdf"
                      required
                    />
                  </Form.Group>
                </Col>
                <Col xs={12} className="text-end">
                  <Button type="submit" className="upload-btn">
                    <FaUpload className="me-2" /> Upload
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>

          <div className="section-card syllabus-list-card">
            <h3 className="section-title">Existing Syllabus</h3>
            <div className="filters-container mb-4">
              <Row className="g-3 align-items-center">
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
                    onClick={resetFilters}
                    disabled={
                      !filters.classId && !filters.sectionId && !filters.subjectId
                    }
                    className="w-100"
                  >
                    Reset Filters
                  </Button>
                </Col>
              </Row>
            </div>
            <Row xs={1} md={2} lg={3} className="g-4">
              {filteredSyllabusList.length > 0 ? (
                filteredSyllabusList.map((item) => (
                  <Col key={item.id}>
                    <div className="syllabus-card">
                      <div className="card-header">
                        <FaFilePdf size={24} className="pdf-icon" />
                        <h5 className="card-title">{item.subjectName}</h5>
                      </div>
                      <div className="card-body">
                        <p className="card-text">
                          <strong>Class:</strong> {item.className}
                        </p>
                        <p className="card-text">
                          <strong>Section:</strong> {item.sectionName}
                        </p>
                        <p className="card-text file-name">
                          <strong>File:</strong> {item.fileName}
                        </p>
                      </div>
                      <div className="card-actions">
                        <a
                          href={item.fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="btn-action download-btn"
                        >
                          <FaDownload />
                        </a>
                        <a
                          href={item.fileUrl}
                          download
                          className="btn-action view-btn"
                        >
                          View
                        </a>
                        <Button
                          variant="danger"
                          className="btn-action delete-btn"
                          onClick={() => handleDelete(item.id)}
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))
              ) : (
                <Col xs={12}>
                  <div className="text-center text-muted py-5">
                    No syllabus documents found.
                  </div>
                </Col>
              )}
            </Row>
          </div>
        </Container>
      </div>
    </div>
  );
};

export default SyllabusPage;