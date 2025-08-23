import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';
import AdminSidebar from './AdminSidebar';
import API from '../services/api';

const ManageParents = () => {
  const [parent, setParent] = useState({ firstName: '', lastName: '', email: '', contactNumber: '', address: '' });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [parents, setParents] = useState([]);
  const [expandedParentId, setExpandedParentId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

  // Filters
  const [searchName, setSearchName] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterSection, setFilterSection] = useState('');

  useEffect(() => {
    fetchParents();
  }, []);

  const fetchParents = () => {
    API.get('/parents')
      .then(res => setParents(res.data))
      .catch(err => {
        console.error('Failed to fetch parents', err);
        setParents([]);
      });
  };

  const handleChange = (e) => {
    setParent({ ...parent, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    API.post('/admin/add-parent', parent)
      .then(() => {
        setMessage('Parent added successfully!');
        setParent({ firstName: '', lastName: '', email: '', contactNumber: '', address: '' });
        fetchParents();
        setShowForm(false);
      })
      .catch(() => setMessage('Failed to add parent'));
  };

  const handleFileUpload = () => {
    if (!uploadFile) {
      setMessage('Please select a file before uploading.');
      return;
    }

    const formData = new FormData();
    formData.append('file', uploadFile);

    API.post('/admin/upload-parents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
      .then(() => {
        setMessage('File uploaded successfully!');
        setUploadFile(null);
        fetchParents();
      })
      .catch(() => setMessage('Failed to upload file.'));
  };

  // Filter parents based on search and filters
  const filteredParents = parents.filter(p => {
    const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
    const matchesName = fullName.includes(searchName.toLowerCase());

    const matchesClass = filterClass ? p.children?.some(c => c.class === filterClass) : true;
    const matchesSection = filterSection ? p.children?.some(c => c.section === filterSection) : true;

    return matchesName && matchesClass && matchesSection;
  });

  return (
    <Row className="g-0">
      <AdminSidebar />
      <Col md={10} className="text-white p-4 min-vh-100" style={{ backgroundColor: '#0d1117' }}>
        <h3 className="mb-4">Manage Parents</h3>

        {message && <Alert variant="info">{message}</Alert>}

        {/* Search and Filters */}
        <div className="mb-4 d-flex gap-2 flex-wrap">
          <Form.Control
            type="text"
            placeholder="Search by parent name..."
            value={searchName}
            onChange={e => setSearchName(e.target.value)}
            style={{ maxWidth: '250px' }}
          />
          <Form.Control
            as="select"
            value={filterClass}
            onChange={e => setFilterClass(e.target.value)}
            style={{ maxWidth: '150px' }}
          >
            <option value="">All Classes</option>
            <option value="1">Class 1</option>
            <option value="2">Class 2</option>
            <option value="3">Class 3</option>
            {/* Add more classes as needed */}
          </Form.Control>
          <Form.Control
            as="select"
            value={filterSection}
            onChange={e => setFilterSection(e.target.value)}
            style={{ maxWidth: '150px' }}
          >
            <option value="">All Sections</option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            {/* Add more sections as needed */}
          </Form.Control>
        </div>

        <div className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
          <Button variant={showForm ? "secondary" : "success"} onClick={() => setShowForm(!showForm)}>
            {showForm ? "Close Form" : "➕ Add Parent"}
          </Button>
          {/* File upload and download button */}
          {/* ... your existing file upload & download code here ... */}
        </div>

        {showForm && (
          <Form className="mb-4 p-3 border rounded bg-dark">
            <Form.Group className="mb-2">
              <Form.Label>First Name</Form.Label>
              <Form.Control name="firstName" value={parent.firstName} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Last Name</Form.Label>
              <Form.Control name="lastName" value={parent.lastName} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control name="email" type="email" value={parent.email} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Contact Number</Form.Label>
              <Form.Control name="contactNumber" value={parent.contactNumber} onChange={handleChange} />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control name="address" value={parent.address} onChange={handleChange} />
            </Form.Group>
            <Button variant="primary" onClick={handleSubmit}>Submit</Button>
          </Form>
        )}

        <h5 className="text-light">All Parents</h5>
        <Table striped bordered hover variant="dark">
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Email</th>
              <th>Contact</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {filteredParents.map((p, i) => {
              const isExpanded = expandedParentId === p.id;
              return (
                <React.Fragment key={p.id}>
                  <tr>
                    <td>{i + 1}</td>
                    <td>{p.firstName} {p.lastName}</td>
                    <td>{p.user?.email || 'N/A'}</td>
                    <td>{p.contactNumber}</td>
                    <td>
                      {p.address}
                      <Button
                        size="sm"
                        className="ms-3"
                        variant={isExpanded ? "warning" : "info"}
                        onClick={() => setExpandedParentId(isExpanded ? null : p.id)}
                      >
                        {isExpanded ? "Hide Children" : "View Children"}
                      </Button>
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr>
                      <td colSpan={5}>
                        {p.children && p.children.length > 0 ? (
                          <Table striped bordered size="sm" variant="dark">
                            <thead>
                              <tr>
                                <th>#</th>
                                <th>First Name</th>
                                <th>Last Name</th>
                                <th>DOB</th>
                                <th>Gender</th>
                                <th>Class</th>
                                <th>Section</th>
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
                                  <td>{child.class}</td>
                                  <td>{child.section}</td>
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        ) : (
                          <div>No children available</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </Table>
      </Col>
    </Row>
  );
};

export default ManageParents;
