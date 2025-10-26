import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import { useNavigate } from "react-router-dom";

const Signin = () => {
  const [activeTab, setActiveTab] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Signup state
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState("");

  const navigate = useNavigate();

  // ---- SIGN IN ----
  const handleSignin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/prod/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        let errorMessage = "Invalid credentials";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {e}
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      const token = data.access_token || data.accessToken || data.token;

      if (token) {
        sessionStorage.setItem("access_token", token);
        window.dispatchEvent(new Event("authStatusChange"));
        navigate("/");
      } else setError("Invalid response from server");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---- SIGN UP ----
  const handleSignup = async (e) => {
    e.preventDefault();
    setSignupError("");

    if (signupPassword !== confirmPassword) {
      setSignupError("Passwords do not match");
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError("Password must be at least 6 characters");
      return;
    }

    setSignupLoading(true);
    try {
      const response = await fetch("/api/prod/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, password: signupPassword }),
      });

      if (!response.ok) {
        let errorMessage = "Signup failed";
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
        } catch {e}
        setSignupError(errorMessage);
        return;
      }

      setSignupError("");
      setSignupEmail("");
      setSignupPassword("");
      setConfirmPassword("");
      setActiveTab("signin");
      setError("Signup successful! Please sign in.");
    } catch {
      setSignupError("Network error. Please try again.");
    } finally {
      setSignupLoading(false);
    }
  };

  return (
    <div
      className="relative w-screen h-screen bg-black flex items-center justify-center overflow-hidden"
    >
      {/* ✨ Overlay + Twinkling stars effect */}
      <div className="absolute inset-0 bg-black/60"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30"></div>

      {/* 🔹 Auth Box */}
      <div className="relative z-10 w-[90%] max-w-md p-10 rounded-[2rem] bg-transparent border border-white backdrop-blur-xl shadow-2xl">
        {/* Tabs */}
        <div className="flex justify-center gap-10 mb-8 text-white uppercase text-sm tracking-wider">
          <button
            onClick={() => {
              setActiveTab("signin");
              setError("");
              setSignupError("");
            }}
            className={`pb-2 transition-all ${
              activeTab === "signin"
                ? "border-b-2 border-white font-medium"
                : "opacity-70 hover:opacity-100 border-b-2 border-transparent"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setActiveTab("signup");
              setError("");
              setSignupError("");
            }}
            className={`pb-2 transition-all ${
              activeTab === "signup"
                ? "border-b-2 border-white font-medium"
                : "opacity-70 hover:opacity-100 border-b-2 border-transparent"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Forms */}
        <div className="relative min-h-[230px]">
          <AnimatePresence mode="wait">
            {activeTab === "signin" ? (
              <Motion.form
                key="signin"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col gap-5"
                onSubmit={handleSignin}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                {error && (
                  <p className="text-red-400 text-sm text-center mt-2">{error}</p>
                )}
                <Motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{
                    backgroundColor: "#000",
                    color: "#fff",
                    scale: 1.03,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-full mt-2 py-3 bg-white text-black rounded-lg font-medium tracking-wide border border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Signing In..." : "Sign In"}
                </Motion.button>
              </Motion.form>
            ) : (
              <Motion.form
                key="signup"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 50 }}
                transition={{ duration: 0.4, ease: "easeInOut" }}
                className="flex flex-col gap-5"
                onSubmit={handleSignup}
              >
                <input
                  type="email"
                  placeholder="Email"
                  value={signupEmail}
                  onChange={(e) => setSignupEmail(e.target.value)}
                  required
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                {signupError && (
                  <p className="text-red-400 text-sm text-center mt-2">
                    {signupError}
                  </p>
                )}
                <Motion.button
                  type="submit"
                  disabled={signupLoading}
                  whileHover={{
                    backgroundColor: "#000",
                    color: "#fff",
                    scale: 1.03,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-full mt-2 py-3 bg-white text-black rounded-lg font-medium tracking-wide border border-white/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {signupLoading ? "Signing Up..." : "Sign Up"}
                </Motion.button>
              </Motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Signin;
