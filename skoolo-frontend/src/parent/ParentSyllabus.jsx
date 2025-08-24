import React, { useEffect, useState } from 'react';
import API from '../services/api';
import ParentSidebar from './ParentSidebar';
import { FaFilePdf, FaEye, FaDownload } from 'react-icons/fa';
import './style/ParentSyllabus.css';

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
                showPreview: false 
              }))
            );
          } catch (err) {
            console.error(`Error fetching syllabus for student ${child.id}: ${err}`);
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

  const togglePreview = originalIndex => {
    setSyllabusList(prev =>
      prev.map((item, i) =>
        i === originalIndex ? { ...item, showPreview: !item.showPreview } : item
      )
    );
  };

  const getPreviewUrl = (url) =>
    `https://docs.google.com/gview?embedded=true&url=${encodeURIComponent(url)}`;

  if (loading) {
    return (
      <div className="syllabus-container">
        <ParentSidebar />
        <div className="syllabus-content">
          <div className="loading-state">
            <div className="loader"></div>
            <p>Loading syllabus...</p>
          </div>
        </div>
      </div>
    );
  }

  const groupedByStudent = syllabusList.reduce((acc, syllabus, idx) => {
    const key = syllabus.studentName;
    if (!acc[key]) acc[key] = [];
    acc[key].push({ ...syllabus, originalIndex: idx });
    return acc;
  }, {});

  return (
    <div className="syllabus-container">
      <ParentSidebar />
      <div className="syllabus-content">
        <h1 className="main-title">Children's Syllabus</h1>
        {syllabusList.length === 0 ? (
          <p className="no-data">No syllabus found for your children.</p>
        ) : (
          Object.entries(groupedByStudent).map(([studentName, syllabi]) => (
            <div key={studentName} className="student-group">
              <h2 className="student-name-title">{studentName}'s Syllabi</h2>
              <div className="syllabus-grid">
                {syllabi.map(({ originalIndex, ...syllabus }, i) => (
                  <div key={originalIndex} className="syllabus-card">
                    <div className="card-header">
                      <FaFilePdf size={24} className="pdf-icon" />
                      <div className="card-info">
                        <h3>{syllabus.subjectName}</h3>
                        <p>{syllabus.className} / {syllabus.sectionName}</p>
                      </div>
                    </div>
                    <div className="card-actions">
                      <button 
                        className="btn-action" 
                        onClick={() => togglePreview(originalIndex)}
                        aria-expanded={syllabus.showPreview}
                      >
                        <FaEye />
                        {syllabus.showPreview ? ' Hide Preview' : ' View Preview'}
                      </button>
                      <a 
                        href={syllabus.fileUrl} 
                        download 
                        className="btn-action"
                      >
                        <FaDownload />
                        Download
                      </a>
                    </div>
                    <div 
                      className={`preview-section ${syllabus.showPreview ? 'expanded' : ''}`}
                    >
                      {syllabus.showPreview && (
                        <iframe
                          src={getPreviewUrl(syllabus.fileUrl)}
                          title={`Syllabus for ${syllabus.subjectName}`}
                          allowFullScreen
                          loading="lazy"
                        ></iframe>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ParentSyllabus;