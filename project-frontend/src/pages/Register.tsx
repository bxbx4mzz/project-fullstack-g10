import { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import type { RegisterResponse } from "../types";

const GMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!GMAIL_REGEX.test(email)) {
      setError("กรุณากรอกอีเมลให้ถูกต้อง ต้องเป็น @gmail.com เท่านั้น");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post<RegisterResponse>("/api/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      navigate("/dashboard");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Register failed");
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="container" style={{ maxWidth: "400px", marginTop: "3rem" }}>
      <article>
        <h2>Register</h2>
        {error && <p style={{ color: "var(--pico-del-color)" }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <label>
            Name
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </label>
          <label>
            Gmail
            <input
              type="email"
              placeholder="youremail@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>
          <button type="submit" aria-busy={loading} disabled={loading}>
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </article>
    </div>
  );
}

export default Register;
