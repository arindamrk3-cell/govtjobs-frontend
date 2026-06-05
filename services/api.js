// import axios from "axios";

// const API = axios.create({
//   //baseURL:"http://10.63.65.138:5000/api"
//   baseURL: "https://govtjobs-backend.onrender.com/api"
// });

// export default API;
import axios from "axios";
import { Platform } from "react-native";

const LOCAL_URL = "http://192.168.56.1:5000/api";
const PROD_URL = "https://govtjobs-backend.onrender.com/api";

const BASE_URL = __DEV__
  ? LOCAL_URL
  : PROD_URL;

const API = axios.create({
  baseURL: BASE_URL
});

export default API;