import React, { useState, useEffect } from 'react';
import API from '../services/api';

const ParentServiceRequestsPage = () => {
  const [requestType, setRequestType] = useState('FEE_RECEIPT');
  const [customRequest, setCustomRequest] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requests, setRequests] = useState([]);
  const [parentId, setParentId] = useState(null);

  const requestTypes = [
    'FEE_RECEIPT',
    'TRANSFER_CERTIFICATE',
    'ID_CARD_REPLACEMENT',
    'BUS_ROUTE_CHANGE',
    'BONAFIDE_CERTIFICATE',
    'OTHER'
  ];

  useEffect(() => {
    // Read parentId from localStorage when component mounts
    const storedParentId = localStorage.getItem('parentId');
    if (storedParentId) {
      setParentId(storedParentId);
    } else {
      // handle missing parentId, e.g. redirect to login or show error
      console.error('Parent ID not found in localStorage');
    }
  }, []);

  useEffect(() => {
    if (parentId) {
      API.get(`/service-requests/parent/${parentId}`)
        .then(res => setRequests(res.data))
        .catch(err => console.error(err));
    }
  }, [parentId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!parentId) {
      alert('Parent ID not found. Cannot submit request.');
      return;
    }
    const payload = {
      parent: { id: Number(parentId) },  // make sure it's a number
      requestType,
      customRequest: requestType === 'OTHER' ? customRequest : null,
      title,
      description
    };
    API.post('/service-requests', payload)
      .then(() => {
        alert('Request submitted');
        setTitle('');
        setDescription('');
        setCustomRequest('');
        setRequestType('FEE_RECEIPT');
        return API.get(`/service-requests/parent/${parentId}`);
      })
      .then(res => setRequests(res.data))
      .catch(err => console.error(err));
  };

  return (
    <div className="container mt-4">
      <h2>Service Requests</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="mb-3">
          <label>Request Type</label>
          <select
            className="form-control"
            value={requestType}
            onChange={(e) => setRequestType(e.target.value)}
          >
            {requestTypes.map(type => (
              <option key={type} value={type}>{type.replace(/_/g, ' ')}</option>
            ))}
          </select>
        </div>

        {requestType === 'OTHER' && (
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

        <button type="submit" className="btn btn-primary">Submit Request</button>
      </form>

      <h4>My Requests</h4>
      <table className="table table-bordered">
        <thead>
          <tr>
            <th>Title</th>
            <th>Type</th>
            <th>Status</th>
            <th>Remarks</th>
          </tr>
        </thead>
        <tbody>
          {requests.map(req => (
            <tr key={req.id}>
              <td>{req.title}</td>
              <td>{req.requestType.replace(/_/g, ' ')}</td>
              <td>{req.status}</td>
              <td>{req.adminRemarks || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ParentServiceRequestsPage;
