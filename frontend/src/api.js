import axios from "axios";

export const api = axios.create({
  baseURL: "https://to-do-list-8pdc.onrender.com/api"
});
