import React, { useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { IoCloseOutline } from 'react-icons/io5'; // Close icon
import styles from './Welcome.module.css'; // Use the same custom CSS module for modal styles

const AuthModal = ({ isOpen, onClose, isLogin, setIsLogin, API }) => {
    const [loginData, setLoginData] = useState({ email: '', password: '' });
    const [registerData, setRegisterData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'PARENT',
    });
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/login', loginData);
            const { token, role, teacherId, parentId } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (teacherId) {
                localStorage.setItem('teacherId', teacherId);
            }
            if (parentId) {
                localStorage.setItem('parentId', parentId);
            }
            onClose(); // Close modal on successful login
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TEACHER') navigate('/teacher');
            else if (role === 'PARENT') navigate('/parent');
        } catch (err) {
            alert('Login failed. Please check your credentials.');
            console.error(err);
        }
    };

    const handleRegisterSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await API.post('/auth/register', registerData);
            const { token, role, teacherId, parentId } = res.data;

            localStorage.setItem('token', token);
            localStorage.setItem('role', role);

            if (teacherId) {
                localStorage.setItem('teacherId', teacherId);
            }
            if (parentId) {
                localStorage.setItem('parentId', parentId);
            }
            onClose(); // Close modal on successful registration
            if (role === 'ADMIN') navigate('/admin');
            else if (role === 'TEACHER') navigate('/teacher');
            else if (role === 'PARENT') navigate('/parent');
        } catch (err) {
            alert('Registration failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <Modal show={isOpen} onHide={onClose} centered dialogClassName={styles.authModalDialog}>
            <Modal.Header className={`${styles.authModalHeader} border-0 pb-0`} closeButton>
                {/* Custom close button to control appearance */}
                <Button variant="link" onClick={onClose} className={`position-absolute top-0 end-0 m-3 p-1 ${styles.modalCloseButton}`}>
                    <IoCloseOutline size={32} />
                </Button>
            </Modal.Header>
            <Modal.Body className={`${styles.authModalBody} p-5 pt-0`}>
                <div className="d-flex justify-content-center mb-4">
                    <Button
                        variant={isLogin ? 'primary' : 'outline-secondary'}
                        className={`rounded-pill px-4 py-2 fw-bold me-3 ${styles.authToggleButton}`}
                        onClick={() => setIsLogin(true)}
                    >
                        Login
                    </Button>
                    <Button
                        variant={!isLogin ? 'primary' : 'outline-secondary'}
                        className={`rounded-pill px-4 py-2 fw-bold ${styles.authToggleButton}`}
                        onClick={() => setIsLogin(false)}
                    >
                        Register
                    </Button>
                </div>

                <h3 className={`text-center mb-4 text-white ${styles.authTitle}`}>
                    {isLogin ? 'Welcome Back!' : 'Join Skoolo Today!'}
                </h3>

                {isLogin ? (
                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={loginData.email}
                                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={loginData.password}
                                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Button type="submit" variant="primary" className={`w-100 py-2 fw-bold ${styles.submitButton}`}>
                            Login
                        </Button>
                    </Form>
                ) : (
                    <Form onSubmit={handleRegisterSubmit}>
                        <Form.Group className="mb-3">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>First Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={registerData.firstName}
                                onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Last Name</Form.Label>
                            <Form.Control
                                type="text"
                                value={registerData.lastName}
                                onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Email</Form.Label>
                            <Form.Control
                                type="email"
                                value={registerData.email}
                                onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Password</Form.Label>
                            <Form.Control
                                type="password"
                                value={registerData.password}
                                onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            />
                        </Form.Group>
                        <Form.Group className="mb-4">
                            <Form.Label className={`text-secondary ${styles.formLabel}`}>Role</Form.Label>
                            <Form.Select
                                value={registerData.role}
                                onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                                required
                                className={`${styles.formControlDark}`}
                            >
                                <option value="PARENT">Parent</option>
                                <option value="TEACHER">Teacher</option>
                                <option value="ADMIN">Admin</option>
                            </Form.Select>
                        </Form.Group>
                        <Button type="submit" variant="primary" className={`w-100 py-2 fw-bold ${styles.submitButton}`}>
                            Register
                        </Button>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default AuthModal;