import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://api-label.tado.vn",
});

export default axiosInstance;
