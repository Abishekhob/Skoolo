import React, { useEffect, useState, useCallback } from 'react';
import { Card, Row, Col, Spinner, Container, Form, Button, Alert, Modal } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import AdminSidebar from './AdminSideBar';

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

// --- CORRECTED IMPORT FOR DRAG ICON ---
// Using MdDragIndicator from Material Design Icons, which is very common
import { MdDragIndicator } from "react-icons/md";
// If you prefer, you could also use a Font Awesome icon like FaGripVertical:
// import { FaGripVertical } from "react-icons/fa";

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
    zIndex: isDragging ? 10 : 0,
    opacity: isDragging ? 0.7 : 1,
    boxShadow: isDragging ? '0 8px 16px rgba(0,0,0,0.4)' : '0 4px 8px rgba(0,0,0,0.2)',
    backgroundColor: isDragging ? '#343a40' : '#495057',
  };

  return (
    <Col md={4} className="mb-4">
      <Card
        ref={setNodeRef}
        style={{
          ...style,
          height: '180px',
          borderRadius: '12px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
        className="text-white shadow"
      >
        {/* Drag Handle - A small area or icon for dragging */}
        <div
          {...listeners}
          {...attributes}
          style={{
            cursor: 'grab',
            padding: '5px 10px',
            backgroundColor: 'rgba(0,0,0,0.1)',
            textAlign: 'right',
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            touchAction: 'none',
          }}
        >
          {/* --- USING MdDragIndicator HERE --- */}
          <MdDragIndicator style={{ color: '#adb5bd', fontSize: '1.2rem' }} />
          {/* If you chose FaGripVertical, use it like this: */}
          {/* <FaGripVertical style={{ color: '#adb5bd', fontSize: '1.2rem' }} /> */}
        </div>

        <Card.Body
          className="d-flex flex-column justify-content-center text-center flex-grow-1"
          onClick={() => onClick(cls.id)}
          style={{ cursor: 'pointer', flex: 1 }}
        >
          <Card.Title style={{ fontSize: '1.5rem' }}>{cls.className}</Card.Title>
          <Card.Text>Total Sections: {cls.sections?.length || 0}</Card.Text>
        </Card.Body>

        <Card.Footer className="d-flex justify-content-around bg-dark border-top border-secondary">
          <Button
            variant="warning"
            size="sm"
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
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await API.delete(`/classes/${classToDelete.id}`);
      setSuccess(`Class "${classToDelete.className}" deleted successfully.`);
      setShowDeleteConfirm(false);
      setClassToDelete(null);
      fetchClasses();
    } catch (err) {
      console.error('Error deleting class:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Failed to delete class. Please try again.');
    } finally {
      setLoading(false);
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

      await fetchClasses();
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
        fetchClasses();
      }
    }
  };

  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center bg-black text-white"
        style={{ minHeight: '100vh' }}
      >
        <Spinner animation="border" variant="light" />
      </div>
    );
  }

  return (
    <Container fluid className="bg-black text-white min-vh-100">
      <Row>
        <AdminSidebar />
        <Col md={10} className="p-4">
          <h3 className="mb-4">
            {showAddForm && editingClass ? `✏️ Edit Class: ${editingClass.className}` : '📚 Select a Class'}
          </h3>

          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">{success}</Alert>}

          {showAddForm || classes.length === 0 ? (
            <div
              className="d-flex justify-content-center align-items-center"
              style={{ height: '80vh' }}
            >
              <Card className="bg-dark text-white p-4 shadow-lg" style={{ width: '100%', maxWidth: '500px', borderRadius: '15px' }}>
                <Card.Body>
                  <h4 className="mb-4 text-center">
                    {editingClass ? 'Edit Class & Sections' : 'Add New Class & Sections'}
                  </h4>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group controlId="className" className="mb-3">
                      <Form.Label>Class Name</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter class name (e.g., 10th Grade)"
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className="bg-secondary text-white border-0"
                      />
                    </Form.Group>

                    <Form.Label>Sections</Form.Label>
                    {sections.map((section, index) => (
                      <div key={index} className="d-flex mb-2">
                        <Form.Control
                          type="text"
                          placeholder={`Section ${index + 1} (e.g., A, B, Science)`}
                          value={section}
                          onChange={(e) => handleSectionChange(index, e.target.value)}
                          className="bg-secondary text-white border-0 me-2"
                        />
                        {sections.length > 1 && (
                          <Button
                            variant="outline-danger"
                            onClick={() => handleRemoveSectionField(index)}
                          >
                            -
                          </Button>
                        )}
                      </div>
                    ))}

                    <div className="d-flex justify-content-between mb-3">
                      <Button variant="outline-light" size="sm" onClick={handleAddSectionField}>
                        Add Section
                      </Button>
                      {(classes.length > 0 || editingClass) && (
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
                        >
                          Back to Classes
                        </Button>
                      )}
                    </div>

                    <Button variant="primary" type="submit" className="w-100">
                      {editingClass ? 'Update Class' : 'Save Class & Sections'}
                    </Button>
                  </Form>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={classes.map(cls => cls.id)}
                strategy={verticalListSortingStrategy}
              >
                <Row className="g-3">
                  {classes.map((cls) => (
                    <SortableClassCard
                      key={cls.id}
                      cls={cls}
                      onClick={handleClick}
                      onEdit={handleEditClass}
                      onDelete={handleDeleteClick}
                    />
                  ))}
                  <Col md={4} className="mb-4">
                    <Card
                      className="bg-dark text-white shadow"
                      style={{
                        cursor: 'pointer',
                        height: '180px',
                        borderRadius: '12px',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        border: '2px dashed #6c757d'
                      }}
                      onClick={() => {
                        setShowAddForm(true);
                        setEditingClass(null);
                        setClassName('');
                        setSections(['']);
                        setError('');
                        setSuccess('');
                      }}
                    >
                      <Card.Body className="text-center">
                        <Card.Title style={{ fontSize: '1.5rem' }}>+ Add New Class</Card.Title>
                        <Card.Text>Click to create a new class</Card.Text>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </SortableContext>
            </DndContext>
          )}

          <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)} centered backdrop="static" keyboard={false}>
            <Modal.Header className="bg-dark text-white border-bottom border-secondary">
              <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body className="bg-dark text-white">
              Are you sure you want to delete the class "<strong>{classToDelete?.className}</strong>"? This action cannot be undone.
            </Modal.Body>
            <Modal.Footer className="bg-dark border-top border-secondary">
              <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={confirmDeleteClass}>
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