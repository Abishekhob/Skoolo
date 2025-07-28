import React, { useEffect, useState, useCallback } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Collapse, Spinner, Alert } from 'react-bootstrap';
import API from '../services/api';
import AdminSidebar from './AdminSidebar';
import { FaMoneyBillAlt, FaPlus, FaChevronDown, FaChevronUp, FaEye, FaEyeSlash } from 'react-icons/fa';
import './style/ManageFeesPage.css';

const ManageFeesPage = () => {
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [feeType, setFeeType] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [fees, setFees] = useState([]);
  const [expandedFeeId, setExpandedFeeId] = useState(null);
  const [studentPaymentStatus, setStudentPaymentStatus] = useState([]);
  const [showAddFeeForm, setShowAddFeeForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info'); // 'success', 'danger', 'info'

  // Fetch Classes
  useEffect(() => {
    API.get('/admin/classes')
      .then(res => setClasses(res.data))
      .catch(err => {
        console.error('Failed to fetch classes', err);
        setMessage('Failed to load classes. Please try again.');
        setMessageType('danger');
      });
  }, []);

  // Fetch Sections based on selected Class
  useEffect(() => {
    if (selectedClassId) {
      API.get(`/admin/classes/${selectedClassId}/sections`)
        .then(res => {
          const sectionArray = Array.isArray(res.data) ? res.data : [];
          setSections(sectionArray);
        })
        .catch(err => {
          console.error('Failed to fetch sections', err);
          setMessage('Failed to load sections. Please try again.');
          setMessageType('danger');
          setSections([]);
        });
    } else {
      setSections([]); // Clear sections if no class is selected
    }
  }, [selectedClassId]);

  // Fetch All Fees
  const fetchFees = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/fees');
      setFees(res.data);
      setMessage('');
    } catch (err) {
      console.error('Failed to fetch fees', err);
      setMessage('Failed to load fees. Please try again.');
      setMessageType('danger');
      setFees([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFees();
  }, [fetchFees]);

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

  // Toggle Fee Payment Status
  const fetchFeePaymentStatus = useCallback(async (fee) => {
    if (expandedFeeId === fee.id) {
      setExpandedFeeId(null);
      setStudentPaymentStatus([]);
    } else {
      setExpandedFeeId(fee.id);
      try {
        const res = await API.get(`/fees/${fee.id}/payments`);
        setStudentPaymentStatus(res.data);
      } catch (err) {
        console.error('Failed to fetch payment status', err);
        setMessage('Failed to load payment status. Please try again.');
        setMessageType('danger');
        setStudentPaymentStatus([]);
      }
    }
  }, [expandedFeeId]);

  // Handle Add Fee
  const handleAddFee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!selectedClassId || !feeType || !amount || !dueDate) {
      setMessage('Please fill in all required fields (Class, Fee Type, Amount, Due Date).');
      setMessageType('danger');
      setLoading(false);
      return;
    }

    const payload = {
      feeType,
      amount: parseFloat(amount),
      dueDate,
      classEntity: { id: selectedClassId },
      section: selectedSectionId ? { id: selectedSectionId } : null,
    };

    try {
      await API.post('/fees', payload);
      setMessage('Fee added successfully!');
      setMessageType('success');
      fetchFees();
      // Reset form fields
      setSelectedClassId('');
      setSelectedSectionId('');
      setFeeType('');
      setAmount('');
      setDueDate('');
      setShowAddFeeForm(false);
    } catch (err) {
      console.error('Failed to add fee', err);
      setMessage(err.response?.data?.message || 'Failed to add fee. Please check input data.');
      setMessageType('danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="d-flex admin-layout-container">
      <AdminSidebar />

      {/* Changed Container to a regular div and applied flex-grow for proper layout */}
      <div className="main-content-wrapper"> 
        <Container fluid className="main-content-area py-4 px-lg-5 px-3">
          <h3 className="section-title mb-4">
            <FaMoneyBillAlt className="me-2 icon-lg" /> Manage Fees
          </h3>

          {message && <Alert variant={messageType} className="custom-alert fade-in-down">{message}</Alert>}

          {/* Add New Fee Toggle Button */}
          <Button
            variant={showAddFeeForm ? "secondary" : "primary"}
            onClick={() => setShowAddFeeForm(!showAddFeeForm)}
            className="add-fee-toggle-btn mb-4"
          >
            {showAddFeeForm ? "Hide Add Fee Form" : <><FaPlus className="me-2" /> Add New Fee</>}
          </Button>

          {/* Add New Fee Form (Collapsible) */}
          <Collapse in={showAddFeeForm}>
            <div className="add-fee-form-container mb-4">
              <Card className="add-fee-card">
                <Card.Body>
                  <Card.Title className="card-title-custom mb-3">Add New Fee Details</Card.Title>
                  <Form onSubmit={handleAddFee}>
                    <Row className="mb-3">
                      <Col md={6} className="mb-3 mb-md-0">
                        <Form.Group controlId="selectClass">
                          <Form.Label className="form-label-custom">Class <span className="text-danger">*</span></Form.Label>
                          <Form.Select
                            className="form-control-custom"
                            onChange={e => setSelectedClassId(e.target.value)}
                            value={selectedClassId}
                            required
                          >
                            <option value="">Select Class</option>
                            {classes.map(cls => (
                              <option key={cls.id} value={cls.id}>{cls.className}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={6}>
                        <Form.Group controlId="selectSection">
                          <Form.Label className="form-label-custom">Section (Optional)</Form.Label>
                          <Form.Select
                            className="form-control-custom"
                            onChange={e => setSelectedSectionId(e.target.value)}
                            value={selectedSectionId}
                            disabled={!selectedClassId || sections.length === 0}
                          >
                            <option value="">{selectedClassId ? (sections.length > 0 ? 'Select Section' : 'No sections for this class') : 'Select Class First'}</option>
                            {sections.map(sec => (
                              <option key={sec.id} value={sec.id}>{sec.sectionName}</option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col md={4} className="mb-3 mb-md-0">
                        <Form.Group controlId="inputFeeType">
                          <Form.Label className="form-label-custom">Fee Type <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            className="form-control-custom"
                            placeholder="e.g., Tuition Fee, Sports Fee"
                            value={feeType}
                            onChange={e => setFeeType(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4} className="mb-3 mb-md-0">
                        <Form.Group controlId="inputAmount">
                          <Form.Label className="form-label-custom">Amount <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="number"
                            className="form-control-custom"
                            placeholder="e.g., 5000"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            required
                            min="0"
                          />
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group controlId="inputDueDate">
                          <Form.Label className="form-label-custom">Due Date <span className="text-danger">*</span></Form.Label>
                          <Form.Control
                            type="date"
                            className="form-control-custom"
                            value={dueDate}
                            onChange={e => setDueDate(e.target.value)}
                            required
                          />
                        </Form.Group>
                      </Col>
                    </Row>
                    <Button variant="primary" type="submit" disabled={loading} className="submit-fee-btn">
                      {loading ? <Spinner as="span" animation="border" size="sm" aria-hidden="true" /> : <><FaPlus className="me-2" /> Add Fee</>}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          </Collapse>

          <h5 className="sub-section-title mb-3">📋 Existing Fees</h5>

          {loading && fees.length === 0 ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="light" role="status" className="initial-loading-spinner" />
              <p className="text-light mt-3">Loading fees...</p>
            </div>
          ) : fees.length === 0 ? (
            <Alert variant="info" className="text-center custom-alert-info">
              No fees found. Add new fees using the form above.
            </Alert>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="table-responsive d-none d-lg-block">
                <Table striped bordered hover variant="dark" className="fees-table">
                  <thead>
                    <tr>
                      <th>Fee Type</th>
                      <th>Amount</th>
                      <th>Due Date</th>
                      <th>Class</th>
                      <th>Section</th>
                      <th className="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {fees.map(fee => (
                      <React.Fragment key={fee.id}>
                        <tr>
                          <td>{fee.feeType}</td>
                          <td>${fee.amount}</td>
                          <td>{fee.dueDate}</td>
                          <td>{fee.classEntity?.className || 'N/A'}</td>
                          <td>{fee.section?.sectionName || 'All Sections'}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-info"
                              size="sm"
                              onClick={() => fetchFeePaymentStatus(fee)}
                              className="view-payments-btn"
                            >
                              {expandedFeeId === fee.id ? (
                                <><FaEyeSlash className="me-1" /> Hide Payments</>
                              ) : (
                                <><FaEye className="me-1" /> View Payments</>
                              )}
                            </Button>
                          </td>
                        </tr>
                        {/* Collapsible Row for Payment Status */}
                        <tr>
                          <td colSpan={6} className="p-0 border-0">
                            <Collapse in={expandedFeeId === fee.id}>
                              <div>
                                <Card className="payment-status-card-nested">
                                  <Card.Body>
                                    <h6 className="mb-3 text-center nested-card-title">
                                      Payment Status for: **{fee.feeType}** (Class: {fee.classEntity?.className}, Section: {fee.section?.sectionName || 'All'})
                                    </h6>
                                    {studentPaymentStatus.length > 0 ? (
                                      <Table striped bordered size="sm" variant="dark" className="student-payment-table-nested">
                                        <thead>
                                          <tr>
                                            <th>Student ID</th>
                                            <th>Name</th>
                                            <th>Status</th>
                                            <th>Payment Date</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {studentPaymentStatus.map(s => (
                                            <tr key={s.studentId}>
                                              <td>{s.studentId}</td>
                                              <td>{s.studentName}</td>
                                              <td className={s.paid ? 'text-success' : 'text-danger'}>
                                                {s.paid ? '✅ Paid' : '❌ Not Paid'}
                                              </td>
                                              <td>{s.paymentDate || '-'}</td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </Table>
                                    ) : (
                                      <p className="text-center text-muted m-0">No payment records found for this fee.</p>
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
              <div className="d-lg-none mobile-fee-card-list">
                {fees.map(fee => (
                  <Card key={fee.id} className="fee-mobile-card mb-3">
                    <Card.Body>
                      <Card.Title className="mobile-card-title mb-2">
                        <span className="fee-type-badge">{fee.feeType}</span>
                      </Card.Title>
                      <ul className="list-unstyled mobile-fee-details">
                        <li><strong>Amount:</strong> ${fee.amount}</li>
                        <li><strong>Due Date:</strong> {fee.dueDate}</li>
                        <li><strong>Class:</strong> {fee.classEntity?.className || 'N/A'}</li>
                        <li><strong>Section:</strong> {fee.section?.sectionName || 'All Sections'}</li>
                      </ul>
                      <Button
                        size="sm"
                        variant="outline-info"
                        onClick={() => fetchFeePaymentStatus(fee)}
                        className="w-100 mt-2 view-payments-btn-mobile"
                      >
                        {expandedFeeId === fee.id ? (
                          <><FaEyeSlash className="me-1" /> Hide Payments</>
                        ) : (
                          <><FaEye className="me-1" /> View Payments</>
                        )}
                      </Button>
                      <Collapse in={expandedFeeId === fee.id}>
                        <div className="mt-3">
                          <Card className="payment-status-card-nested mobile-payment-card">
                            <Card.Body className="p-2">
                               <h6 className="text-center nested-card-title-mobile mb-2">Payment Details</h6>
                              {studentPaymentStatus.length > 0 ? (
                                studentPaymentStatus.map(s => (
                                  <div key={s.studentId} className="student-payment-item p-2 mb-2 rounded">
                                    <p className="mb-1"><strong>ID:</strong> {s.studentId} | <strong>Name:</strong> {s.studentName}</p>
                                    <small className="d-block">
                                      Status: <span className={s.paid ? 'text-success fw-bold' : 'text-danger fw-bold'}>
                                        {s.paid ? '✅ Paid' : '❌ Not Paid'}
                                      </span> | Date: {s.paymentDate || '-'}
                                    </small>
                                  </div>
                                ))
                              ) : (
                                <p className="text-center text-muted m-0">No payment records found.</p>
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
        </Container>
      </div>
    </div>
  );
};

export default ManageFeesPage;