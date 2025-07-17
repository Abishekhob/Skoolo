import API from '../services/api';

// Given teacherId or parentId, fetch the corresponding userId from backend
export async function getUserIdFromRole(roleKey) {
  try {
    const id = localStorage.getItem(roleKey);
    if (!id) return null;

    if (roleKey === 'teacherId') {
      const res = await API.get(`/teacher/${id}`); // note singular 'teacher'
      return res.data?.userId || null;             // <-- use userId here
    } else if (roleKey === 'parentId') {
      const res = await API.get(`/parents/user-id/${id}`); // note singular 'parent'
      return res.data || null;
        // <-- same here
    }
  } catch (error) {
    console.error('Failed to fetch userId from', roleKey, error);
    return null;
  }
}
