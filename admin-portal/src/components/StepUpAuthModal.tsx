import { useState, FormEvent, useEffect, useMemo } from "react";
import { useStepUpAuth } from "contexts/StepUpAuthContext";

/**
 * Step-Up Authentication Modal
 *
 * Displays when a user attempts to access sensitive data.
 * Requires solving a logic challenge to proceed.
 *
 * Security notes:
 * - Session expires after 5 minutes
 * - Session is revoked on navigation, refresh, or focus loss
 */
export function StepUpAuthModal() {
  const {
    isModalOpen,
    pendingRequest,
    error,
    isVerifying,
    verifyChallenge,
    cancelRequest,
  } = useStepUpAuth();

  const [answer, setAnswer] = useState("");

  // Generate a random math challenge when modal opens
  const challenge = useMemo(() => {
    if (!isModalOpen) return null;
    const num1 = Math.floor(Math.random() * 20) + 5;
    const num2 = Math.floor(Math.random() * 20) + 5;
    const operators = ["+", "-", "×"] as const;
    const operator = operators[Math.floor(Math.random() * operators.length)];

    let correctAnswer: number;
    switch (operator) {
      case "+":
        correctAnswer = num1 + num2;
        break;
      case "-":
        correctAnswer = num1 - num2;
        break;
      case "×":
        correctAnswer = num1 * num2;
        break;
    }

    return { num1, num2, operator, correctAnswer };
  }, [isModalOpen, pendingRequest]);

  // Reset answer when modal opens
  useEffect(() => {
    if (isModalOpen) {
      setAnswer("");
    }
  }, [isModalOpen]);

  if (!isModalOpen || !pendingRequest || !challenge) {
    return null;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const userAnswer = parseInt(answer, 10);
    await verifyChallenge(userAnswer === challenge.correctAnswer);
  };

  const getPurposeText = () => {
    switch (pendingRequest.purpose) {
      case "view_broker_password":
        return "View Broker Password";
      case "edit_subscription":
        return "Edit Subscription";
      default:
        return "Access Sensitive Data";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={cancelRequest}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Step-Up Authentication Required
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This action requires additional verification.
          </p>
        </div>

        {/* Security Notice */}
        <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
          <div className="flex items-start gap-2">
            <svg
              className="mt-0.5 size-5 shrink-0 text-amber-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z"
                clipRule="evenodd"
              />
            </svg>
            <div>
              <p className="text-sm font-medium text-amber-800">
                {getPurposeText()}
              </p>
              <p className="text-xs text-amber-700">
                {pendingRequest.description}
              </p>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Math Challenge Form */}
        <div>
          <div className="mb-4 text-sm text-gray-600">
            <p>Solve this problem to continue:</p>
          </div>

          <div className="mb-4 rounded-lg bg-gray-100 p-4 text-center">
            <span className="font-mono text-2xl font-bold text-gray-900">
              {challenge.num1} {challenge.operator} {challenge.num2} = ?
            </span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="challenge-answer"
                className="block text-sm font-medium text-gray-700"
              >
                Your Answer
              </label>
              <input
                type="text"
                id="challenge-answer"
                value={answer}
                onChange={(e) => setAnswer(e.target.value.replace(/[^0-9-]/g, ""))}
                placeholder="Enter your answer"
                autoFocus
                required
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-center font-mono text-lg shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelRequest}
                disabled={isVerifying}
                className="flex-1 rounded-md border border-gray-300 px-4 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isVerifying || answer === ""}
                className="flex-1 rounded-md bg-gray-900 px-4 py-2 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isVerifying ? "Verifying..." : "Verify"}
              </button>
            </div>
          </form>
        </div>

        {/* Session Info */}
        <p className="mt-4 text-center text-xs text-gray-500">
          Access will expire after 5 minutes or when you navigate away.
        </p>
      </div>
    </div>
  );
}
