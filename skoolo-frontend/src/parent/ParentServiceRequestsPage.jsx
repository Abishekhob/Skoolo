import React, { useState, useEffect } from "react";
import API from "../services/api";
import ParentSidebar from "./ParentSidebar"; // Import the sidebar
import { Row, Col } from "react-bootstrap";

const ParentServiceRequestsPage = () => {
  const [requestType, setRequestType] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState([]);
  const [parentId, setParentId] = useState(null);

  const requestTypes = [
    "FEE_RECEIPT",
    "TRANSFER_CERTIFICATE",
    "ID_CARD_REPLACEMENT",
    "BUS_ROUTE_CHANGE",
    "BONAFIDE_CERTIFICATE",
    "OTHER",
  ];

  useEffect(() => {
    const storedParentId = localStorage.getItem("parentId");
    if (storedParentId) {
      setParentId(storedParentId);
    } else {
      console.error("Parent ID not found in localStorage");
    }
  }, []);

  useEffect(() => {
    if (parentId) {
      fetchRequests();
    }
  }, [parentId]);

  const fetchRequests = () => {
    API.get(`/service-requests/parent/${parentId}`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parentId) {
      alert("Parent ID not found. Cannot submit request.");
      return;
    }
    const payload = {
      parent: { id: Number(parentId) },
      requestType,
      customRequest: requestType === "OTHER" ? customRequest : null,
      title,
      description,
    };
    API.post("/service-requests", payload)
      .then(() => {
        alert("Request submitted");
        setTitle("");
        setDescription("");
        setCustomRequest("");
        setRequestType("");
        fetchRequests();
      })
      .catch((err) => console.error(err));
  };

  const handleViewDocument = async (req) => {
    if (!req.documentUrl) return;

    try {
      await API.put(`/service-requests/${req.id}/mark-viewed`);
    } catch (err) {
      console.error("Error marking document as viewed:", err);
    }

    window.open(
      `https://docs.google.com/gview?url=${encodeURIComponent(
        req.documentUrl
      )}&embedded=true`,
      "_blank"
    );
  };

  return (
    <Row className="m-0">
      {/* Sidebar Column */}
      <Col md={3} className="p-0">
        <ParentSidebar />
      </Col>

      {/* Main Content Column */}
      <Col md={9} className="p-4" style={{ background: "#f9f9f9", minHeight: "100vh" }}>
        <h2>Service Requests</h2>

        {/* Request Form */}
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-3">
            <label>Request Type</label>
            <select
              className="form-control"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              required
            >
              <option value="">-- Select Request Type --</option>
              {requestTypes.map((type) => (
                <option key={type} value={type}>
                  {type.replace(/_/g, " ")}
                </option>
              ))}
            </select>
          </div>

          {requestType === "OTHER" && (
            <div className="mb-3">
              <label>Custom Request</label>
              <input
                type="text"
                className="form-control"
                value={customRequest}
                onChange={(e) => setCustomRequest(e.target.value)}
                required
              />
            </div>
          )}

          <div className="mb-3">
            <label>Title</label>
            <input
              type="text"
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="mb-3">
            <label>Description</label>
            <textarea
              className="form-control"
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          <button type="submit" className="btn btn-primary">
            Submit Request
          </button>
        </form>

        {/* Requests Table */}
        <h4>My Requests</h4>
        <table className="table table-bordered">
          <thead>
            <tr>
              <th>Title</th>
              <th>Type</th>
              <th>Status</th>
              <th>Remarks</th>
              <th>Document</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.title}</td>
                <td>{req.requestType.replace(/_/g, " ")}</td>
                <td>{req.status}</td>
                <td>{req.adminRemarks || "-"}</td>
                <td>
                  {(req.status === "APPROVED" || req.status === "REJECTED") &&
                  req.documentUrl ? (
                    <button
                      className="btn btn-link p-0"
                      onClick={() => handleViewDocument(req)}
                    >
                      View PDF
                    </button>
                  ) : (
                    "-"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Col>
    </Row>
  );
};

export default ParentServiceRequestsPage;
