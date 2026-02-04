import React from "react";
import { AuthProvider } from "../app/AuthContext";
import { AppRoutes } from "../app/AppRoutes";

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

