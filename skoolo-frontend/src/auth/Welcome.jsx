import React, { useState } from 'react';
import { Container, Row, Col, Button, Form, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';
import './style/WelcomeStyle.css'; // custom styles

const Welcome = () => {
  const [isLogin, setIsLogin] = useState(true);
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
      const { token, role, teacherId, parentId } = res.data; // destructure all needed
  
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
  
      if (teacherId) {
        localStorage.setItem('teacherId', teacherId);
      }
      if (parentId) {
        localStorage.setItem('parentId', parentId);
      }
  
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'TEACHER') navigate('/teacher');
      else if (role === 'PARENT') navigate('/parent');
    } catch (err) {
      alert('Login failed');
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
  
      if (role === 'ADMIN') navigate('/admin');
      else if (role === 'TEACHER') navigate('/teacher');
      else if (role === 'PARENT') navigate('/parent');
    } catch (err) {
      alert('Registration failed');
      console.error(err);
    }
  };
  

  return (
    <Container
      fluid
      className="d-flex flex-column align-items-center justify-content-center github-bg"
      style={{ minHeight: '100vh' }}
    >
      <div className="mb-4 d-flex">
        <Button
          className={`me-2 ${isLogin ? 'button-gh' : 'button-outline-gh'}`}
          onClick={() => setIsLogin(true)}
        >
          Login
        </Button>
        <Button
          className={`${!isLogin ? 'button-gh' : 'button-outline-gh'}`}
          onClick={() => setIsLogin(false)}
        >
          Register
        </Button>
      </div>

      <Row>
        <Col>
          <Card
            className="card-gh p-4 shadow"
            style={{ width: '32rem' }}
          >
            <h3 className="text-center mb-4" style={{ color: '#f0f6fc' }}>
              {isLogin ? 'Login' : 'Register'}
            </h3>

            {isLogin ? (
              <Form onSubmit={handleLoginSubmit}>
                <Form.Group className="mb-3">
                 <Form.Label className="label-gh">Email</Form.Label>
                  <Form.Control
                    type="text"
                    value={loginData.email}
                    onChange={(e) =>
                      setLoginData({ ...loginData, email: e.target.value })
                    }
                    required
                    className="input-gh"
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="label-gh">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={loginData.password}
                    onChange={(e) =>
                      setLoginData({ ...loginData, password: e.target.value })
                    }
                    required
                    className="input-gh"
                  />
                </Form.Group>
                <Button type="submit" className="button-gh w-100">
                  Login
                </Button>
              </Form>
            ) : (
              <Form onSubmit={handleRegisterSubmit}>
  <Form.Group className="mb-3">
    <Form.Label className="label-gh">First Name</Form.Label>
    <Form.Control
      type="text"
      value={registerData.firstName}
      onChange={(e) =>
        setRegisterData({ ...registerData, firstName: e.target.value })
      }
      required
      className="input-gh"
    />
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label className="label-gh">Last Name</Form.Label>
    <Form.Control
      type="text"
      value={registerData.lastName}
      onChange={(e) =>
        setRegisterData({ ...registerData, lastName: e.target.value })
      }
      required
      className="input-gh"
    />
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label className="label-gh">Email</Form.Label>
    <Form.Control
      type="email"
      value={registerData.email}
      onChange={(e) =>
        setRegisterData({ ...registerData, email: e.target.value })
      }
      required
      className="input-gh"
    />
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label className="label-gh">Password</Form.Label>
    <Form.Control
      type="password"
      value={registerData.password}
      onChange={(e) =>
        setRegisterData({ ...registerData, password: e.target.value })
      }
      required
      className="input-gh"
    />
  </Form.Group>
  <Form.Group className="mb-3">
    <Form.Label className="label-gh">Role</Form.Label>
    <Form.Select
      value={registerData.role}
      onChange={(e) =>
        setRegisterData({ ...registerData, role: e.target.value })
      }
      required
      className="input-gh"
    >
      <option value="PARENT">Parent</option>
      <option value="TEACHER">Teacher</option>
      <option value="ADMIN">Admin</option>
    </Form.Select>
  </Form.Group>
  <Button type="submit" className="button-gh w-100">
    Register
  </Button>
</Form>

            )}
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Welcome;
