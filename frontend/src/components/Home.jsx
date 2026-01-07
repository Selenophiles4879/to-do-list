import { Link } from "react-router-dom";
import "../styles.css";

export default function Home() {
  return (
    <div className="container">
      <h2>🚀 Todo App</h2>

      <p style={{ textAlign: "center", fontSize: "1.1rem" }}>
        Organize your tasks, set deadlines, and track progress easily.
      </p>

      <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
        <Link to="/login">
          <button>Login</button>
        </Link>

        <Link to="/register">
          <button>Create Account</button>
        </Link>
      </div>
    </div>
  );
}
