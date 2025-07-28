import React, { useEffect, useState, useCallback } from 'react';
import { Row, Col, Form, Button, Alert, Table, Collapse, Card, Spinner } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import API from '../services/api';
import { FaUsers, FaPlus, FaFileUpload, FaDownload, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import './style/ManageParents.css'; // Dedicated CSS for this component

const ManageParents = () => {
  const [parent, setParent] = useState({
    firstName: '', lastName: '', email: '', contactNumber: '', address: ''
  });
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'danger', 'info'
  const [showForm, setShowForm] = useState(false);
  const [parents, setParents] = useState([]);
  const [expandedParentId, setExpandedParentId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch Parents
  const fetchParents = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/parents');
      setParents(res.data);
      setMessage(''); // Clear any previous messages
    } catch (err) {
      console.error('Failed to fetch parents', err);
      setMessage('Failed to load parents. Please try again.');
      setMessageType('danger');
      setParents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchParents();
  }, [fetchParents]);

  // Auto-dismiss messages
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage('');
        setMessageType('info'); // Reset to default
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleChange = (e) => {
    setParent({ ...parent, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      await API.post('/admin/add-parent', parent);
      setMessage('Parent added successfully!');
      setMessageType('success');
      setParent({ firstName: '', lastName: '', email: '', contactNumber: '', address: '' });
      fetchParents();
      setShowForm(false);
    } catch (err) {
      console.error('Failed to add parent', err);
      setMessage(err.response?.data?.message || 'Failed to add parent. Please check input data.');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (/\.(csv|xlsx?|xls)$/i.test(file.name)) {
        setUploadFile(file);
        setMessage('');
      } else {
        setMessage('Only .csv or .xlsx/.xls files are supported.');
        setMessageType('danger');
        setUploadFile(null);
      }
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFile) {
      setMessage('Please select a file before uploading.');
      setMessageType('info');
      return;
    }

    setLoading(true);
    setMessage('');
    const formData = new FormData();
    formData.append('file', uploadFile);

    try {
      await API.post('/admin/upload-parents', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setMessage('File uploaded successfully!');
      setMessageType('success');
      setUploadFile(null);
      fetchParents();
    } catch (err) {
      console.error('Failed to upload file.', err);
      setMessage(err.response?.data?.message || 'Failed to upload file. Please check file format and content.');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      if (/\.(csv|xlsx?|xls)$/i.test(file.name)) {
        setUploadFile(file);
        setMessage('');
      } else {
        setMessage('Only .csv or .xlsx/.xls files are supported.');
        setMessageType('danger');
        setUploadFile(null);
      }
    }
  };

  return (
    <Row className="g-0 admin-layout-container">
       <div class="sidebar">
  <AdminSidebar />
</div>

      <Col md={10} className="main-content-area">
        <div className="container-fluid p-4 main-content-padding"> {/* Added main-content-padding for better spacing */}
          <h3 className="section-title mb-4">
            <FaUsers className="me-2 icon-lg" /> Manage Parents
          </h3>

          {message && <Alert variant={messageType} className="custom-alert fade-in-down">{message}</Alert>}

          {/* Action Buttons and File Upload */}
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center align-items-md-start gap-3 mb-4">
            {/* Add Parent Button */}
            <Button
              variant={showForm ? "secondary" : "primary"}
              onClick={() => setShowForm(!showForm)}
              className="add-parent-btn"
            >
              {showForm ? "Hide Form" : <><FaPlus className="me-2" /> Add New Parent</>}
            </Button>

            {/* Drag & Drop Upload Area */}
            <div
              className="file-upload-dropzone"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('fileInput').click()}
            >
              <p className="mb-1">
                <FaFileUpload className="me-2" />
                <strong>Drag & drop Excel/CSV here</strong><br />
                <small>or click to select file</small>
              </p>
              {uploadFile && (
                <div className="selected-file-info mt-2">
                  <span className="text-info me-2">{uploadFile.name}</span>
                  <Button
                    variant="info"
                    size="sm"
                    className="upload-btn"
                    onClick={(e) => { e.stopPropagation(); handleFileUpload(); }}
                    disabled={loading}
                  >
                    {loading ? <Spinner animation="border" size="sm" /> : 'Upload'}
                  </Button>
                </div>
              )}
              <input
                id="fileInput"
                type="file"
                accept=".csv,.xlsx,.xls"
                style={{ display: 'none' }}
                onChange={handleFileChange}
              />
            </div>

            {/* Download Sample File Button */}
            <a
              href="/sample-parent.xlsx"
              download
              className="btn btn-outline-light download-sample-btn"
            >
              <FaDownload className="me-2" /> Download Sample
            </a>
          </div>

          {/* Add Parent Form (Collapsible) */}
          <Collapse in={showForm}>
            <div className="add-parent-form-container mb-4">
              <Card className="add-parent-card">
                <Card.Body>
                  <Card.Title className="card-title-custom mb-3">Add Parent Details</Card.Title>
                  <Form onSubmit={handleSubmit}>
                    <Row>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="form-label-custom">First Name</Form.Label>
                          <Form.Control name="firstName" value={parent.firstName} onChange={handleChange} className="form-control-custom" required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="form-label-custom">Last Name</Form.Label>
                          <Form.Control name="lastName" value={parent.lastName} onChange={handleChange} className="form-control-custom" required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="form-label-custom">Email</Form.Label>
                          <Form.Control name="email" type="email" value={parent.email} onChange={handleChange} className="form-control-custom" required />
                        </Form.Group>
                      </Col>
                      <Col md={6} className="mb-3">
                        <Form.Group>
                          <Form.Label className="form-label-custom">Contact Number</Form.Label>
                          <Form.Control name="contactNumber" value={parent.contactNumber} onChange={handleChange} className="form-control-custom" required />
                        </Form.Group>
                      </Col>
                      <Col xs={12} className="mb-3">
                        <Form.Group>
                          <Form.Label className="form-label-custom">Address</Form.Label>
                          <Form.Control name="address" value={parent.address} onChange={handleChange} className="form-control-custom" as="textarea" rows={2} required />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading} className="submit-parent-btn">
                      {loading ? <Spinner as="span" animation="border" size="sm" aria-hidden="true" /> : 'Submit Parent'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Collapse>

          <h5 className="sub-section-title mb-3">All Parents</h5>

          {loading && parents.length === 0 ? (
            <div className="text-center my-5 flex-grow-1"> {/* Added flex-grow-1 */}
              <Spinner animation="border" variant="light" role="status" className="initial-loading-spinner" />
              <p className="text-light mt-3">Loading parents...</p>
            </div>
          ) : parents.length === 0 ? (
            <Alert variant="info" className="text-center custom-alert-info">
              No parents found. Add new parents using the form above or by uploading a file.
            </Alert>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-lg-block">
                <Table striped bordered hover variant="dark" className="parents-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Full Name</th>
                      <th>Email</th>
                      <th>Contact</th>
                      <th>Address</th>
                      <th className="text-center">Children</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parents.map((p, i) => (
                      <React.Fragment key={p.id}>
                        <tr>
                          <td>{i + 1}</td>
                          <td>{p.firstName} {p.lastName}</td>
                          <td>{p.user?.email || 'N/A'}</td>
                          <td>{p.contactNumber}</td>
                          <td>{p.address}</td>
                          <td className="text-center">
                            <Button
                              size="sm"
                              variant={expandedParentId === p.id ? "warning" : "info"}
                              onClick={() => setExpandedParentId(expandedParentId === p.id ? null : p.id)}
                              className="view-children-btn"
                            >
                              {expandedParentId === p.id ? (
                                <><FaChevronUp className="me-1" /> Hide Children</>
                              ) : (
                                <><FaChevronDown className="me-1" /> View Children ({p.children?.length || 0})</>
                              )}
                            </Button>
                          </td>
                        </tr>
                        {/* Collapsible Row for Children */}
                        <tr>
                          <td colSpan={6} className="p-0 border-0">
                            <Collapse in={expandedParentId === p.id}>
                              <div>
                                <Card className="children-card-nested">
                                  <Card.Body>
                                    {p.children && p.children.length > 0 ? (
                                      <Table striped bordered size="sm" variant="dark" className="children-table-nested">
                                        <thead>
                                          <tr>
                                            <th>#</th>
                                            <th>First Name</th>
                                            <th>Last Name</th>
                                            <th>DOB</th>
                                            <th>Gender</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {p.children.map((child, idx) => (
                                            <tr key={child.id}>
                                              <td>{idx + 1}</td>
                                              <td>{child.firstName}</td>
                                              <td>{child.lastName}</td>
                                              <td>{child.dob}</td>
                                              <td>{child.gender}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    ) : (
                                      <p className="text-center text-muted m-0">No children linked to this parent.</p>
                                    )}
                                  </Card.Body>
                                </Card>
                              </div>
                            </Collapse>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card View */}
              <div className="d-lg-none mobile-card-list">
                {parents.map((p, i) => (
                  <Card key={p.id} className="parent-mobile-card mb-3">
                    <Card.Body>
                      <Card.Title className="mobile-card-title mb-2">
                        <span>Parent {i + 1}: </span> {p.firstName} {p.lastName}
                      </Card.Title>
                      <ul className="list-unstyled mobile-parent-details">
                        <li><strong>Email:</strong> {p.user?.email || 'N/A'}</li>
                        <li><strong>Contact:</strong> {p.contactNumber}</li>
                        <li><strong>Address:</strong> {p.address}</li>
                      </ul>
                      <Button
                        size="sm"
                        variant={expandedParentId === p.id ? "warning" : "info"}
                        onClick={() => setExpandedParentId(expandedParentId === p.id ? null : p.id)}
                        className="w-100 mt-2 view-children-btn-mobile"
                      >
                        {expandedParentId === p.id ? (
                          <><FaChevronUp className="me-1" /> Hide Children</>
                        ) : (
                          <><FaChevronDown className="me-1" /> View Children ({p.children?.length || 0})</>
                        )}
                      </Button>
                      <Collapse in={expandedParentId === p.id}>
                        <div className="mt-3">
                          <Card className="children-card-nested mobile-children-card">
                            <Card.Body className="p-2">
                              {p.children && p.children.length > 0 ? (
                                p.children.map((child, idx) => (
                                  <div key={child.id} className="child-detail-item p-2 mb-2 rounded">
                                    <p className="mb-1"><strong>Child {idx + 1}:</strong> {child.firstName} {child.lastName}</p>
                                    <small className="d-block">DOB: {child.dob} | Gender: {child.gender}</small>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-muted m-0">No children linked.</p>
                              )}
                            </Card.Body>
                          </Card>
                        </div>
                      </Collapse>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </Col>
    </Row>
  );
};

export default ManageParents;