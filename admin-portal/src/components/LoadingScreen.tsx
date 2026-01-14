/**
 * Full-screen loading indicator.
 * Used while checking authentication state.
 */
export function LoadingScreen() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="mb-4 size-12 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900"></div>
        <div className="text-gray-600">Loading...</div>
      </div>
    </div>
  );
}
