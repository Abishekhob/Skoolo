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
            allSyllabi.push(...syllabusRes.data.map(s => ({ ...s, studentName: child.name })));
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

  if (loading) return <p className="p-4">Loading syllabus...</p>;

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
          <ul className="list-group">
            {syllabusList.map((syllabus, index) => (
              <li key={index} className="list-group-item">
                <div>
                  <strong>{syllabus.subjectName}</strong> - {syllabus.className} / {syllabus.sectionName}
                  <br />
                  <small>Child: {syllabus.studentName}</small>
                </div>
                <div className="mt-2">
                  <a
                    href={syllabus.syllabusUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm btn-primary"
                  >
                    View / Download
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Col>
    </Row>
  );
};

export default ParentSyllabus;
