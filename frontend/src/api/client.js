import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:8000",
  timeout: 60000
});

export async function sendChat({ message, session_id }) {
  const { data } = await api.post("/api/chat", { message, session_id });
  return data;
}

export async function fetchAnalytics() {
  const { data } = await api.get("/api/analytics");
  return data;
}

