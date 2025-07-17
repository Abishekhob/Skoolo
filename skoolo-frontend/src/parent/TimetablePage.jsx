// TimetablePage.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api"; // Ensure this path is correct
import ParentSidebar from "./ParentSidebar"; // Ensure this path is correct
import { Spinner } from "react-bootstrap"; // Using Spinner, but replacing Table with custom CSS for better dark mode control
import "./style/TimetablePage.css"; // Import the new CSS file for styling

const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
const periods = ["1", "2", "3", "4", "5", "6", "7", "8"];

const periodTimes = {
  "1": "09:00 - 09:45",
  "2": "09:45 - 10:30",
  "3": "10:45 - 11:30",
  "4": "11:30 - 12:15",
  "5": "01:00 - 01:45",
  "6": "01:45 - 02:30",
  "7": "02:30 - 03:15",
  "8": "03:15 - 04:00",
};

const TimetablePage = () => {
  const parentId = localStorage.getItem("parentId");
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");


 useEffect(() => {
  if (!parentId) {
    setError("Parent ID not found.");
    setLoading(false);
    return;
  }

  API.get(`/parents/${parentId}/timetable`)
    .then((res) => {
      const data = res.data || {};
      const entries = data.timetable || [];

      // Organize timetable into a nested structure
      const organized = {};
      days.forEach((day) => {
        organized[day] = {};
        periods.forEach((period) => {
          organized[day][period] = null;
        });
      });

      entries.forEach((entry) => {
        if (organized[entry.dayOfWeek] && entry.period) {
          organized[entry.dayOfWeek][entry.period] = entry;
        }
      });

      // Set values
      setTimetable(organized);
      setStudentName(data.studentName || "N/A");
      setClassName(entries[0]?.className || "N/A");   // Extract from first entry
      setSectionName(entries[0]?.sectionName || "N/A");
      setLoading(false);
    })
    .catch((err) => {
      console.error("Error fetching timetable:", err);
      setError("Failed to load timetable.");
      setLoading(false);
    });
}, [parentId]);



  if (loading) {
    return (
      <div className="timetable-wrapper">
        <ParentSidebar />
        <div className="main-content loading-state">
          <Spinner animation="border" variant="light" /> {/* Spinner for dark background */}
          <p className="loading-text">Loading timetable...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timetable-wrapper">
        <ParentSidebar />
        <div className="main-content error-state">
          <p className="error-text">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="timetable-wrapper">
      <ParentSidebar />
      <div className="main-content timetable-content">
        <h2 className="timetable-heading">
          <span role="img" aria-label="books">📚</span> Timetable
        </h2>

        {/* Student Information Card */}
        <div className="student-info-card">
          <div className="info-item">
            <span className="info-label">Student:</span>
            <span className="info-value">{studentName}</span>
          </div>
         <div className="info-item">
  <span className="info-label">Class:</span>
  <span className="info-value">{`${className}-${sectionName}`}</span>
</div>

        </div>


        <div className="timetable-responsive-container">
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="day-period-header">Day / Period</th>
                {periods.map((period) => (
                  <th key={period}>
                    {period} <br /> <small className="period-time">{periodTimes[period]}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="day-name">{day.charAt(0) + day.slice(1).toLowerCase()}</td>
                  {periods.map((period) => {
                    const entry = timetable[day][period];
                    return (
                      <td key={period} className="timetable-cell">
                        {entry ? (
                          <>
                            <div className="subject-name">{entry.subjectName}</div>
                            <div className="teacher-name">{entry.teacherName}</div>
                          </>
                        ) : (
                          <div className="no-subject">Free</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TimetablePage;