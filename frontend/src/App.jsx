import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ⭐ IMPORT AUTH PROVIDER
import { AuthProvider } from "./context/AuthContext";

// Components & Pages
import Navbar from "./pages/Navbar.jsx";
import Home from "./pages/Home.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Login from "./pages/Login.jsx";
import Signup from "./pages/Signup.jsx";
import ProtectedRoute from "./ProtectedRoute.jsx";

// Hiring workflows
import HiringDashboard from "./pages/HiringDashboard.jsx";
import JobDetails from "./pages/JobDetails.jsx";
import JobSubmission from "./pages/JobSubmission.jsx";

// OAuth Success
import OAuthSuccess from "./pages/OAuthSuccess.jsx";

// Preloader
import QuantumPreloader from "./pages/preloader.jsx";

// Simple Error Boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error("React Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            backgroundColor: "#02020a",
            color: "white",
            minHeight: "100vh",
            padding: "20px",
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <h1>Something went wrong</h1>
          <p>Please refresh the page to try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {

  // Show loader only on homepage
  const shouldShowLoader = window.location.pathname === "/";
  const [loading, setLoading] = useState(shouldShowLoader);

  return (
    <>
      {/* Global Styles */}
      <style>{`
        body {
          margin: 0;
          padding: 0;
          background-color: #02020a;
          color: #ffffff;
          overflow-x: hidden;
        }

        .secondary-text {
          color: #94a3b8;
        }

        .heading {
          color: #e2e8f0;
          font-weight: 600;
        }

        .main-content {
          opacity: 0;
          animation: fadeInContent 1.2s ease-out forwards;
        }

        @keyframes fadeInContent {
          from {
            opacity: 0;
            transform: translateY(10px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        select {
          background-color: #0f172a !important;
          color: #ffffff !important;
          border: 1px solid #38bdf8;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 14px;
          outline: none;
        }

        select option {
          background-color: #1e293b !important;
          color: #ffffff !important;
          padding: 8px;
        }

        select:focus {
          outline: none;
          border-color: #22d3ee;
          box-shadow: 0 0 0 2px rgba(34, 211, 238, 0.2);
        }

        select:disabled {
          background-color: #374151 !important;
          color: #9ca3af !important;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .tooltip {
          background-color: #1e293b;
          color: #ffffff;
          border: 1px solid #38bdf8;
        }

        .card {
          background: linear-gradient(145deg, #0f172a, #020617);
          border: 1px solid #334155;
          color: #ffffff;
          box-shadow: 0 0 10px rgba(56, 189, 248, 0.3);
        }
      `}</style>

      {loading ? (
        <QuantumPreloader onFinish={() => setLoading(false)} />
      ) : (
        <ErrorBoundary>
          <div
            className="main-content"
            style={{
              backgroundColor: "#02020a",
              color: "white",
              minHeight: "100vh",
            }}
          >
            <AuthProvider>
              <Router>
                <Navbar />

                <Routes>

                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />

                  {/* OAuth Success */}
                  <Route path="/oauth-success" element={<OAuthSuccess />} />

                  {/* Protected Routes */}
                  <Route
                    path="/hiring"
                    element={
                      <ProtectedRoute>
                        <HiringDashboard />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/hiring/job/:jobId"
                    element={
                      <ProtectedRoute>
                        <JobDetails />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/hiring/create"
                    element={
                      <ProtectedRoute>
                        <JobSubmission />
                      </ProtectedRoute>
                    }
                  />

                  <Route
                    path="/jobs/new"
                    element={
                      <ProtectedRoute>
                        <JobSubmission />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch-all */}
                  <Route path="*" element={<Home />} />

                </Routes>
              </Router>
            </AuthProvider>
          </div>
        </ErrorBoundary>
      )}
    </>
  );
}