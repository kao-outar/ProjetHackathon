import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import API from "../api/axiosClient";
import "../styles/profileEdit.css";

export default function ProfileEditPage() {
  const { user, setUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    age: user?.age || "",
    gender: user?.gender || "",
    icon: user?.icon || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  if (!user) {
    navigate("/login");
    return null;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setSaving(true);

  try {
    const userId = user._id || user.id;

    // Convertir age en number si présent
    const dataToSend = { ...formData };
    if (dataToSend.age) dataToSend.age = Number(dataToSend.age);

    const response = await API.put(`/users/${userId}`, dataToSend);

    console.log("Mise à jour réussie :", response.data);
    setUser(response.data);
    navigate("/profile");
  } catch (err) {
    console.error("Erreur lors de la mise à jour:", err.response?.data || err);
    setError(err.response?.data?.error || "Erreur lors de la mise à jour du profil");
  } finally {
    setSaving(false);
  }
};

  return (
    <div className="profile-edit-container">
      <h1>Modifier mon profil</h1>
      {error && <p className="profile-edit-error">{error}</p>}
      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <label>
          Nom
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </label>

        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            disabled={saving}
            required
          />
        </label>

        <label>
          Âge
          <input
            type="number"
            name="age"
            value={formData.age}
            onChange={handleChange}
            disabled={saving}
            min="0"
            max="150"
          />
        </label>

        <label>
          Genre
          <select
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={saving}
          >
            <option value="">Non renseigné</option>
            <option value="male">Homme</option>
            <option value="female">Femme</option>
            <option value="other">Autre</option>
            <option value="prefer_not_to_say">Préférer ne pas dire</option>
          </select>
        </label>
        {/* Prévisualisation de l'avatar */}
        {formData.icon && (
            <div className="profile-edit-avatar-preview">
                <img src={formData.icon} alt="Prévisualisation avatar" />
            </div>
        )}
        <label>
          Avatar (URL)
          <input
            type="text"
            name="icon"
            value={formData.icon}
            onChange={handleChange}
            disabled={saving}
            placeholder="Lien vers une image"
          />
        </label>

        <div className="profile-edit-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Enregistrement..." : "Sauvegarder"}
          </button>
          <button
            type="button"
            onClick={() => navigate("/profile")}
            disabled={saving}
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
