import API from "./axiosClient";

export async function getKpis() {
  const response = await API.get("/kpi");
  return response.data;
}