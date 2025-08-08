import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Modal, Form } from "react-bootstrap";
import API from "../services/api";

const AdminServiceRequestsPage = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const [modalShow, setModalShow] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("APPROVED");
  const [adminRemarks, setAdminRemarks] = useState("");
  const [file, setFile] = useState(null);

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

  const openModal = (request, status) => {
    setSelectedRequest(request);
    setSelectedStatus(status);
    setAdminRemarks("");
    setFile(null);
    setModalShow(true);
  };

  const updateStatus = async (id, status, remarks, document) => {
    try {
      const formData = new FormData();
      formData.append("status", status);
      formData.append("adminRemarks", remarks || "");
      if (document) {
        formData.append("document", document);
      }

      await API.put(`/service-requests/${id}/status`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      fetchRequests();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const handleModalSave = () => {
    updateStatus(selectedRequest.id, selectedStatus, adminRemarks, file);
    setModalShow(false);
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
            <th>Children</th>
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
              <td colSpan="8" className="text-center">
                No service requests
              </td>
            </tr>
          ) : (
            requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.parent?.fullName || "-"}</td>
                <td>
                  {req.parent?.children && req.parent.children.length > 0
                    ? req.parent.children
                        .map((child) => `${child.firstName} ${child.lastName}`)
                        .join(", ")
                    : "-"}
                </td>
                <td>{req.requestType.replace(/_/g, " ")}</td>
                <td>{req.description}</td>
                <td>{req.status}</td>
                <td>{new Date(req.createdAt).toLocaleDateString()}</td>
                <td>
                  {req.status !== "APPROVED" && (
                    <Button
                      size="sm"
                      variant="success"
                      className="me-2"
                      onClick={() => openModal(req, "APPROVED")}
                    >
                      Approve
                    </Button>
                  )}
                  {req.status !== "REJECTED" && (
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => openModal(req, "REJECTED")}
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

      {/* Modal for remarks + file upload */}
      <Modal show={modalShow} onHide={() => setModalShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {selectedStatus === "APPROVED" ? "Approve Request" : "Reject Request"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Admin Remarks (optional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={adminRemarks}
              onChange={(e) => setAdminRemarks(e.target.value)}
              placeholder="Add remarks for this action"
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Upload Document (optional, max 10MB)</Form.Label>
            <Form.Control
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              onChange={(e) => setFile(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setModalShow(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleModalSave}>
            {selectedStatus === "APPROVED" ? "Approve" : "Reject"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminServiceRequestsPage;
