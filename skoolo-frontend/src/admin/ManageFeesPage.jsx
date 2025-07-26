import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table } from 'react-bootstrap';
import API from '../services/api';
import AdminSidebar from './AdminSidebar';
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

  useEffect(() => {
    API.get('/admin/classes').then(res => setClasses(res.data));
  }, []);

  useEffect(() => {
    if (selectedClassId) {
      API.get(`/admin/classes/${selectedClassId}/sections`).then(res => {
        const sectionArray = Array.isArray(res.data) ? res.data : [];
        setSections(sectionArray);
      });
    }
  }, [selectedClassId]);

  const fetchFeePaymentStatus = (fee) => {
    if (expandedFeeId === fee.id) {
      // Clicking the same row closes it
      setExpandedFeeId(null);
      setStudentPaymentStatus([]);
    } else {
      setExpandedFeeId(fee.id);
      API.get(`/fees/${fee.id}/payments`).then(res => {
        setStudentPaymentStatus(res.data);
      });
    }
  };

  const handleAddFee = () => {
    const payload = {
      feeType,
      amount,
      dueDate,
      classEntity: { id: selectedClassId },
      section: selectedSectionId ? { id: selectedSectionId } : null,
    };

    API.post('/fees', payload).then(() => {
      fetchFees();
      setFeeType('');
      setAmount('');
      setDueDate('');
    });
  };

  const fetchFees = () => {
    API.get('/fees').then(res => setFees(res.data));
  };

  useEffect(() => {
    fetchFees();
  }, []);

  return (
    <div className="d-flex">
      <AdminSidebar />

      <Container fluid className="main-fee-container text-white py-4 px-5" style={{ minHeight: '100vh' }}>
        <h3 className="mb-4">💰 Manage Fees</h3>

        <Row className="mb-4">
          <Col md={3} className="mb-2">
            <Form.Group controlId="selectClass">
              <Form.Label>Class</Form.Label>
              <Form.Select
                className="bg-dark text-white border-secondary"
                onChange={e => setSelectedClassId(e.target.value)}
                value={selectedClassId}
              >
                <option value="">Select Class</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.className}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={3} className="mb-2">
            <Form.Group controlId="selectSection">
              <Form.Label>Section</Form.Label>
              <Form.Select
                className="bg-dark text-white border-secondary"
                onChange={e => setSelectedSectionId(e.target.value)}
                value={selectedSectionId}
              >
                <option value="">Select Section</option>
                {sections.map(sec => (
                  <option key={sec.id} value={sec.id}>{sec.sectionName}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>

          <Col md={2} className="mb-2">
            <Form.Group controlId="inputFeeType">
              <Form.Label>Fee Type</Form.Label>
              <Form.Control
                className="bg-dark text-white border-secondary"
                placeholder="Fee Type"
                value={feeType}
                onChange={e => setFeeType(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2} className="mb-2">
            <Form.Group controlId="inputAmount">
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                className="bg-dark text-white border-secondary"
                placeholder="Amount"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </Form.Group>
          </Col>

          <Col md={2} className="mb-2">
            <Form.Group controlId="inputDueDate">
              <Form.Label>Due Date</Form.Label>
              <Form.Control
                type="date"
                className="bg-dark text-white border-secondary"
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
              />
            </Form.Group>
          </Col>
        </Row>

        <Button variant="outline-light" className="mb-4" onClick={handleAddFee}>
          ➕ Add Fee
        </Button>

        <h5>📋 Existing Fees</h5>
        <Table striped bordered hover variant="dark" className="mt-3">
          <thead>
            <tr>
              <th>Fee Type</th>
              <th>Amount</th>
              <th>Due Date</th>
              <th>Class</th>
              <th>Section</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.map(fee => (
              <React.Fragment key={fee.id}>
                <tr>
                  <td>{fee.feeType}</td>
                  <td>{fee.amount}</td>
                  <td>{fee.dueDate}</td>
                  <td>{fee.className || fee.classId}</td>
                  <td>{fee.sectionName || 'All Sections'}</td>
                  <td>
                    <Button
                      variant="outline-info"
                      size="sm"
                      onClick={() => fetchFeePaymentStatus(fee)}
                    >
                      {expandedFeeId === fee.id ? 'Hide Payments' : 'View Payments'}
                    </Button>
                  </td>
                </tr>
                {expandedFeeId === fee.id && (
                  <tr>
                    <td colSpan={6}>
                      <h6>
                        Payment Status for Class: <strong>{fee.className || fee.classId}</strong>{' '}
                        Section: <strong>{fee.sectionName || 'All Sections'}</strong>
                      </h6>
                      <Table striped bordered hover variant="dark" className="mt-3 mb-0">
                        <thead>
                          <tr>
                            <th>Student ID</th>
                            <th>Name</th>
                            <th>Status</th>
                            <th>Payment Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {studentPaymentStatus.length === 0 && (
                            <tr>
                              <td colSpan={4} className="text-center">
                                No payment records found.
                              </td>
                            </tr>
                          )}
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
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </Table>
      </Container>
    </div>
  );
};

export default ManageFeesPage;
