import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import App from "./App.jsx";
import { AuthProvider } from "./context/AuthContext.jsx";
import * as Sentry from "@sentry/react";
import { HelmetProvider } from "react-helmet-async"; // ✅ ADD THIS

// ✅ Init Sentry
Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN_KEY || "",
  integrations: [Sentry.browserTracingIntegration()],
  tracesSampleRate: import.meta.env.DEV ? 1.0 : 0.2,
  sendDefaultPii: false, // Safer default
});

// ✅ Wrap App with ErrorBoundary
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <HelmetProvider>
        <Sentry.ErrorBoundary fallback={<p>Something went wrong</p>}>
          <App />
        </Sentry.ErrorBoundary>
      </HelmetProvider>
    </AuthProvider>
  </BrowserRouter>,
);
