// ClassesGrid.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Spinner, Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../services/api'; // Assuming this path is correct
import AdminSidebar from './AdminSidebar'; // Assuming this path is correct

// Dnd-Kit Imports
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Icons
import { MdDragIndicator } from "react-icons/md";
import { FaPlusCircle } from "react-icons/fa";

// Import the CSS file for this page
import './style/ClassesGrid.css';

// --- Updated Component for Sortable Item ---
const SortableClassCard = ({ cls, onClick, onEdit, onDelete }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: cls.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 0,
    opacity: isDragging ? 0.8 : 1,
    // Apply a stronger shadow when dragging for better visual feedback
    boxShadow: isDragging ? '0 15px 30px rgba(0,0,0,0.7)' : '0 8px 20px rgba(0,0,0,0.4)',
    backgroundColor: isDragging ? 'var(--card-drag-bg)' : 'var(--card-bg)',
  };

  return (
    // Adjusted column sizes for better responsiveness:
    // xs={6}: 2 cards per row on extra small (mobile)
    // sm={6}: 2 cards per row on small
    // md={4}: 3 cards per row on medium (tablets)
    // lg={3}: 4 cards per row on large (laptops/desktops)
    // Removed `d-flex` from Col, the Card itself handles flex for content, and `mb-4` is sufficient for spacing.
    <Col xs={6} sm={6} md={4} lg={3} xxl={3} className="mb-4">
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          height: '200px', // Consistent height
          borderRadius: '15px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: 'none',
        }}
        className="text-white shadow classes-grid-card"
      >
        {/* Drag Handle */}
        <div
          {...listeners}
          {...attributes}
          className="drag-handle"
        >
          <MdDragIndicator className="drag-icon" />
        </div>

        <Card.Body
          className="d-flex flex-column justify-content-center align-items-center text-center flex-grow-1 card-content-body"
          onClick={() => onClick(cls.id)}
        >
          <Card.Title className="class-card-title">{cls.className}</Card.Title>
          <Card.Text className="class-card-text">Total Sections: {cls.sections?.length || 0}</Card.Text>
        </Card.Body>

        <Card.Footer className="card-footer-actions d-flex justify-content-around">
          <Button
            variant="warning"
            size="sm"
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(cls);
            }}
          >
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            className="card-action-btn"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(cls);
            }}
          >
            Delete
          </Button>
        </Card.Footer>
      </Card>
    </Col>
  );
};

// The rest of your ClassesGrid component remains the same
const ClassesGrid = () => {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [className, setClassName] = useState('');
  const [sections, setSections] = useState(['']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [classToDelete, setClassToDelete] = useState(null);

  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fetchClasses = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await API.get('/classes');
      if (Array.isArray(res.data)) {
        // Ensure classes are sorted by position from the API or default to 0
        const sortedClasses = [...res.data].sort((a, b) => (a.position || 0) - (b.position || 0));
        setClasses(sortedClasses);
      } else {
        setClasses([]);
        console.warn("API returned non-array data for classes:", res.data);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
      setError("Failed to load classes. Please try again.");
      setClasses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleClick = (classId) => {
    navigate(`/admin/classes/${classId}`);
  };

  const handleAddSectionField = () => {
    setSections([...sections, '']);
  };

  const handleRemoveSectionField = (indexToRemove) => {
    setSections(sections.filter((_, index) => index !== indexToRemove));
  };

  const handleSectionChange = (index, value) => {
    const updatedSections = [...sections];
    updatedSections[index] = value;
    setSections(updatedSections);
  };

  const handleEditClass = (cls) => {
    setEditingClass(cls);
    setClassName(cls.className);
    setSections(cls.sections && cls.sections.length > 0 ? cls.sections.map(s => s.sectionName) : ['']);
    setShowAddForm(true);
    setError('');
    setSuccess('');
  };

  const handleDeleteClick = (cls) => {
    setClassToDelete(cls);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteClass = async () => {
    if (!classToDelete) return;
    setLoading(true); // Show loading spinner during deletion
    setError('');
    setSuccess('');
    try {
      await API.delete(`/classes/${classToDelete.id}`);
      setSuccess(`Class "${classToDelete.className}" deleted successfully.`);
      setShowDeleteConfirm(false);
      setClassToDelete(null);
      fetchClasses(); // Re-fetch classes to update the list
    } catch (err) {
      console.error('Error deleting class:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete class. Please try again.');
    } finally {
      setLoading(false); // Hide loading spinner
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const classSections = sections.filter((s) => s.trim() !== '').map(s => s.trim());

    const classData = {
      className,
      sections: classSections
    };

    if (!classData.className.trim()) {
      setError("Class name cannot be empty.");
      return;
    }
    if (classData.sections.length === 0) {
      setError("At least one section is required.");
      return;
    }

    try {
      let res;
      if (editingClass) {
        res = await API.put(`/classes/${editingClass.id}`, classData);
        setSuccess(`Class "${res.data.className}" updated successfully!`);
      } else {
        res = await API.post('/classes', classData);
        setSuccess(`Class "${res.data.className}" and its sections added successfully!`);
      }

      await fetchClasses(); // Refresh classes after add/edit
      setClassName('');
      setSections(['']);
      setEditingClass(null);
      setShowAddForm(false);
    } catch (err) {
      console.error('Error saving class:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to save class. Please try again.');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = classes.findIndex(cls => cls.id === active.id);
    const newIndex = classes.findIndex(cls => cls.id === over.id);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newClasses = Array.from(classes);
      const [movedItem] = newClasses.splice(oldIndex, 1);
      newClasses.splice(newIndex, 0, movedItem);

      // Optimistic update
      setClasses(newClasses);

      try {
        const updatedPositions = newClasses.map((cls, index) => ({
          id: cls.id,
          position: index,
        }));
        await API.put('/classes/reorder', updatedPositions);
        setSuccess('Class order updated successfully!');
      } catch (err) {
        console.error('Failed to save new class order:', err.response?.data || err.message);
        setError('Failed to save class order. Please try again.');
        fetchClasses(); // Revert to original order if save fails
      }
    }
  };

  if (loading) {
    return (
      <div
        className="loading-overlay"
      >
        <Spinner animation="border" variant="light" />
        <p className="loading-text">Loading Classes...</p>
      </div>
    );
  }

  return (
    <Container fluid className="classes-grid-container">
      <Row className="flex-grow-1">
        <AdminSidebar />
        <Col md={10} className="main-content-area p-4">
          <h3 className="page-title mb-4">
            {showAddForm && editingClass ? `✏️ Edit Class: ${editingClass.className}` : '📚 Select a Class'}
          </h3>

          {error && <Alert variant="danger" className="mb-3 custom-alert">{error}</Alert>}
          {success && <Alert variant="success" className="mb-3 custom-alert">{success}</Alert>}

          {showAddForm ? ( // Only show the form when explicitly requested
            <div className="form-centered-container">
              <Card className="form-card">
                <Card.Body>
                  <h4 className="mb-4 text-center form-card-title">
                    {editingClass ? 'Edit Class & Sections' : 'Add New Class & Sections'}
                  </h4>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="className" className="mb-3">
                      <Form.Label className="form-label-custom">Class Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter class name (e.g., 10th Grade)"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className="form-control-custom"
                      />
                    </Form.Group>

                    <Form.Label className="form-label-custom">Sections</Form.Label>
                    {sections.map((section, index) => (
                      <div key={index} className="d-flex mb-2 align-items-center">
                        <Form.Control
                          type="text"
                          placeholder={`Section ${index + 1} (e.g., A, B, Science)`}
                          value={section}
                          onChange={(e) => handleSectionChange(index, e.target.value)}
                          className="form-control-custom me-2"
                        />
                        {sections.length > 1 && (
                          <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveSectionField(index)}
                            className="section-remove-btn"
                          >
                            -
                          </Button>
                        )}
                      </div>
                    ))}

                    <div className="d-flex justify-content-between mb-3 mt-3">
                      <Button variant="outline-light" size="sm" onClick={handleAddSectionField} className="add-section-btn">
                        <FaPlusCircle className="me-1" /> Add Section
                      </Button>
                      {/* Always show back button when in form mode and there are classes or editing */}
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        onClick={() => {
                          setShowAddForm(false);
                          setEditingClass(null);
                          setClassName('');
                          setSections(['']);
                          setError('');
                          setSuccess('');
                        }}
                        className="back-btn"
                      >
                        Back to Classes
                      </Button>
                    </div>

                    <Button variant="primary" type="submit" className="w-100 submit-form-btn">
                      {editingClass ? 'Update Class' : 'Save Class & Sections'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            // Show the grid with existing classes and the "Add New Class" card
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                // Important: Include all IDs in the sortable context, even if 'Add New Class' isn't sortable
                // We'll manage its static position visually.
                items={classes.map(cls => cls.id)} // Only sortable items here
                strategy={verticalListSortingStrategy}
              >
                {/* Use g-4 for slightly more gutter space, justify-content-center for centering */}
                <Row className="g-4 classes-grid-row justify-content-center">
                  {/* Render existing class cards first */}
                  {classes.map((cls) => (
                    <SortableClassCard
                      key={cls.id}
                      cls={cls}
                      onClick={handleClick}
                      onEdit={handleEditClass}
                      onDelete={handleDeleteClick}
                    />
                  ))}

                  {/* Add New Class Card - NOW AT THE END OF THE GRID */}
                  {/* Note: This card is intentionally NOT part of the SortableContext items
                      because it's a fixed "add" button, not a draggable class item itself. */}
                  <Col xs={6} sm={6} md={4} lg={3} xxl={3} className="mb-4">
                    <Card
                      className="add-class-card shadow"
                      onClick={() => {
                        setShowAddForm(true);
                        setEditingClass(null);
                        setClassName('');
                        setSections(['']);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      <Card.Body className="text-center d-flex flex-column justify-content-center align-items-center">
                        <FaPlusCircle className="add-class-icon mb-2" />
                        <Card.Title className="add-class-title">Add New Class</Card.Title>
                        <Card.Text className="add-class-text">Click to create a new class</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </SortableContext>
            </DndContext>
          )}

          {/* Delete Confirmation Modal */}
          <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered backdrop="static" keyboard={false} className="custom-modal">
            <Modal.Header className="modal-header-custom">
              <Modal.Title className="modal-title-custom">Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="modal-body-custom">
              Are you sure you want to delete the class "<strong>{classToDelete?.className}</strong>"? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer className="modal-footer-custom">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)} className="modal-cancel-btn">
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteClass} className="modal-delete-btn">
                Delete
              </Button>
            </Modal.Footer>
          </Modal>

        </Col>
      </Row>
    </Container>
  );
};

export default ClassesGrid;