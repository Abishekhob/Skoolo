import { Routes, Route } from 'react-router-dom';
import { useLocation } from 'react-router-dom';

import Welcome from './auth/Welcome';
import AdminDashboard from './admin/AdminDashboard';
import ClassesGrid from './admin/ClassesGrid';
import SectionsGrid from './admin/SectionsGrid';
import SectionDetails from './admin/SectionDetails';
import ManageTeachers from './admin/ManageTeachers';
import TimetableScheduler from './admin/TimetableScheduler'; // adjust path if needed
import ManageParents from './admin/ManageParents';
import SubjectsPage from './admin/SubjectsPage';
import ManageFeesPage from './admin/ManageFeesPage';
import TeacherDashboard from './teacher/TeacherDashboard';
import TeacherTimetable from './teacher/TeacherTimetable';
import TeacherStudents from './teacher/TeacherStudents';
import TeacherAttendance from './teacher/TeacherAttendance';
import TeacherAssignments from './teacher/TeacherAssignments';
import MessagesPage from './teacher/MessagesPage';
import TeacherProfile from './teacher/TeacherProfile';

// In src/index.js or src/App.js
import 'bootstrap/dist/css/bootstrap.min.css';
import TeacherGrades from './teacher/TeacherGrades';

const App = () => {
  const location = useLocation();

  const showFloatingChat =
    location.pathname.startsWith('/teacher') || location.pathname.startsWith('/parent');

  return (
    <>
      <Routes>
        {/* Admin routes */}
        <Route path="/" element={<Welcome />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/classes" element={<ClassesGrid />} />
        <Route path="/admin/classes/:classId" element={<SectionsGrid />} />
        <Route path="/admin/classes/:classId/sections/:sectionId" element={<SectionDetails />} />
        <Route path="/admin/teachers" element={<ManageTeachers />} />
        <Route path="/admin/timetable-scheduler" element={<TimetableScheduler />} />
        <Route path="/admin/parents" element={<ManageParents />} />
        <Route path="/admin/subjects" element={<SubjectsPage />} />
        <Route path="/admin/fees" element={<ManageFeesPage />} />

        {/* Teacher routes */}
        <Route path="/teacher" element={<TeacherDashboard />} />
        <Route path="/teacher/timetable" element={<TeacherTimetable />} />
        <Route path="/teacher/students" element={<TeacherStudents />} />
        <Route path="/teacher/attendance" element={<TeacherAttendance />} />
        <Route path="/teacher/assignments" element={<TeacherAssignments />} />
        <Route path="/teacher/grades" element={<TeacherGrades />} />
        <Route path="/teacher/messages" element={<MessagesPage />} />
        <Route path="/teacher/profile" element={<TeacherProfile />} />


      </Routes>

    
    </>
  );
};

export default App;
