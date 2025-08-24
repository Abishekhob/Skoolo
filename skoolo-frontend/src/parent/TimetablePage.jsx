// TimetablePage.jsx
import React, { useEffect, useState } from "react";
import API from "../services/api"; 
import ParentSidebar from "./ParentSidebar"; 
import { Spinner } from "react-bootstrap";
import "./style/TimetablePage.css"; 

const TimetablePage = () => {
  const parentId = localStorage.getItem("parentId");
  const [timetable, setTimetable] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [studentName, setStudentName] = useState("");
  const [className, setClassName] = useState("");
  const [sectionName, setSectionName] = useState("");
  const [days, setDays] = useState([]);
  const [periods, setPeriods] = useState([]);
  const [periodTimes, setPeriodTimes] = useState({});

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

        if (!entries.length) {
          setError("No timetable available.");
          setLoading(false);
          return;
        }

        // Dynamically extract unique days & periods from API
        const uniqueDays = [...new Set(entries.map((e) => e.dayOfWeek))];
        const uniquePeriods = [...new Set(entries.map((e) => e.period))].sort(
          (a, b) => parseInt(a) - parseInt(b)
        );

        // Build period time mapping dynamically
        const periodMapping = {};
        entries.forEach((e) => {
          if (e.period && e.startTime && e.endTime) {
            periodMapping[e.period] = `${e.startTime} - ${e.endTime}`;
          }
        });

        // Organize timetable structure
        const organized = {};
        uniqueDays.forEach((day) => {
          organized[day] = {};
          uniquePeriods.forEach((period) => {
            organized[day][period] = null;
          });
        });

        entries.forEach((entry) => {
          if (organized[entry.dayOfWeek] && entry.period) {
            organized[entry.dayOfWeek][entry.period] = entry;
          }
        });

        // Set state
        setTimetable(organized);
        setDays(uniqueDays);
        setPeriods(uniquePeriods);
        setPeriodTimes(periodMapping);
        setStudentName(data.studentName || "N/A");
        setClassName(entries[0]?.className || "N/A");
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
          <Spinner animation="border" variant="light" />
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

        {/* Student Info */}
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

        {/* Timetable */}
        <div className="timetable-responsive-container">
          <table className="timetable-table">
            <thead>
              <tr>
                <th className="day-period-header">Day / Period</th>
                {periods.map((period) => (
                  <th key={period}>
                    {period} <br />
                    <small className="period-time">{periodTimes[period]}</small>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day}>
                  <td className="day-name">{day}</td>
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
