import API from "./axiosClient";

// 🧩 Récupérer tous les commentaires
export async function getAllComments() {
  const response = await API.get("/comments");
  return response.data;
}

// 🧩 Récupérer les commentaires d'un post
export async function getCommentsByPost(postId) {
  const response = await API.get(`/comments/post/${postId}`);
  return response.data;
}

// 🧩 Créer un nouveau commentaire
export async function createComment(postId, content) {
  const response = await API.post("/comments", { postId, content });
  return response.data;
}

// 🧩 Modifier un commentaire
export async function updateComment(commentId, content) {
  const response = await API.put(`/comments/${commentId}`, { content });
  return response.data;
}

// 🧩 Supprimer un commentaire
export async function deleteComment(commentId) {
  const response = await API.delete(`/comments/${commentId}`);
  return response.data;
}

