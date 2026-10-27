// In production the backend serves the frontend, so use same-origin (empty string).
// In development, point at the local backend.
export const API_URL =
  process.env.REACT_APP_API_URL !== undefined
    ? process.env.REACT_APP_API_URL
    : process.env.NODE_ENV === 'production'
    ? ''
    : 'http://localhost:6001';
