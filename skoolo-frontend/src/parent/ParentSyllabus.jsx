import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ParentSidebar from './ParentSidebar';
import { Row, Col } from 'react-bootstrap';

const ParentSyllabus = () => {
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const parentId = localStorage.getItem('parentId');

 useEffect(() => {
  const fetchSyllabus = async () => {
    try {
      const childrenRes = await API.get(`/parents/${parentId}/children`);
      const children = childrenRes.data;

      

      let allSyllabi = [];

      for (const child of children) {
        try {
          const syllabusRes = await API.get(`/syllabus/student/${child.id}`);
          allSyllabi.push(
            ...syllabusRes.data.map(s => ({
              ...s,
             studentName: child.fullName || "Unknown Student",

              showPreview: false // Initialize preview state
            }))
          );
        } catch (err) {
          console.error(`403 error for student ${child.id} (${child.name})`);
        }
      }

      setSyllabusList(allSyllabi);
    } catch (error) {
      console.error("Error fetching syllabus:", error);
      alert("Unable to fetch syllabus. Please try again or contact support.");
    } finally {
      setLoading(false);
    }
  };

  if (parentId) {
    fetchSyllabus();
  } else {
    console.warn("No parent ID found in localStorage");
    setLoading(false);
  }
}, [parentId]);


  // Toggle preview state for the clicked syllabus by its index
  const togglePreview = index => {
    setSyllabusList(prev =>
      prev.map((item, i) =>
        i === index ? { ...item, showPreview: !item.showPreview } : item
      )
    );
  };

  // Group syllabus by studentName
  const groupedByStudent = syllabusList.reduce((acc, syllabus, idx) => {
    if (!acc[syllabus.studentName]) acc[syllabus.studentName] = [];
    // Also keep track of original index to handle preview toggle properly
    acc[syllabus.studentName].push({ ...syllabus, originalIndex: idx });
    return acc;
  }, {});

  if (loading) return <p className="p-4">Loading syllabus...</p>;

  // Helper function to convert raw URL to previewable PDF URL
const getPreviewUrl = (url) =>
  `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;



  return (
    <Row className="m-0">
      {/* Sidebar */}
      <Col md={3} className="p-0">
        <ParentSidebar />
      </Col>

      {/* Main content */}
      <Col md={9} className="p-4">
        <h3>Children's Syllabus</h3>

        {syllabusList.length === 0 ? (
          <p>No syllabus found.</p>
        ) : (
          Object.entries(groupedByStudent).map(([studentName, syllabi]) => (
            <div key={studentName} className="mb-4">
              <h4>{studentName}'s Syllabus</h4>
              <ul className="list-group">
                {syllabi.map(({ originalIndex, ...syllabus }, i) => (
                  <li key={originalIndex} className="list-group-item">
                    <div>
                      <strong>{syllabus.subjectName}</strong> - {syllabus.className} / {syllabus.sectionName}
                    </div>

                    {/* Toggle Button */}
                    <div className="mt-2">
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={() => togglePreview(originalIndex)}
                      >
                        {syllabus.showPreview ? 'Hide Preview' : 'Show Preview'}
                      </button>
                    </div>

               {/* Conditional PDF Preview */}
              {syllabus.showPreview && (
                <div className="mt-3">
                  <iframe
                    src={getPreviewUrl(syllabus.fileUrl)}
                    width="100%"
                    height="500px"
                    title={`Syllabus for ${syllabus.subjectName}`}
                    style={{ border: '1px solid #ccc', borderRadius: '5px' }}
                  ></iframe>
                </div>
              )}

              {/* Download + Open in New Tab */}
              <div className="mt-2">
                <a
                  href={syllabus.fileUrl}
                  download
                  className="btn btn-sm btn-success me-2"
                >
                  Download PDF
                </a>
                <a
                  href={getPreviewUrl(syllabus.fileUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-sm btn-primary"
                >
                  Open in New Tab
                </a>
              </div>

                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </Col>
    </Row>
  );
};

export default ParentSyllabus;
