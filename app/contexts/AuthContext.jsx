"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const AuthContext = createContext();

// Set your backend URL here
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch user profile on initial load if token exists
  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("avenue_token");
      if (token) {
        try {
          const { data } = await axios.get(`${API_URL}/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser({ ...data.user, token });
        } catch (error) {
          console.error("Session expired or invalid");
          localStorage.removeItem("avenue_token");
          setUser(null);
        }
      }
      setLoading(false);
    };
    fetchUser();
  }, []);


  // Inside app/contexts/AuthContext.jsx

  // LOGIN (Updated)
  const login = async (email, password, redirectPath = "/dashboard") => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/login`, { email, password });
      localStorage.setItem("avenue_token", data.token);
      setUser(data);
      router.push(redirectPath); // <-- Use the dynamic path
      return { success: true, role: data.role };
    } catch (error) {
   return {
    success: false,
    requiresVerification: Boolean(error.response?.data?.requiresVerification),
    message: error.response?.data?.message || "Login failed",
  };
}
  }

   

  // REGISTER
  const register = async (name, email, password, phone) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/register`, { name, email, password, phone });
      localStorage.setItem("avenue_token", data.token);
      setUser(data);
      router.push("/dashboard");
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Registration failed" };
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("avenue_token");
    setUser(null);
    router.push("/login");
  };

  // UPDATE PROFILE (Handles File Upload via FormData)
  const updateProfile = async (formData) => {
    try {
      const token = localStorage.getItem("avenue_token");
      const { data } = await axios.put(`${API_URL}/auth/profile`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data" 
        },
      });
      setUser(data); // Update global state with new info
      return { success: true };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Update failed" };
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const { data } = await axios.post(`${API_URL}/auth/forgotpassword`, { email });
      return { success: true, message: data.message };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Email not found" };
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile, forgotPassword }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);