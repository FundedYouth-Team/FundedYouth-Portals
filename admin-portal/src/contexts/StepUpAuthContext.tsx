import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import {
  StepUpSession,
  StepUpRequest,
  StepUpState,
  StepUpPurpose,
} from "types/stepUpAuth";
import { useAuth } from "contexts/AuthContext";
import { logSensitiveDataAccess } from "services/auditLogger";

/** Step-up session duration in milliseconds (5 minutes) */
const SESSION_DURATION_MS = 5 * 60 * 1000;

interface StepUpAuthContextType extends StepUpState {
  /** Request step-up authentication for a sensitive operation */
  requestStepUp: (request: StepUpRequest) => void;
  /** Verify the challenge answer and grant access */
  verifyChallenge: (isCorrect: boolean) => Promise<boolean>;
  /** Cancel the pending request */
  cancelRequest: () => void;
  /** Check if a resource has valid step-up auth */
  hasValidSession: (purpose: StepUpPurpose, resourceId: string) => boolean;
  /** Revoke all sessions (called on navigation, focus loss, etc.) */
  revokeAllSessions: () => void;
  /** Revoke a specific session */
  revokeSession: (sessionId: string) => void;
}

const StepUpAuthContext = createContext<StepUpAuthContextType | undefined>(
  undefined,
);

export function StepUpAuthProvider({ children }: { children: ReactNode }) {
  const { user, role } = useAuth();
  const [sessions, setSessions] = useState<StepUpSession[]>([]);
  const [pendingRequest, setPendingRequest] = useState<StepUpRequest | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  const location = useLocation();

  // Revoke all sessions on route change
  useEffect(() => {
    if (sessions.length > 0) {
      console.log("[StepUpAuth] Revoking sessions due to navigation");
      setSessions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  // Revoke all sessions on tab visibility change (focus loss)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && sessions.length > 0) {
        console.log("[StepUpAuth] Revoking sessions due to tab focus loss");
        setSessions([]);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [sessions.length]);

  // Revoke all sessions on page unload/refresh
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (sessions.length > 0) {
        console.log("[StepUpAuth] Revoking sessions due to page unload");
        setSessions([]);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [sessions.length]);

  // Check for expired sessions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      setSessions((prev) => {
        const valid = prev.filter((s) => s.expiresAt > now);
        if (valid.length !== prev.length) {
          console.log("[StepUpAuth] Removed expired sessions");
        }
        return valid;
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, []);

  const requestStepUp = useCallback((request: StepUpRequest) => {
    console.log("[StepUpAuth] Step-up requested:", request);
    setPendingRequest(request);
    setIsModalOpen(true);
    setError(null);
  }, []);

  const verifyChallenge = useCallback(
    async (isCorrect: boolean): Promise<boolean> => {
      if (!pendingRequest) {
        setError("No pending request");
        return false;
      }

      setIsVerifying(true);
      setError(null);

      // Small delay to feel more natural
      await new Promise((resolve) => setTimeout(resolve, 300));

      if (!isCorrect) {
        setError("Incorrect answer. Please try again.");
        setIsVerifying(false);
        return false;
      }

      // Create new session
      const now = Date.now();
      const newSession: StepUpSession = {
        id: `stepup_${now}_${Math.random().toString(36).substr(2, 9)}`,
        purpose: pendingRequest.purpose,
        resourceId: pendingRequest.resourceId,
        verifiedAt: now,
        expiresAt: now + SESSION_DURATION_MS,
      };

      console.log("[StepUpAuth] Verification successful, session created:", {
        purpose: newSession.purpose,
        resourceId: newSession.resourceId,
        expiresIn: SESSION_DURATION_MS / 1000 + "s",
      });

      // Log sensitive data access to audit trail
      if (pendingRequest.auditMetadata) {
        const dataType =
          pendingRequest.purpose === "view_broker_password"
            ? "broker_password"
            : "subscription_edit";

        logSensitiveDataAccess({
          actorId: user?.id || "unknown",
          actorEmail: user?.email || "unknown",
          actorRole: role || "unknown",
          dataType,
          resourceId: pendingRequest.resourceId,
          resourceDescription: pendingRequest.description,
          customerId: pendingRequest.auditMetadata.customerId,
          customerEmail: pendingRequest.auditMetadata.customerEmail,
        });
      }

      setSessions((prev) => [...prev, newSession]);
      setPendingRequest(null);
      setIsModalOpen(false);
      setIsVerifying(false);

      return true;
    },
    [pendingRequest, user?.id, user?.email, role],
  );

  const cancelRequest = useCallback(() => {
    setPendingRequest(null);
    setIsModalOpen(false);
    setError(null);
  }, []);

  const hasValidSession = useCallback(
    (purpose: StepUpPurpose, resourceId: string): boolean => {
      const now = Date.now();
      return sessions.some(
        (s) =>
          s.purpose === purpose &&
          s.resourceId === resourceId &&
          s.expiresAt > now,
      );
    },
    [sessions],
  );

  const revokeAllSessions = useCallback(() => {
    console.log("[StepUpAuth] All sessions revoked");
    setSessions([]);
  }, []);

  const revokeSession = useCallback((sessionId: string) => {
    console.log("[StepUpAuth] Session revoked:", sessionId);
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
  }, []);

  return (
    <StepUpAuthContext.Provider
      value={{
        sessions,
        pendingRequest,
        isModalOpen,
        error,
        isVerifying,
        requestStepUp,
        verifyChallenge,
        cancelRequest,
        hasValidSession,
        revokeAllSessions,
        revokeSession,
      }}
    >
      {children}
    </StepUpAuthContext.Provider>
  );
}

export function useStepUpAuth() {
  const context = useContext(StepUpAuthContext);
  if (context === undefined) {
    throw new Error("useStepUpAuth must be used within a StepUpAuthProvider");
  }
  return context;
}
