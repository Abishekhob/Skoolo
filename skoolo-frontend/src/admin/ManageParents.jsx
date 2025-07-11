import React, { useEffect, useState } from 'react';
import { Row, Col, Form, Button, Alert, Table } from 'react-bootstrap';
import AdminSidebar from './AdminSideBar';
import API from '../services/api';

const ManageParents = () => {
  const [parent, setParent] = useState({
    firstName: '', lastName: '', email: '', contactNumber: '', address: ''
  });
  const [message, setMessage] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [parents, setParents] = useState([]);
  const [expandedParentId, setExpandedParentId] = useState(null);
  const [uploadFile, setUploadFile] = useState(null);

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

  return (
    <Row className="g-0">
      <AdminSidebar />
      <Col md={10} className="text-white p-4 min-vh-100" style={{ backgroundColor: '#0d1117' }}>
        <h3 className="mb-4">Manage Parents</h3>

        {message && <Alert variant="info">{message}</Alert>}

     <div className="mb-4 d-flex justify-content-between align-items-start flex-wrap gap-3">
  <Button
    variant={showForm ? "secondary" : "success"}
    onClick={() => setShowForm(!showForm)}
  >
    {showForm ? "Close Form" : "➕ Add Parent"}
  </Button>

    <div
    onDrop={(e) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && /\.(csv|xlsx?|xls)$/i.test(file.name)) {
        setUploadFile(file);
      } else {
        setMessage('Only .csv or .xlsx/.xls files are supported.');
      }
    }}
    onDragOver={(e) => e.preventDefault()}
    onClick={() => document.getElementById('fileInput').click()}
    style={{
      border: '2px dashed #aaa',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      backgroundColor: '#1e1e1e',
      borderRadius: '8px',
      color: '#ccc',
      maxWidth: '400px',
      flexGrow: 1
    }}
  >
    <p>
      <strong>Drag and drop Excel/CSV file here</strong><br />
      <small>or click to upload</small>
    </p>

    {uploadFile && (
      <>
        <p className="text-info">Selected: {uploadFile.name}</p>
        <Button
          variant="info"
          size="sm"
          className="mt-2"
          onClick={handleFileUpload}
        >
          Upload
        </Button>
      </>
    )}

    <input
      id="fileInput"
      type="file"
      accept=".csv,.xlsx,.xls"
      style={{ display: 'none' }}
      onChange={(e) => {
        const file = e.target.files[0];
        if (file && /\.(csv|xlsx?|xls)$/i.test(file.name)) {
          setUploadFile(file);
        } else {
          setMessage('Only .csv or .xlsx/.xls files are supported.');
        }
      }}
    />
  </div>

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
            {Array.isArray(parents) && parents.map((p, i) => {
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
