// TeacherProfile.jsx
import React, { useEffect, useState } from 'react';
import API from '../services/api';
import TeacherSidebar from './TeacherSidebar';
import { FaUser, FaPhone, FaBriefcase, FaBook, FaChalkboardTeacher, FaEdit, FaSave, FaBan, FaUpload } from 'react-icons/fa';
import styles from './style/TeacherProfile.module.css'; // Import the CSS module

const TeacherProfile = () => {
  const [profile, setProfile] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [file, setFile] = useState(null);
  const teacherId = localStorage.getItem("teacherId");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await API.get(`/teacher/profile/${teacherId}`);
      console.log("Fetched Profile Data:", res.data);

      setProfile(res.data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Optionally set an error state to display to the user
    }
  };

  const handleFileUpload = async () => {
    if (!file) return null;
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await API.post("/teacher/profile/upload-profile-pic", formData);
      return res.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      return null;
    }
  };

  const handleUpdate = async () => {
    let profilePicUrl = profile.profilePicUrl;
    if (file) {
      const uploadedUrl = await handleFileUpload();
      if (uploadedUrl) {
        profilePicUrl = uploadedUrl;
      }
    }

    try {
      await API.put(`/teacher/profile/${teacherId}`, {
        ...profile,
        profilePicUrl,
      });
      setEditMode(false);
      fetchProfile();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (!profile) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading profile...</p>
      </div>
    );
  }

  return (
    <div className={styles.profileLayout}>
      <TeacherSidebar />
      <div className={styles.profileContent}>
        <h2 className={styles.mainHeading}>
          <FaUser className={styles.headingIcon} /> Teacher Profile
        </h2>
        <div className={styles.profileCard}>
          <div className={styles.profilePicSection}>

          


    <img
  src={`http://localhost:8081${profile.profilePicUrl}`}
  alt="Profile"
  className={styles.profilePic}
/>


            {editMode && (
              <label className={styles.fileUploadLabel}>
                <input
                  type="file"
                  className={styles.fileInput}
                  onChange={e => setFile(e.target.files[0])}
                />
                <FaUpload className={styles.uploadIcon} /> Upload
              </label>
            )}
          </div>

          <div className={styles.profileDetails}>
            {editMode ? (
              <div className={styles.editForm}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className={styles.formControl}
                    value={profile.firstName || ''}
                    onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                    placeholder="First Name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className={styles.formControl}
                    value={profile.lastName || ''}
                    onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                    placeholder="Last Name"
                  />
                </div>
                <div className={styles.inputGroup}>
                  <label htmlFor="contactNumber">Contact Number</label>
                  <input
                    type="text"
                    id="contactNumber"
                    className={styles.formControl}
                    value={profile.contactNumber || ''}
                    onChange={e => setProfile({ ...profile, contactNumber: e.target.value })}
                    placeholder="Contact Number"
                  />
                </div>
                <div className={styles.buttonGroup}>
                  <button className={`${styles.btn} ${styles.btnSave}`} onClick={handleUpdate}>
                    <FaSave /> Save
                  </button>
                  <button className={`${styles.btn} ${styles.btnCancel}`} onClick={() => setEditMode(false)}>
                    <FaBan /> Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className={styles.viewMode}>
                <p><FaUser className={styles.detailIcon} /> <strong>Name:</strong> {profile.firstName} {profile.lastName}</p>
                <p><FaPhone className={styles.detailIcon} /> <strong>Contact:</strong> {profile.contactNumber}</p>
           
                <button className={`${styles.btn} ${styles.btnEdit}`} onClick={() => setEditMode(true)}>
                  <FaEdit /> Edit Profile
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionHeading}><FaBook className={styles.headingIcon} /> Subjects Taught</h3>
          <ul className={styles.list}>
            {profile.subjects && profile.subjects.length > 0 ? (
              profile.subjects.map((sub, idx) => <li key={idx}>{sub}</li>)
            ) : (
              <li>No subjects assigned.</li>
            )}
          </ul>
        </div>

        <div className={styles.section}>
          <h3 className={styles.sectionHeading}><FaChalkboardTeacher className={styles.headingIcon} /> Assigned Classes & Subjects</h3>
          <ul className={styles.list}>
            {profile.classAssignments && profile.classAssignments.length > 0 ? (
              profile.classAssignments.map((ca, idx) => (
                <li key={idx}>
                  <strong>Class:</strong> {ca.className} - <strong>Section:</strong> {ca.sectionName} - <strong>Subject:</strong> {ca.subjectName}
                </li>
              ))
            ) : (
              <li>No class assignments.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TeacherProfile;