import axios from "axios";

const URL = process.env.REACT_APP_URL || "http://localhost:5000";

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};

export const setupAuthInterceptor = () => {
  axios.defaults.withCredentials = true;
  axios.interceptors.response.use(
    (response) => response,
    async(error) => {
      const originalRequest = error.config;
    
    if (error.response?.status !== 401 || originalRequest._retry ||
      originalRequest.url?.includes("/api/users/refresh") || originalRequest.url?.includes("/api/users/login") 
    ) {
      return Promise.reject(error);
    }
    if (isRefreshing) {
      return new Promise ((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then((token) => {
        originalRequest.headers.Authorization = `Bearer ${token})`;
        return axios(originalRequest);
      });
    }
    try {
      const response = await axios.post(`${URL}/api/users/refresh`);
      const newToken = response.data.token;
      localStorage.setItem("token", newToken);
      processQueue(null, newToken);
      originalRequest.headers.Authorization = `Bearer ${newToken}`;
      return axios(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError, null);
      localStorage.removeItem("token");
      window.location.href = "/login";
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
  }
  );

}