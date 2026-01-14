import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "contexts/AuthContext";
import type { Ticket, TicketPriority } from "types/ticket";
import {
  getMyUnreadTickets,
  markTicketAsRead,
} from "services/ticketService";

function formatTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  return date.toLocaleDateString();
}

function getPriorityIcon(priority: TicketPriority) {
  switch (priority) {
    case "high":
      return (
        <div className="flex size-8 items-center justify-center rounded-full bg-red-100">
          <svg
            className="size-4 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        </div>
      );
    case "medium":
      return (
        <div className="flex size-8 items-center justify-center rounded-full bg-yellow-100">
          <svg
            className="size-4 text-yellow-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      );
    case "low":
      return (
        <div className="flex size-8 items-center justify-center rounded-full bg-gray-100">
          <svg
            className="size-4 text-gray-600"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
        </div>
      );
  }
}

function getPriorityColor(priority: TicketPriority) {
  switch (priority) {
    case "high":
      return "bg-red-500";
    case "medium":
      return "bg-yellow-500";
    case "low":
      return "bg-gray-400";
  }
}

export function TicketBell() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadTickets = useCallback(async (showRefreshing = false) => {
    if (!user) return;

    if (showRefreshing) setRefreshing(true);
    try {
      const unreadTickets = await getMyUnreadTickets(user.id);
      setTickets(unreadTickets);
    } catch (error) {
      console.error("Failed to load tickets:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  // Refresh periodically (every 60 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      loadTickets();
    }, 60000);
    return () => clearInterval(interval);
  }, [loadTickets]);

  const handleRefresh = () => {
    loadTickets(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTicketClick = async (ticket: Ticket) => {
    if (!user) return;

    // Mark as read
    try {
      await markTicketAsRead(ticket.id, user.id);
      setTickets((prev) => prev.filter((t) => t.id !== ticket.id));
    } catch (error) {
      console.error("Failed to mark ticket as read:", error);
    }

    // Navigate to tickets page
    navigate("/tickets");
    setIsOpen(false);
  };

  const unreadCount = tickets.length;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Ticket Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-lg p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900"
        title="My Tickets"
      >
        <svg
          className="size-6"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>

        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-teal-500 text-xs font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-96 rounded-xl bg-white shadow-xl ring-1 ring-gray-200">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h3 className="font-semibold text-gray-900">My Tickets</h3>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-sm text-gray-500 hover:text-gray-700 disabled:opacity-50"
              title="Refresh"
            >
              <svg
                className={`size-4 ${refreshing ? "animate-spin" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99"
                />
              </svg>
            </button>
          </div>

          {/* Tickets List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="size-6 animate-spin rounded-full border-2 border-gray-200 border-t-teal-600" />
              </div>
            ) : unreadCount === 0 ? (
              <div className="py-8 text-center text-gray-500">
                <svg
                  className="mx-auto size-12 text-gray-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="mt-2">No unread tickets!</p>
                <p className="text-xs text-gray-400">You're all caught up</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-100">
                {tickets.map((ticket) => (
                  <li key={ticket.id}>
                    <button
                      onClick={() => handleTicketClick(ticket)}
                      className="flex w-full items-start gap-3 bg-teal-50/50 px-4 py-3 text-left transition-colors hover:bg-gray-50"
                    >
                      {getPriorityIcon(ticket.priority)}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {ticket.title}
                          </p>
                          <span
                            className={`inline-block size-2 rounded-full ${getPriorityColor(
                              ticket.priority
                            )}`}
                            title={`${ticket.priority} priority`}
                          />
                        </div>
                        {ticket.description && (
                          <p className="mt-0.5 truncate text-sm text-gray-500">
                            {ticket.description}
                          </p>
                        )}
                        <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                          <span>{formatTimeAgo(ticket.created_at)}</span>
                          <span>•</span>
                          <span>Due: {new Date(ticket.due_date).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <span className="mt-1 size-2 rounded-full bg-teal-500" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 px-4 py-3">
            <button
              onClick={() => {
                navigate("/tickets");
                setIsOpen(false);
              }}
              className="w-full text-center text-sm text-teal-600 hover:text-teal-700"
            >
              View all tickets
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
