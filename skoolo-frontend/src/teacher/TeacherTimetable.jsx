import React, { useEffect, useState } from 'react';
import { Table, Container, Row, Col, Spinner, Alert, Card, OverlayTrigger, Tooltip, Button } from 'react-bootstrap';
import { FaCalendarAlt, FaToggleOn, FaToggleOff, FaChalkboard, FaBookOpen, FaClock, FaExclamationCircle } from 'react-icons/fa';
import TeacherSidebar from './TeacherSidebar';
import API from '../services/api';
import styles from './style/TeacherTimetable.module.css'; // Import CSS Modules

const TeacherTimetable = () => {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'cards'
  const teacherId = localStorage.getItem('teacherId');

  useEffect(() => {
    const fetchTimetable = async () => {
      setLoading(true);
      setError('');
      if (!teacherId) {
        setError('Teacher ID not found. Please log in.');
        setLoading(false);
        return;
      }
      try {
        const res = await API.get(`/teacher/${teacherId}/timetable`);
        setTimetable(res.data);
        if (res.data.length === 0) {
          setError('No timetable data found for your classes.');
        }
      } catch (err) {
        console.error("Failed to load timetable:", err);
        setError('Failed to load timetable. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimetable();
  }, [teacherId]);

  // Define the desired order of days
  const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  // Sort unique days according to the predefined order
  const days = [...new Set(timetable.map(e => e.dayOfWeek))]
    .sort((a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b));

  // Unique periods sorted numerically
  const periods = [...new Set(timetable.map(e => e.period))].sort((a, b) => parseInt(a) - parseInt(b));

  // Create map for (day, period) → multiple class/subject/time entries
  const timetableMap = {};
  timetable.forEach(({ dayOfWeek, period, subjectName, className, sectionName, startTime, endTime }) => {
    const key = `${dayOfWeek}-${period}`;
    if (!timetableMap[key]) timetableMap[key] = [];
    timetableMap[key].push({
      subjectName,
      classSection: `${className}-${sectionName}`,
      startTime,
      endTime,
    });
  });

  const getCurrentDay = () => {
    const date = new Date();
    const dayIndex = date.getDay(); // 0 for Sunday, 1 for Monday, etc.
    return dayOrder[dayIndex === 0 ? 6 : dayIndex - 1]; // Map to our dayOrder (Monday is 0 for us)
  };

  const currentDay = getCurrentDay();

  return (
    <div className="d-flex" style={{ minHeight: '100vh', overflowX: 'hidden' }}>
      <TeacherSidebar />
      <Container fluid className={`${styles.mainContent} p-4`}>
        <div className={styles.headerContainer}>
          <h3 className={styles.pageTitle}>
            <FaCalendarAlt className="me-2" /> My Timetable
          </h3>
          <div className={styles.viewToggle}>
            <Button
              variant="link"
              className={`${styles.toggleButton} ${viewMode === 'table' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('table')}
            >
              {viewMode === 'table' ? <FaToggleOn className="me-2" /> : <FaToggleOff className="me-2" />}
              Table View
            </Button>
            <Button
              variant="link"
              className={`${styles.toggleButton} ${viewMode === 'cards' ? styles.activeToggle : ''}`}
              onClick={() => setViewMode('cards')}
            >
              {viewMode === 'cards' ? <FaToggleOn className="me-2" /> : <FaToggleOff className="me-2" />}
              Card View
            </Button>
          </div>
        </div>

        {loading && (
          <div className={styles.loadingContainer}>
            <Spinner animation="border" variant="primary" className={styles.loadingSpinner} />
            <p className={styles.loadingText}>Loading your timetable...</p>
          </div>
        )}

        {error && (
          <Alert variant="danger" className={styles.errorAlert}>
            <FaExclamationCircle className="me-2" /> {error}
          </Alert>
        )}

        {!loading && !error && timetable.length === 0 && (
          <Alert variant="info" className={styles.infoAlert}>
            <FaExclamationCircle className="me-2" /> No timetable entries found for your assigned classes.
          </Alert>
        )}

        {!loading && !error && timetable.length > 0 && (
          <>
            {viewMode === 'table' && (
              <div className={styles.tableWrapper}>
                <Table striped bordered hover variant="dark" responsive className={styles.timetableTable}>
                  <thead className={styles.tableHead}>
                    <tr>
                      <th className={styles.dayColHeader}>Day</th>
                      {periods.map(period => (
                        <th key={period} className={styles.periodColHeader}>{period} Period</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      <tr key={day} className={day === currentDay ? styles.currentDayRow : ''}>
                        <td className={styles.dayCell}>{day}</td>
                        {periods.map(period => {
                          const key = `${day}-${period}`;
                          const entries = timetableMap[key];
                          const cellTooltipContent = entries
                            ? entries.map(e => `${e.classSection}: ${e.startTime} - ${e.endTime}`).join('\n')
                            : 'No class scheduled';

                          return (
                            <OverlayTrigger
                              key={key}
                              placement="top"
                              overlay={
                                <Tooltip id={`tooltip-${key}`} className={styles.customTooltip}>
                                  <pre className={styles.tooltipPre}>{cellTooltipContent}</pre>
                                </Tooltip>
                              }
                            >
                              <td className={styles.timetableCell}>
                                {entries && entries.length > 0 ? (
                                  entries.map((entry, idx) => (
                                    <div key={idx} className={styles.cellEntry}>
                                      <div className={styles.classSection}>{entry.classSection}</div>
                                      <div className={styles.subjectName}>{entry.subjectName}</div>
                                    </div>
                                  ))
                                ) : (
                                  <span className={styles.emptyCell}>-</span>
                                )}
                              </td>
                            </OverlayTrigger>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}

            {viewMode === 'cards' && (
              <div className={styles.cardsGrid}>
                {days.map(day => (
                  <Card key={day} className={`${styles.dayCard} ${day === currentDay ? styles.currentDayCard : ''}`}>
                    <Card.Header className={styles.cardHeader}>
                      <h5>{day}</h5>
                    </Card.Header>
                    <Card.Body className={styles.cardBody}>
                      {periods.map(period => {
                        const key = `${day}-${period}`;
                        const entries = timetableMap[key];
                        return (
                          <div key={period} className={styles.periodBlock}>
                            <h6 className={styles.periodTitle}>{period} Period</h6>
                            {entries && entries.length > 0 ? (
                              entries.map((entry, idx) => (
                                <div key={idx} className={styles.cardEntry}>
                                  <p className={styles.cardClassSection}><FaChalkboard /> {entry.classSection}</p>
                                  <p className={styles.cardSubjectName}><FaBookOpen /> {entry.subjectName}</p>
                                  <p className={styles.cardTime}><FaClock /> {entry.startTime} - {entry.endTime}</p>
                                </div>
                              ))
                            ) : (
                              <p className={styles.emptyCardEntry}>No class</p>
                            )}
                          </div>
                        );
                      })}
                    </Card.Body>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </Container>
    </div>
  );
};

export default TeacherTimetable;