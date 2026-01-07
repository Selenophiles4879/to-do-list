import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../api";
import Congrats from "./Congrats";
import "../styles.css";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [showCongrats, setShowCongrats] = useState(false);

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  /* 🔐 Protect route */
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  /* 🧮 Calculate end time safely */
  const calculateEndTime = (start, hrs, mins) => {
    if (!start) return "";

    const [h, m] = start.split(":").map(Number);
    const totalMinutes =
      h * 60 + m + Number(hrs || 0) * 60 + Number(mins || 0);

    const endH = Math.floor(totalMinutes / 60) % 24;
    const endM = totalMinutes % 60;

    return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`;
  };

  /* ⛔ Block past time for today */
  const getMinTime = () => {
    if (!date) return "";

    const today = new Date().toISOString().split("T")[0];

    if (date === today) {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      return `${h}:${m}`;
    }

    return "";
  };

  /* 📥 Load tasks */
  const loadTasks = useCallback(async () => {
    if (!token) return;

    const res = await api.get("/tasks", {
      headers: { authorization: token }
    });

    setTasks(res.data);
  }, [token]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  /* ➕ Add task */
  const addTask = async (e) => {
    e.preventDefault();

    if (!title || !date || !time) {
      alert("Please fill all fields");
      return;
    }

    const now = new Date();
    const selectedDateTime = new Date(`${date}T${time}`);

    if (selectedDateTime < now) {
      alert("You cannot select past date or time");
      return;
    }

    const endTime = calculateEndTime(time, hours, minutes);

    await api.post(
      "/tasks",
      { title, date, time, endTime },
      { headers: { authorization: token } }
    );

    setTitle("");
    setDate("");
    setTime("");
    setHours("");
    setMinutes("");

    loadTasks();
  };

  /* ✅ Complete task */
  const completeTask = async (id) => {
    await api.put(
      `/tasks/${id}`,
      { completed: true },
      { headers: { authorization: token } }
    );

    setShowCongrats(true);
    loadTasks();

    setTimeout(() => setShowCongrats(false), 2500);
  };

  /* 🗑 Delete task (user choice) */
  const deleteTask = async (id) => {
    if (!window.confirm("Delete this task?")) return;

    await api.delete(`/tasks/${id}`, {
      headers: { authorization: token }
    });

    loadTasks();
  };

  /* 🚪 Logout */
  const logout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h2>My Tasks</h2>
        <button onClick={logout} className="logout-btn">Logout</button>
      </div>

      {/* ➕ ADD TASK FORM */}
      <form onSubmit={addTask} className="task-form">
        <input
          type="text"
          placeholder="Task title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <input
          type="date"
          className="date-input"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
        />

        <input
          type="time"
          className="time-input"
          value={time}
          min={getMinTime()}
          onChange={(e) => setTime(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Hours"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
        />

        <input
          type="number"
          min="0"
          placeholder="Minutes"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
        />

        {time && (hours || minutes) && (
          <small style={{ gridColumn: "1 / -1", color: "#555" }}>
            Ends at: <b>{calculateEndTime(time, hours, minutes)}</b>
          </small>
        )}

        <button type="submit">Add Task</button>
      </form>

      {/* 📋 TASK TABLE */}
      <table>
        <thead>
          <tr>
            <th>Task</th>
            <th>Date</th>
            <th>Start</th>
            <th>End</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((t) => (
            <tr key={t._id}>
              <td data-label="Task">{t.title}</td>
              <td data-label="Date">{t.date}</td>
              <td data-label="Start">{t.time}</td>
              <td data-label="End">{t.endTime || "—"}</td>
              <td data-label="Status">
                {t.completed ? (
                  <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span>✅ Completed</span>
                    <button
                      className="delete-btn"
                      onClick={() => deleteTask(t._id)}
                    >
                      🗑 Delete
                    </button>
                  </div>
                ) : (
                  <input
                    type="checkbox"
                    onChange={() => completeTask(t._id)}
                  />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showCongrats && <Congrats />}
    </div>
  );
}
