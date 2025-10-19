import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom"; 
import API from "../api/axiosClient";
import "../styles/users-page.css";
import { useAuth } from "../hooks/useAuth";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const navigate = useNavigate(); 
  const { user } = useAuth(); 

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await API.get("/users");
        setUsers(res.data.users || []);
      } catch (err) {
        console.error("❌ API Error:", err);
        setError("Unable to fetch users.");
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="users-error">{error}</p>;

  const filteredUsers = users.filter((user) => {
    const query = searchQuery.toLowerCase();
    return (
      user.name?.toLowerCase().includes(query) ||
      user.email?.toLowerCase().includes(query)
    );
  });

  
  const handleUserClick = (userId) => {
    if (!userId) return;
    if (user && (user._id === userId || user.id === userId)) {
      navigate("/profile");
    } else {
      navigate(`/profile/${userId}`);
    }
  };

  return (
    <div className="users-container">
      <h2>User List</h2>

      <input
        type="text"
        className="users-search-input"
        placeholder="Search by name or email..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <ul className="users-list">
        {filteredUsers.length > 0 ? (
          filteredUsers.map((user) => (
            <li key={user._id} className="user-card">
              <div
                className="user-avatar"
                onClick={() => handleUserClick(user._id)} 
                style={{ cursor: "pointer" }}
              >
                {user.icon ? (
                  <img src={user.icon} alt={`${user.name} avatar`} />
                ) : (
                  user.name?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              <div className="user-info">
                <div
                  className="user-name"
                  onClick={() => handleUserClick(user._id)} 
                  style={{ cursor: "pointer" }}
                >
                  {user.name}
                </div>
                <div className="user-email">{user.email}</div>

                <div className="user-meta">
                  <div className="user-meta-item">
                    <div className="user-meta-label">Age</div>
                    <div className="user-meta-value">
                      {user.age ? `${user.age} years` : "Not provided"}
                    </div>
                  </div>
                  <div className="user-meta-item">
                    <div className="user-meta-label">Gender</div>
                    <div className="user-meta-value">
                      {user.gender || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))
        ) : (
          <p className="users-empty">
            {searchQuery
              ? `No users found for "${searchQuery}".`
              : "No users found."}
          </p>
        )}
      </ul>
    </div>
  );
}
