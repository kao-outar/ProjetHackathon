import { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { getKpis } from "../api/kpi";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import "../styles/dashboard.css";

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [kpis, setKpis] = useState(null);
  const [kpiLoading, setKpiLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      navigate("/feed");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const fetchKpis = async () => {
      try {
        const data = await getKpis();
        setKpis(data);
      } catch (err) {
        console.error("Error fetching KPIs:", err);
        setError("Failed to load statistics");
      } finally {
        setKpiLoading(false);
      }
    };

    if (!loading && user?.role === 'admin') {
      fetchKpis();
    }
  }, [user, loading]);

  if (loading || kpiLoading) {
    return <div className="dashboard-loading">Loading dashboard...</div>;
  }

  if (error) {
    return <div className="dashboard-error">{error}</div>;
  }

  if (!kpis) {
    return <div className="dashboard-error">No data available</div>;
  }

  // Données pour le graphique en camembert (gender)
  const genderData = [
    { name: 'Female', value: kpis.users.byGender.female, fill: '#FF6B9D' },
    { name: 'Male', value: kpis.users.byGender.male, fill: '#4A90E2' },
    { name: 'Other', value: kpis.users.byGender.other, fill: '#F5A623' },
    { name: 'Prefer not to say', value: kpis.users.byGender.preferNotToSay, fill: '#9B9B9B' }
  ];

  // Données pour le graphique en barres
  const statsData = [
    { name: 'Users', value: kpis.users.total },
    { name: 'Posts', value: kpis.posts.total },
    { name: 'Comments', value: kpis.comments.total }
  ];

  // Données pour averages
 /* const averagesData = [
    { name: 'Avg Age', value: Math.round(kpis.users.averageAge) },
    { name: 'Posts/User', value: Math.round(kpis.posts.averagePerUser * 10) / 10 },
    { name: 'Comments/Post', value: Math.round(kpis.comments.averagePerPost * 10) / 10 }
  ];*/

  const COLORS = ['#4A90E2', '#50C878', '#FFB347'];

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <p className="dashboard-subtitle">Real-time network statistics</p>
      </div>

      {/* KPI Cards - Top Stats */}
      <div className="dashboard-kpi-cards">
        <div className="kpi-card">
          <div className="kpi-card-icon users-icon">👥</div>
          <div className="kpi-card-content">
            <h3>Total Users</h3>
            <p className="kpi-card-value">{kpis.users.total}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon posts-icon">📝</div>
          <div className="kpi-card-content">
            <h3>Total Posts</h3>
            <p className="kpi-card-value">{kpis.posts.total}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon comments-icon">💬</div>
          <div className="kpi-card-content">
            <h3>Total Comments</h3>
            <p className="kpi-card-value">{kpis.comments.total}</p>
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-card-icon age-icon">🎂</div>
          <div className="kpi-card-content">
            <h3>Average Age</h3>
            <p className="kpi-card-value">{kpis.users.averageAge}</p>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dashboard-grid">
        {/* Total Stats Bar Chart */}
        <div className="dashboard-card chart-card">
          <h2>Overall Statistics</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="name" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#f5f5f5', border: '1px solid #ddd', borderRadius: '8px' }}
              />
              <Bar dataKey="value" fill="#4A90E2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Distribution Pie Chart */}
        <div className="dashboard-card chart-card">
          <h2>Gender Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={genderData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {genderData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Averages Stats */}
        <div className="dashboard-card full-width">
          <h2>Engagement Metrics</h2>
          <div className="metrics-grid">
            <div className="metric-item">
              <span className="metric-label">Posts per User</span>
              <span className="metric-value">{kpis.posts.averagePerUser}</span>
              <span className="metric-unit">avg/user</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Comments per Post</span>
              <span className="metric-value">{kpis.comments.averagePerPost}</span>
              <span className="metric-unit">avg/post</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Average User Age</span>
              <span className="metric-value">{kpis.users.averageAge}</span>
              <span className="metric-unit">years</span>
            </div>
          </div>
        </div>

        {/* Detailed Gender Breakdown */}
        <div className="dashboard-card full-width">
          <h2>User Demographics</h2>
          <div className="gender-breakdown">
            <div className="gender-item">
              <div className="gender-bar female-bar">
                <span className="gender-percentage">{Math.round((kpis.users.byGender.female / kpis.users.total) * 100)}%</span>
              </div>
              <span className="gender-label">Female ({kpis.users.byGender.female})</span>
            </div>
            <div className="gender-item">
              <div className="gender-bar male-bar">
                <span className="gender-percentage">{Math.round((kpis.users.byGender.male / kpis.users.total) * 100)}%</span>
              </div>
              <span className="gender-label">Male ({kpis.users.byGender.male})</span>
            </div>
            <div className="gender-item">
              <div className="gender-bar other-bar">
                <span className="gender-percentage">{Math.round((kpis.users.byGender.other / kpis.users.total) * 100)}%</span>
              </div>
              <span className="gender-label">Other ({kpis.users.byGender.other})</span>
            </div>
            <div className="gender-item">
              <div className="gender-bar prefer-bar">
                <span className="gender-percentage">{Math.round((kpis.users.byGender.preferNotToSay / kpis.users.total) * 100)}%</span>
              </div>
              <span className="gender-label">Prefer not to say ({kpis.users.byGender.preferNotToSay})</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}