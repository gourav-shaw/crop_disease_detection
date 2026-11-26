import axios from "axios";

const api = axios.create({ baseURL: "/api", timeout: 30000 });

export async function predictImage(file) {
  const form = new FormData();
  form.append("image", file);
  const { data } = await api.post("/predictions", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
export async function getHistory() {
  try {
    const { data } = await api.get("/predictions");
    return Array.isArray(data) ? data : data.predictions || [];
  } catch { return []; }
}
export async function deletePrediction(id) {
  const { data } = await api.delete(`/predictions/${id}`);
  return data;
}
export async function getStats() {
  const { data } = await api.get("/stats");
  return data;
}
export default api;
