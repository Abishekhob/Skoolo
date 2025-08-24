import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MdOutlineAccessTime,
  MdOutlineCheckCircleOutline,
  MdOutlineCancel,
  MdOutlineFilePresent,
} from "react-icons/md";
import API from "../services/api";
import ParentSidebar from "./ParentSidebar";
import "./style/ParentServiceRequestsPage.css";

const requestTypes = [
  "FEE_RECEIPT",
  "TRANSFER_CERTIFICATE",
  "ID_CARD_REPLACEMENT",
  "BUS_ROUTE_CHANGE",
  "BONAFIDE_CERTIFICATE",
  "OTHER",
];

const ParentServiceRequestsPage = () => {
  const [requestType, setRequestType] = useState("");
  const [customRequest, setCustomRequest] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requests, setRequests] = useState([]);
  const [parentId, setParentId] = useState(null);
  const [activeRequest, setActiveRequest] = useState(null);

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

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <MdOutlineAccessTime size={20} />;
      case "APPROVED":
        return <MdOutlineCheckCircleOutline size={20} />;
      case "REJECTED":
        return <MdOutlineCancel size={20} />;
      default:
        return null;
    }
  };

  return (
    <div className="app-container">
      <ParentSidebar />
      <main className="content-container">
        <h1 className="main-heading">Service Requests</h1>
        <section className="form-section">
          <motion.form
            onSubmit={handleSubmit}
            className="request-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="section-heading">Submit New Request</h2>
            <div className="form-group">
              <label>Request Type</label>
              <select
                className="input-field"
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
              <div className="form-group">
                <label>Custom Request</label>
                <input
                  type="text"
                  className="input-field"
                  value={customRequest}
                  onChange={(e) => setCustomRequest(e.target.value)}
                  required
                />
              </div>
            )}
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                className="input-field"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                className="input-field"
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              ></textarea>
            </div>
            <motion.button
              type="submit"
              className="submit-btn"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Submit Request
            </motion.button>
          </motion.form>
        </section>

        <section className="requests-section">
          <h2 className="section-heading">My Recent Requests</h2>
          <div className="requests-grid">
            {requests.length === 0 ? (
              <p className="no-requests-message">You have no requests yet.</p>
            ) : (
              requests.map((req) => (
                <motion.div
                  key={req.id}
                  className="request-card"
                  onClick={() =>
                    setActiveRequest(activeRequest === req.id ? null : req.id)
                  }
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  whileHover={{ y: -5, boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}
                >
                  <div className="card-header">
                    <span className={`status-pill ${req.status.toLowerCase()}`}>
                      {getStatusIcon(req.status)} {req.status}
                    </span>
                    <h3 className="card-title">{req.title}</h3>
                  </div>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: activeRequest === req.id ? "auto" : 0,
                      opacity: activeRequest === req.id ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="card-details"
                  >
                    <p className="card-text">{req.description}</p>
                    <div className="card-meta">
                      <p>
                        <strong>Type:</strong>{" "}
                        {req.requestType.replace(/_/g, " ")}
                      </p>
                      {req.adminRemarks && (
                        <p>
                          <strong>Remarks:</strong> {req.adminRemarks}
                        </p>
                      )}
                      {(req.status === "APPROVED" ||
                        req.status === "REJECTED") &&
                        req.documentUrl && (
                          <motion.button
                            className="document-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDocument(req);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                          >
                            <MdOutlineFilePresent size={18} /> View Document
                          </motion.button>
                        )}
                    </div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ParentServiceRequestsPage;