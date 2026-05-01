import axios from "axios";

const API = axios.create({
  baseURL: "http://10.72.110.69:5000/api"
});

export default API;