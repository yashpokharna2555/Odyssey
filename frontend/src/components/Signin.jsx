import React, { useState } from "react";
import { motion as Motion, AnimatePresence } from "motion/react";
import Beach from "../assets/Beach.jpg";
import NavBar from "./NavBar";

const Signin = () => {
  const [activeTab, setActiveTab] = useState("signin");

  return (
    <div
      className="w-screen h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage: `url(${Beach})`,
      }}
    >
      {/* Frosted Glass Auth Box */}
      <div className="relative z-10 w-[65%] max-w-md p-10 rounded-[2rem] bg-white/10 border border-white/30 backdrop-blur-lg shadow-2xl">
        {/* Tabs */}
        <div className="flex justify-center gap-10 mb-8 text-white uppercase text-sm tracking-wider">
          <button
            onClick={() => setActiveTab("signin")}
            className={`pb-2 transition-all ${
              activeTab === "signin"
                ? "border-b-2 border-white font-medium"
                : "opacity-70 hover:opacity-100 border-b-2 border-transparent"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setActiveTab("signup")}
            className={`pb-2 transition-all ${
              activeTab === "signup"
                ? "border-b-2 border-white font-medium"
                : "opacity-70 hover:opacity-100 border-b-2 border-transparent"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Animated Forms */}
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
              >
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <Motion.button
                  type="submit"
                  whileHover={{
                    backgroundColor: "#000",
                    color: "#fff",
                    scale: 1.03,
                    borderColor: "#000",
                    borderWidth: 2,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-full mt-2 py-3 bg-white text-black rounded-full font-medium tracking-wide border border-transparent transition-all"
                >
                  Sign In
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
              >
                <input
                  type="email"
                  placeholder="Email"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  className="w-full p-3 bg-white/10 border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:border-white focus:bg-white/20 transition-all"
                />
                <Motion.button
                  type="submit"
                  whileHover={{
                    backgroundColor: "#000",
                    color: "#fff",
                    scale: 1.03,
                    borderColor: "#000",
                    borderWidth: 2,
                  }}
                  transition={{ duration: 0.25 }}
                  className="w-full mt-2 py-3 bg-white text-black rounded-full font-medium tracking-wide border border-transparent transition-all"
                >
                  Sign Up
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
