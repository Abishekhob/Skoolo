import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

// Import Swiper React components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, Navigation, Autoplay, EffectFade } from 'swiper/modules';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import 'swiper/css/effect-fade';

// Import React Icons
import { FaLaptopCode, FaChalkboardTeacher, FaUserGraduate, FaCalendarAlt, FaChartBar, FaComments, FaTasks, FaShieldAlt, FaGithub, FaLinkedinIn, FaEnvelope, FaBolt, FaDatabase, FaLock, FaWifi, FaServer } from 'react-icons/fa';
import { MdOutlinePlayCircleFilled } from 'react-icons/md';

// Import custom CSS module
import styles from './style/Welcome.module.css';

// --- IMPORTANT: Placeholder Image URLs ---
const PLACEHOLDER_SCREENSHOTS = {
  login: '/screenshots/login.png',
  teacher: '/screenshots/teacher-dashboard.png',
  parent: '/screenshots/parent-dashboard.png',
  chat: '/screenshots/chat-interface.png',
  timetable: '/screenshots/timetable-view.png',
  marks: '/screenshots/marks-update.png',
};

// Import AuthModal component
import AuthModal from './AuthModal';

const Welcome = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isLoginState, setIsLoginState] = useState(true);
  const navigate = useNavigate();

  const openAuthModal = (isLogin) => {
    setIsLoginState(isLogin);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  useEffect(() => {
    const images = Object.values(PLACEHOLDER_SCREENSHOTS);
    images.forEach((image) => {
      const img = new Image();
      img.src = image;
    });
  }, []);

  const features = [
    { icon: FaUserGraduate, title: "Role-Based Dashboard", description: "Separate views for Admin, Teacher, and Parent." },
    { icon: FaCalendarAlt, title: "Timetable Management", description: "Teachers and parents can view period-wise schedules." },
    { icon: FaChartBar, title: "Marks & Attendance Updates", description: "Teachers update; parents track student performance live." },
    { icon: FaComments, title: "Real-Time Chat", description: "Teachers and parents can message instantly." },
    { icon: FaTasks, title: "Assignments & Instructions", description: "Teachers share homework and test details; parents get alerts." },
    { icon: FaShieldAlt, title: "Admin Panel", description: "Admin manages users, timetables, and school-wide notifications." },
  ];

  const screenshots = [
    { src: PLACEHOLDER_SCREENSHOTS.login, caption: "Login Screen: Secure access for all users." },
    { src: PLACEHOLDER_SCREENSHOTS.teacher, caption: "Teacher Dashboard: Manage classes, updates, and communication." },
    { src: PLACEHOLDER_SCREENSHOTS.parent, caption: "Parent Dashboard: Track child's progress and stay informed." },
    { src: PLACEHOLDER_SCREENSHOTS.chat, caption: "Chat Interface: Seamless real-time communication." },
    { src: PLACEHOLDER_SCREENSHOTS.timetable, caption: "Timetable View: Keep track of daily schedules effortlessly." },
    { src: PLACEHOLDER_SCREENSHOTS.marks, caption: "Marks Update: Teachers can easily input grades." },
  ];

  return (
    <div className={`bg-dark text-light ${styles.appContainer}`}>
      {/* Header / Navbar */}
      <header className={`fixed-top w-100 ${styles.navbar}`}>
        <Container fluid className="d-flex justify-content-between align-items-center py-3 px-4 px-md-5">
          <div className="d-flex align-items-center">
            <FaChalkboardTeacher className={`text-primary ${styles.logoIcon}`} />
            <h1 className={`mb-0 ms-2 text-white ${styles.appName}`}>Skoolo</h1>
          </div>
        </Container>
      </header>

      {/* Hero Section */}
      <section className={`d-flex align-items-center justify-content-center text-center ${styles.heroSection}`}>
        <div className={styles.heroBackgroundAnimation}>
          <div className={styles.spherePrimary}></div>
          <div className={styles.sphereAccent}></div>
        </div>
        <Container className={`position-relative z-1 p-4 ${styles.heroContent}`}>
          <h2 className={`display-3 fw-bold text-white mb-4 ${styles.heroTitle}`}>
            Skoolo – Connect Parents, Teachers & Students in Real-Time
          </h2>
          <p className={`lead text-light mb-5 ${styles.heroSubtitle}`}>
            Manage attendance, track marks, and enable real-time parent-teacher communication – all in one intuitive app.
          </p>
          <div className="d-flex flex-column flex-sm-row justify-content-center align-items-center gap-3">
            <Button
              onClick={() => openAuthModal(true)}
              variant="primary"
              className={`rounded-pill px-5 py-3 fs-5 shadow-lg ${styles.ctaButton}`}
            >
              <MdOutlinePlayCircleFilled className="me-2" />
              Login as Parent/Teacher
            </Button>
            <Button
              onClick={() => openAuthModal(false)}
              variant="secondary"
              className={`rounded-pill px-5 py-3 fs-5 shadow-lg ${styles.ctaButtonSecondary}`}
            >
              <FaLaptopCode className="me-2" />
              Register for Free
            </Button>
          </div>
        </Container>
      </section>

      <hr className={`my-5 ${styles.sectionDivider}`} />

      {/* Problem -> Solution Section */}
      <section className="py-5 px-3 px-md-5">
        <Container>
          <Row className="g-5">
            <Col lg={6}>
              <Card className={`p-4 h-100 shadow-lg border ${styles.problemCard}`}>
                <h3 className={`h2 fw-bold mb-4 d-flex align-items-center ${styles.problemTitle}`}>
                  <span className="me-3 fs-1">🛑</span> The Problem
                </h3>
                <ul className="list-unstyled mb-0 fs-5">
                  <li className="mb-3">Parents often lack real-time insights into school activities and their child's progress.</li>
                  <li className="mb-3">Teachers face challenges in efficiently updating marks, attendance, and distributing timely reminders.</li>
                  <li>Communication channels can be fragmented and inefficient, leading to missed information.</li>
                </ul>
              </Card>
            </Col>
            <Col lg={6}>
              <Card className={`p-4 h-100 shadow-lg border ${styles.solutionCard}`}>
                <h3 className={`h2 fw-bold mb-4 d-flex align-items-center ${styles.solutionTitle}`}>
                  <span className="me-3 fs-1">✅</span> Skoolo Solves It
                </h3>
                <ul className="list-unstyled mb-0 fs-5">
                  <li className="mb-3"><strong>Live Updates:</strong> Parents receive instant notifications for attendance, marks, and homework.</li>
                  <li className="mb-3"><strong>Integrated Chat:</strong> A dedicated, secure chat system for direct communication between teachers and parents.</li>
                  <li className="mb-3"><strong>Structured Timetables:</strong> Individual timetables and clear schedule visibility for everyone.</li>
                  <li><strong>Centralized Admin:</strong> Administrators manage users, classes, and school-wide timetables with ease.</li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      <hr className={`my-5 ${styles.sectionDivider}`} />

      {/* Features Section */}
      <section className="py-5 px-3 px-md-5">
        <Container className="text-center">
          <h2 className={`display-4 fw-bold text-white mb-5 ${styles.sectionTitle}`}>Key Features</h2>
          <Row className="g-4 justify-content-center">
            {features.map((feature, index) => (
              <Col md={6} lg={4} key={index}>
                <Card className={`p-4 h-100 d-flex flex-column align-items-center shadow-lg ${styles.featureCard}`}>
                  <feature.icon className={`mb-3 ${styles.featureIcon}`} />
                  <h3 className="h4 fw-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-secondary mb-0">{feature.description}</p>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </section>

      <hr className={`my-5 ${styles.sectionDivider}`} />

      {/* Screenshots Carousel / Demo */}
      <section className="py-5 px-3 px-md-5">
        <Container className="text-center">
          <h2 className={`display-4 fw-bold text-white mb-5 ${styles.sectionTitle}`}>App Walkthrough</h2>
          <div className={`p-4 rounded-3 shadow-lg ${styles.carouselContainer}`}>
            <Swiper
              effect={'fade'}
              fadeEffect={{ crossFade: true }}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={1}
              pagination={{ clickable: true }}
              navigation={true}
              modules={[EffectFade, Pagination, Navigation, Autoplay]}
              loop={true}
              autoplay={{ delay: 3500, disableOnInteraction: false }}
              className={`${styles.mySwiper}`}
              style={{
                '--swiper-pagination-color': 'var(--bs-primary)',
                '--swiper-navigation-color': 'var(--bs-primary)',
              }}
            >
              {screenshots.map((screen, index) => (
                <SwiperSlide key={index}>
                  <div className={`card ${styles.carouselSlideCard}`}>
                    <div className={styles.cardContent}>
                      <img
                        src={screen.src}
                        alt={screen.caption}
                        className={`img-fluid rounded shadow-lg ${styles.screenshotImage}`}
                      />
                      <p className={`fs-5 text-white fw-medium text-center ${styles.screenshotCaption}`}>{screen.caption}</p>
                    </div>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </Container>
      </section>

      <hr className={`my-5 ${styles.sectionDivider}`} />

      {/* Tech Stack Section */}
      <section className="py-5 px-3 px-md-5">
        <Container className="text-center">
          <h2 className={`display-4 fw-bold text-white mb-5 ${styles.sectionTitle}`}>Our Robust Tech Stack</h2>
          <Row className="g-4 justify-content-center">
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaLaptopCode className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">React.js & Vite</p>
              <span className="text-secondary text-sm">Frontend</span>
            </Col>
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaServer className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">Spring Boot</p>
              <span className="text-secondary text-sm">Backend</span>
            </Col>
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaDatabase className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">PostgreSQL</p>
              <span className="text-secondary text-sm">Database</span>
            </Col>
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaLock className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">JWT</p>
              <span className="text-secondary text-sm">Authentication</span>
            </Col>
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaWifi className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">WebSockets</p>
              <span className="text-secondary text-sm">Real-time</span>
            </Col>
            <Col xs={6} sm={4} lg={2} className="d-flex flex-column align-items-center">
              <FaBolt className={`mb-3 ${styles.techIcon}`} />
              <p className="fw-bold text-white mb-1">Railway / Vercel</p>
              <span className="text-secondary text-sm">Deployment</span>
            </Col>
          </Row>
        </Container>
      </section>

      <hr className={`my-5 ${styles.sectionDivider}`} />

      {/* Demo Credentials Section */}
      <section className="py-5 px-3 px-md-5">
        <Container className={`p-4 rounded-3 shadow-lg text-center ${styles.demoCredentialsContainer}`}>
          <h2 className={`display-4 fw-bold text-white mb-4 ${styles.sectionTitle}`}>Try Our Demo</h2>
          <p className="lead text-secondary mb-4">
            Experience Skoolo firsthand with our demo accounts.
          </p>
          <Row className="g-4 justify-content-center">
            <Col md={6}>
              <Card className={`p-4 h-100 shadow-sm border ${styles.demoCard}`}>
                <h3 className="h4 fw-bold text-white mb-3 d-flex align-items-center justify-content-center">
                  <FaChalkboardTeacher className="me-3 text-primary" /> Teacher Login
                </h3>
                <p className="text-secondary fs-5 mb-2">
                  Email: <span className="text-white fw-bold">teacher@skoolo.com</span>
                </p>
                <p className="text-secondary fs-5 mb-0">
                  Password: <span className="text-white fw-bold">demo123</span>
                </p>
              </Card>
            </Col>
            <Col md={6}>
              <Card className={`p-4 h-100 shadow-sm border ${styles.demoCard}`}>
                <h3 className="h4 fw-bold text-white mb-3 d-flex align-items-center justify-content-center">
                  <FaUserGraduate className="me-3 text-primary" /> Parent Login
                </h3>
                <p className="text-secondary fs-5 mb-2">
                  Email: <span className="text-white fw-bold">parent@skoolo.com</span>
                </p>
                <p className="text-secondary fs-5 mb-0">
                  Password: <span className="text-white fw-bold">demo123</span>
                </p>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>

      {/* Footer */}
      <footer className={`py-4 px-3 px-md-5 text-center text-secondary border-top ${styles.footer}`}>
        <Container className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
          <p className="mb-0">© {new Date().getFullYear()} Skoolo. All rights reserved.</p>
          <div className="d-flex gap-4">
            <a
              href="https://github.com/Abishekhob"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-secondary ${styles.footerLink}`}
              aria-label="GitHub Repository"
            >
              <FaGithub className="me-2 fs-5" /> GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/abishekh-ob/"
              target="_blank"
              rel="noopener noreferrer"
              className={`text-secondary ${styles.footerLink}`}
              aria-label="LinkedIn Profile"
            >
              <FaLinkedinIn className="me-2 fs-5" /> LinkedIn
            </a>
            <a
              href="mailto:abishekhjuve@gmail.com"
              className={`text-secondary ${styles.footerLink}`}
              aria-label="Email Us"
            >
              <FaEnvelope className="me-2 fs-5" /> abishekhjuve@gmail.com
            </a>
          </div>
          <p className="mb-0">App Version: 1.0.0</p>
        </Container>
      </footer>

      {/* Auth Modal Component */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={closeAuthModal}
        isLogin={isLoginState}
        setIsLogin={setIsLoginState}
        API={API}
      />
    </div>
  );
};

export default Welcome;