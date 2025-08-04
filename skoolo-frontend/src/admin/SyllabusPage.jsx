import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Form, Button, Table, Row, Col } from "react-bootstrap";
import AdminSidebar from "./AdminSidebar"; // Adjust path if needed


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

  useEffect(() => {
    fetchClasses();
    fetchSubjects();
    fetchAllSyllabus();
  }, []);

  useEffect(() => {
    if (formData.classId) {
      fetchSections(formData.classId);
    }
  }, [formData.classId]);

  const fetchClasses = async () => {
    const res = await axios.get("/api/classes");
    setClasses(res.data);
  };

  const fetchSections = async (classId) => {
    const res = await axios.get(`/api/sections?classId=${classId}`);
    setSections(res.data);
  };

  const fetchSubjects = async () => {
    const res = await axios.get("/api/subjects");
    setSubjects(res.data);
  };

  const fetchAllSyllabus = async () => {
    const res = await axios.get("/api/syllabus/all");
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

    await axios.post("/api/syllabus/upload", uploadData);
    alert("Syllabus uploaded");
    setFormData({ classId: "", sectionId: "", subjectId: "", file: null });
    fetchAllSyllabus();
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this syllabus?")) return;
    try {
      await axios.delete(`/api/syllabus/${id}`);
      alert("Deleted successfully");
      fetchAllSyllabus();
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <Row className="m-0">
      <Col md={3} className="p-0">
        <AdminSidebar />
      </Col>
      <Col md={9} className="p-4">
        <Container>
          <h3 className="mb-4">Upload Syllabus</h3>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col>
                <Form.Select name="classId" value={formData.classId} onChange={handleChange} required>
                  <option value="">Select Class</option>
                  {classes.map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.className}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Select name="sectionId" value={formData.sectionId} onChange={handleChange} required>
                  <option value="">Select Section</option>
                  {sections.map(sec => (
                    <option key={sec.id} value={sec.id}>{sec.sectionName}</option>
                  ))}
                </Form.Select>
              </Col>
              <Col>
                <Form.Select name="subjectId" value={formData.subjectId} onChange={handleChange} required>
                  <option value="">Select Subject</option>
                  {subjects.map(sub => (
                    <option key={sub.id} value={sub.id}>{sub.subjectName}</option>
                  ))}
                </Form.Select>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>Upload PDF</Form.Label>
              <Form.Control type="file" name="file" onChange={handleChange} accept="application/pdf" required />
            </Form.Group>
            <Button type="submit">Upload</Button>
          </Form>

          <hr className="my-4" />
          <h4>Existing Syllabus</h4>
          <Table bordered hover responsive>
            <thead>
              <tr>
                <th>Subject</th>
                <th>File</th>
                <th>Download</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {syllabusList.map((item, idx) => (
                <tr key={idx}>
                  <td>{item.subject}</td>
                  <td>
                    <a href={item.fileUrl} target="_blank" rel="noreferrer">
                      {item.fileName}
                    </a>
                  </td>
                  <td>
                    <a href={item.fileUrl} download>
                      Download
                    </a>
                  </td>
                  <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(item.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Container>
      </Col>
    </Row>
  );
};

export default SyllabusPage;
