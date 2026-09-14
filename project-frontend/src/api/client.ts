import axios, { AxiosHeaders } from "axios";

export const api = axios.create();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    if (!(config.headers instanceof AxiosHeaders)) {
      config.headers = new AxiosHeaders(config.headers);
    }
    config.headers.set("Authorization", `Bearer ${token}`);
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);