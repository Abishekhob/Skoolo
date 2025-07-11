import TeacherSidebar from './TeacherSidebar';

const TeacherLayout = ({ children }) => (
  <div className="d-flex">
    <TeacherSidebar />
    <div className="flex-grow-1 p-4 bg-black text-white" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  </div>
);

export default TeacherLayout;
