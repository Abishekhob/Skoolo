import React, { useEffect, useState } from 'react';
import API from '../services/api';

const ParentSyllabus = () => {
  const [syllabusList, setSyllabusList] = useState([]);
  const [loading, setLoading] = useState(true);
  const parentId = localStorage.getItem('parentId'); // Parent ID stored in localStorage

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        // 1. Get children of parent
        const childrenRes = await API.get(`/parents/${parentId}/children`);
        const children = childrenRes.data;

        let allSyllabi = [];

        // 2. For each child, get their syllabus
        for (const child of children) {
          const syllabusRes = await API.get(`/syllabus/student/${child.id}`);
          allSyllabi.push(...syllabusRes.data.map(s => ({ ...s, studentName: child.name })));
        }

        setSyllabusList(allSyllabi);
      } catch (error) {
        console.error("Error fetching syllabus:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSyllabus();
  }, [parentId]);

  if (loading) return <p>Loading syllabus...</p>;

  return (
    <div className="container mt-4">
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
    </div>
  );
};

export default ParentSyllabus;
