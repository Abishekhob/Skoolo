import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Card, Spinner } from 'react-bootstrap';
import ParentSidebar from './ParentSidebar';
import API from '../services/api';
import styles from './style/FeesPage.module.css'; // CORRECTED IMPORT: Notice .module.css

const FeesPage = () => {
  const [fees, setFees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parentId = localStorage.getItem("parentId");

    API.get(`/parents/fees/${parentId}`)
      .then(res => {
        setFees(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching fees", err);
        setLoading(false);
      });
  }, []);

  return (
    <div className={styles.feesPageContainer}>
      <ParentSidebar />

      <div className={styles.contentArea}>
        <Container fluid className={styles.mainContent}>
          <Row>
            <Col>
              <h3 className={`mb-4 ${styles.pageTitle}`}>Fee Details</h3>
              {loading ? (
                <div className={styles.spinnerContainer}>
                  <Spinner animation="border" variant="light" />
                </div>
              ) : fees.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No fee details found.</p>
                </div>
              ) : (
                <Card className={styles.feesCard}>
                  <Card.Body>
                    <Table striped bordered hover responsive className={styles.feesTable}>
                      <thead>
                        <tr>
                          <th>Fee Type</th>
                          <th>Amount</th>
                          <th>Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {fees.map((fee) => (
                          <tr key={fee.id}>
                            {/* FIX: Ensure no whitespace *between* <td> tags or after closing <td> and before opening <td> */}
                            <td>{fee.feeType}</td><td><span className={styles.currencySymbol}>₹</span>{fee.amount}</td><td>{fee.dueDate}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default FeesPage;