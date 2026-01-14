import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { StepUpAuthProvider } from "./contexts/StepUpAuthContext";
import { StepUpAuthModal } from "./components/StepUpAuthModal";
import App from "./App";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <StepUpAuthProvider>
          <App />
          <StepUpAuthModal />
        </StepUpAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
