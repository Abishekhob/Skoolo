import React, { useRef, useState } from 'react';
import { Table, Button, Accordion, Card, Row, Col } from 'react-bootstrap';
import './style/TimetableTable.css'; // New CSS file for TimetableTable specific styles

const TimetableTable = ({
  timetable,
  onFileUpload,
  onSaveEdit,
  onCellClick,
  showEditButton = true,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editableTimetable, setEditableTimetable] = useState([]);
  const dropRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleEditClick = () => {
    // Deep clone to prevent direct mutation of the original timetable prop
    setEditableTimetable(JSON.parse(JSON.stringify(timetable)));
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    onSaveEdit(editableTimetable); // Send to parent to call backend
  };

  const handleInputChange = (day, period, field, value) => {
    const updated = editableTimetable.map((entry) => {
      if (entry.dayOfWeek === day && entry.period === period) {
        return {
          ...entry,
          [field]: field === 'subject' ? { subjectName: value } : value,
        };
      }
      return entry;
    });
    setEditableTimetable(updated);
  };

  const dayOrder = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']; // Added Sunday for completeness
  const days = [...new Set(timetable.map((entry) => entry.dayOfWeek))].sort(
    (a, b) => dayOrder.indexOf(a) - dayOrder.indexOf(b)
  );

  // Render when timetable is empty
  if (!timetable || timetable.length === 0) {
    return (
      <div className="timetable-empty-state-container">
        <div className="timetable-empty-state-card shadow-lg">
          <h4 className="text-center mb-3">
            <span className="icon-large">📅</span> No Timetable Found
          </h4>
          <p className="text-center text-muted mb-4">
            It looks like there's no timetable set up yet. Upload a CSV or Excel file to get started.
          </p>

          <div className="text-center mb-4">
            <a href="/sample-timetable.xlsx" download className="btn btn-outline-primary btn-sm download-sample-btn">
              ⬇️ Download Sample Timetable File
            </a>
          </div>

          <div
            ref={dropRef}
            onDragOver={(e) => {
              e.preventDefault();
              dropRef.current.classList.add('drag-over');
            }}
            onDragLeave={() => dropRef.current.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              dropRef.current.classList.remove('drag-over');
              if (e.dataTransfer.files.length > 0) {
                onFileUpload(e.dataTransfer.files[0]);
              }
            }}
            onClick={() => fileInputRef.current.click()}
            className="timetable-upload-area text-center p-4 rounded"
          >
            <p className="fs-5 mb-1">
              <span className="icon-small">📤</span> Drag & Drop Timetable file here
            </p>
            <p className="mb-3">or click to upload from your system</p>
            <input
              type="file"
              accept=".csv, .xlsx, .xls"
              onChange={(e) => onFileUpload(e.target.files[0])}
              ref={fileInputRef}
              style={{ display: 'none' }}
            />
            <small className="text-muted d-block mb-3">
              Accepted formats: <strong>.csv, .xlsx, .xls</strong>
            </small>

            <div className="timetable-note-box text-start">
              <p className="mb-1">
                ⚠️ <strong>Note:</strong> Save the file using the exact format:
              </p>
              <div className="fw-bold mt-1">ClassName-SectionName.xlsx</div>
              <div className="fst-italic text-muted-custom">e.g., Grade 12-A.xlsx</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const periodMap = {};
  timetable.forEach((entry) => {
    periodMap[entry.period] = `${entry.startTime} - ${entry.endTime}`;
  });

  const sortedPeriods = Object.keys(periodMap).sort((a, b) => parseInt(a) - parseInt(b));
  const getTableData = isEditing ? editableTimetable : timetable;

  const timetableMap = {};
  days.forEach((day) => (timetableMap[day] = {}));
  getTableData.forEach((entry) => {
    timetableMap[entry.dayOfWeek][entry.period] = entry;
  });

  return (
    <div className="timetable-section">
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 timetable-header">
        <h4 className="mb-0 text-white">🗓️ Timetable Overview</h4>

        {showEditButton && (
          <div className="timetable-actions">
            {!isEditing ? (
              <Button variant="warning" onClick={handleEditClick} className="edit-btn">
                ✏️ Edit Timetable
              </Button>
            ) : (
              <>
                <Button variant="success" className="me-2 save-btn" onClick={handleSave}>
                  ✅ Save Changes
                </Button>
                <Button variant="secondary" onClick={handleCancel} className="cancel-btn">
                  ❌ Cancel
                </Button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Desktop Timetable View */}
      <div className="table-responsive d-none d-lg-block">
        <Table striped bordered hover variant="dark" className="timetable-table table-sm">
          <thead>
            <tr>
              <th className="day-col" rowSpan="2">
                Day
              </th>
              {sortedPeriods.map((period) => (
                <th key={period} className="period-col text-center">
                  {period}
                </th>
              ))}
            </tr>
            <tr>
              {sortedPeriods.map((period) => (
                <th key={period} className="time-range-col text-center">
                  <small>{periodMap[period]}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="day-name fw-bold">{day.charAt(0) + day.slice(1).toLowerCase()}</td>
                {sortedPeriods.map((period) => {
                  const entry = timetableMap[day][period];
                  const subject = entry?.subject?.subjectName || '';
                  const teacherName = entry?.teacher?.fullName || '';
                  const startTime = entry?.startTime || '';
                  const endTime = entry?.endTime || '';

                  return (
                    <td key={period} className="timetable-cell">
                      <div
                        className={`d-grid gap-1 ${onCellClick ? 'clickable-cell' : ''}`}
                        onClick={
                          onCellClick
                            ? () => onCellClick(day, period, entry?.subject, entry?.teacher?.id || '')
                            : undefined
                        }
                      >
                        {isEditing ? (
                          <>
                            <input
                              type="text"
                              className="form-control form-control-sm mb-1 timetable-input"
                              placeholder="Subject"
                              value={subject}
                              onChange={(e) =>
                                handleInputChange(day, period, 'subject', e.target.value)
                              }
                            />
                            <input
                              type="time"
                              className="form-control form-control-sm mb-1 timetable-input"
                              value={startTime}
                              onChange={(e) =>
                                handleInputChange(day, period, 'startTime', e.target.value)
                              }
                            />
                            <input
                              type="time"
                              className="form-control form-control-sm timetable-input"
                              value={endTime}
                              onChange={(e) =>
                                handleInputChange(day, period, 'endTime', e.target.value)
                              }
                            />
                          </>
                        ) : (
                          <div
                            className={`timetable-display-content ${
                              onCellClick ? 'bg-secondary text-white p-2 rounded' : ''
                            }`}
                          >
                            <div className="subject-name fw-bold">
                              {subject || <span className="text-muted-dark">No Subject</span>}
                            </div>
                            {teacherName && (
                              <div className="teacher-name text-info-custom">
                                {teacherName}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Mobile Timetable View (Accordion Cards) */}
      <div className="d-lg-none timetable-mobile-view">
        <Accordion defaultActiveKey={days[0]} alwaysOpen>
          {days.map((day) => (
            <Accordion.Item eventKey={day} key={day} className="mb-3 timetable-card-item">
              <Accordion.Header className="timetable-card-header">
                <span className="fw-bold">{day.charAt(0) + day.slice(1).toLowerCase()}</span>
              </Accordion.Header>
              <Accordion.Body className="timetable-card-body">
                {sortedPeriods.map((period) => {
                  const entry = timetableMap[day][period];
                  const subject = entry?.subject?.subjectName || '';
                  const teacherName = entry?.teacher?.fullName || '';
                  const startTime = entry?.startTime || '';
                  const endTime = entry?.endTime || '';

                  return (
                    <Card key={period} className="mb-2 timetable-period-card">
                      <Card.Body className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0 fw-bold text-primary-custom">Period {period}</h6>
                          <small className="text-muted">{periodMap[period]}</small>
                        </div>
                        {isEditing ? (
                          <div className="d-grid gap-2">
                            <input
                              type="text"
                              className="form-control form-control-sm timetable-input"
                              placeholder="Subject"
                              value={subject}
                              onChange={(e) =>
                                handleInputChange(day, period, 'subject', e.target.value)
                              }
                            />
                            <input
                              type="time"
                              className="form-control form-control-sm timetable-input"
                              value={startTime}
                              onChange={(e) =>
                                handleInputChange(day, period, 'startTime', e.target.value)
                              }
                            />
                            <input
                              type="time"
                              className="form-control form-control-sm timetable-input"
                              value={endTime}
                              onChange={(e) =>
                                handleInputChange(day, period, 'endTime', e.target.value)
                              }
                            />
                          </div>
                        ) : (
                          <div
                            className={`timetable-display-content ${
                              onCellClick ? 'bg-secondary text-white p-2 rounded clickable-card-content' : ''
                            }`}
                            onClick={
                                onCellClick
                                    ? () => onCellClick(day, period, entry?.subject, entry?.teacher?.id || '')
                                    : undefined
                            }
                          >
                            <div className="subject-name fw-bold">
                              {subject || <span className="text-muted-dark">No Subject</span>}
                            </div>
                            {teacherName && (
                              <div className="teacher-name text-info-custom">
                                {teacherName}
                              </div>
                            )}
                          </div>
                        )}
                      </Card.Body>
                    </Card>
                  );
                })}
              </Accordion.Body>
            </Accordion.Item>
          ))}
        </Accordion>
      </div>
    </div>
  );
};

export default TimetableTable;