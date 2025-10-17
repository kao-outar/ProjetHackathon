import API from "./axiosClient";

// 🧩 Récupérer tous les posts
export async function getAllPosts() {
  const response = await API.get("/posts");
  return response.data;
}

// 🧩 Récupérer les posts d’un utilisateur
export async function getUserPosts(userId) {
  const response = await API.get(`/posts/user/${userId}`);
  return response.data;
}

// 🧩 Créer un nouveau post
export async function createPost(title, content) {
  const response = await API.post("/posts", { title, content });
  return response.data;
}


// 🧩 Modifier un post
export async function updatePost(postId, title, content, authorId) {
  const response = await API.put(`/posts/${postId}`, {
    title,
    content,
    author: authorId,
  });
  return response.data;
}

// 🧩 Supprimer un post
export async function deletePost(postId, authorId) {
  const response = await API.delete(`/posts/${postId}`, {
    data: { author: authorId },
  });
  return response.data;
}

// 🧩 Liker / Unliker un post
export const toggleLikePost = async (postId) => {
  const res = await API.post(`/posts/${postId}/like`);
  return res.data; // contient { message, post } comme renvoyé par le backend
};
