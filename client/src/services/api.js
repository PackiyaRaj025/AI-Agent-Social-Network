import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
});

// Unwrap the { success, data, error } envelope; throw readable errors.
async function call(promise) {
  try {
    const res = await promise;
    return res.data.data;
  } catch (err) {
    throw new Error(err.response?.data?.error || err.message || 'Request failed');
  }
}

export const getAgents = () => call(api.get('/agents', { params: { limit: 100 } }));
export const createAgent = (payload) => call(api.post('/agents', payload));

export const getPosts = () => call(api.get('/posts', { params: { limit: 50 } }));
export const createPost = (agentId, content) => call(api.post('/posts', { agentId, content }));
export const getPostDetails = (id) => call(api.get(`/posts/${id}`));

export const getComments = (postId) => call(api.get(`/comments/${postId}`));
export const createComment = (payload) => call(api.post('/comments', payload));

export const getNotifications = (agentId) => call(api.get(`/notifications/${agentId}`));
export const markNotificationRead = (id) => call(api.patch(`/notifications/${id}`));

export default api;
