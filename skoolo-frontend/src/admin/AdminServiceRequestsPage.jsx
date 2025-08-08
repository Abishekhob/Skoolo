import React, { useEffect, useState } from "react";
import { Table, Button, Spinner } from "react-bootstrap";
import API from "../services/api";

const AdminServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await API.get("/service-requests");
      setRequests(res.data);
    } catch (err) {
      console.error("Error fetching service requests:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/service-requests/${id}/status`, { status });
      fetchRequests(); // refresh after update
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  if (loading) {
    return <Spinner animation="border" className="mt-4" />;
  }

  return (
    <div className="p-3">
      <h3>Service Requests</h3>
      <Table striped bordered hover responsive>
        <thead>
          <tr>
            <th>ID</th>
            <th>Parent</th>
            <th>Request Type</th>
            <th>Description</th>
            <th>Status</th>
            <th>Submitted On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {requests.length === 0 ? (
            <tr>
              <td colSpan="7" className="text-center">No service requests</td>
            </tr>
          ) : (
            requests.map(req => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.parentName}</td>
                <td>{req.requestType}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  {req.status !== "APPROVED" && (
                    <Button 
                      size="sm" 
                      variant="success" 
                      className="me-2" 
                      onClick={() => updateStatus(req.id, "APPROVED")}
                    >
                      Approve
                    </Button>
                  )}
                  {req.status !== "REJECTED" && (
                    <Button 
                      size="sm" 
                      variant="danger" 
                      onClick={() => updateStatus(req.id, "REJECTED")}
                    >
                      Reject
                    </Button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default AdminServiceRequestsPage;
