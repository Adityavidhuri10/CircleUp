import React, { useEffect, useState } from "react";
import authAxios from "../api/authAxios";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth(); // Logged-in user (from context)
  const [allUsers, setAllUsers] = useState([]); // People you can send requests to
  const [pendingRequests, setPendingRequests] = useState([]); // Incoming requests
  const [friends, setFriends] = useState([]); // Accepted friends
  const [loading, setLoading] = useState(true); // Show loading spinner

  // --------------------------
  // Fetch all data when page loads
  // --------------------------
  useEffect(() => {
    if (!user) return;
    fetchAllData();
  }, [user]);

  // --------------------------
  // Function to fetch all data
  // --------------------------
  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [usersRes, pendingRes, friendsRes] = await Promise.all([
        authAxios.get("/friends/all"),
        authAxios.get("/friends/requests"),
        authAxios.get("/friends/list"),
      ]);

      setAllUsers(usersRes.data);
      setPendingRequests(pendingRes.data);
      setFriends(friendsRes.data);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------
  // Send Friend Request
  // --------------------------
  const sendRequest = async (id) => {
    try {
      await authAxios.post(`/friends/send-request/${id}`);
      alert("Friend request sent!");
      fetchAllData(); // Refresh data
    } catch (err) {
      alert("Failed to send request");
    }
  };

  // --------------------------
  // Accept Friend Request
  // --------------------------
  const acceptRequest = async (id) => {
    try {
      await authAxios.post(`/friends/accept-request/${id}`);
      alert("Friend request accepted!");
      fetchAllData();
    } catch (err) {
      alert("Error accepting request");
    }
  };

  // --------------------------
  // Reject Friend Request
  // --------------------------
  const rejectRequest = async (id) => {
    try {
      await authAxios.post(`/friends/reject-request/${id}`);
      alert("Friend request rejected!");
      fetchAllData();
    } catch (err) {
      alert("Error rejecting request");
    }
  };

  // --------------------------
  // JSX Rendering
  // --------------------------
  if (loading) return <h3 style={{ textAlign: "center" }}>Loading...</h3>;

  return (
    <div className="page-container" style={{ alignItems: "stretch" }}>
      <h1>Welcome, {user?.name || "User"} 👋</h1>

      {/* ---------- Friends List ---------- */}
      <section style={styles.section}>
        <h2>Your Friends</h2>
        <div style={styles.list}>
          {friends.length === 0 ? (
            <p>No friends yet.</p>
          ) : (
            friends.map((f) => (
              <div key={f._id} style={styles.card}>
                <span>{f.name}</span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---------- Pending Requests ---------- */}
      <section style={styles.section}>
        <h2>Friend Requests</h2>
        <div style={styles.list}>
          {pendingRequests.length === 0 ? (
            <p>No pending requests.</p>
          ) : (
            pendingRequests.map((req) => (
              <div key={req._id} style={styles.card}>
                <span>{req.name}</span>
                <div>
                  <button
                    onClick={() => acceptRequest(req._id)}
                    style={styles.acceptBtn}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => rejectRequest(req._id)}
                    style={styles.rejectBtn}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* ---------- All Users ---------- */}
      <section style={styles.section}>
        <h2>People You May Know</h2>
        <div style={styles.list}>
          {allUsers.length === 0 ? (
            <p>No other users found.</p>
          ) : (
            allUsers.map((u) => (
              <div key={u._id} style={styles.card}>
                <span>{u.name}</span>
                <button
                  onClick={() => sendRequest(u._id)}
                  style={styles.addBtn}
                >
                  Add Friend
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const styles = {
  section: {
    background: "#fff",
    padding: "20px",
    borderRadius: "10px",
    marginTop: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  list: {
    display: "flex",
    flexWrap: "wrap",
    gap: "10px",
    justifyContent: "center",
  },
  card: {
    border: "1px solid #ccc",
    padding: "10px 15px",
    borderRadius: "8px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "280px",
  },
  addBtn: {
    background: "#007bff",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
  acceptBtn: {
    background: "#28a745",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    marginRight: "5px",
    cursor: "pointer",
  },
  rejectBtn: {
    background: "#dc3545",
    color: "#fff",
    border: "none",
    padding: "6px 10px",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default Home;
