import { useState } from 'react'

export interface NotificationItem {
  id: string
  type: 'warning' | 'info' | 'success' | 'action'
  title: string
  message: string
  actionLabel?: string
  actionHref?: string
  dismissible?: boolean
}

interface NotificationProps {
  notification: NotificationItem
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
}

const typeStyles = {
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: 'text-amber-500',
    title: 'text-amber-800',
    message: 'text-amber-700'
  },
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: 'text-blue-500',
    title: 'text-blue-800',
    message: 'text-blue-700'
  },
  success: {
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: 'text-green-500',
    title: 'text-green-800',
    message: 'text-green-700'
  },
  action: {
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    icon: 'text-violet-500',
    title: 'text-violet-800',
    message: 'text-violet-700'
  }
}

function WarningIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
      />
    </svg>
  )
}

function InfoIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
      />
    </svg>
  )
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  )
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  )
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  )
}

export function Notification({
  notification,
  onDismiss,
  onMarkAsRead
}: NotificationProps) {
  const [isRead, setIsRead] = useState(false)
  const styles = typeStyles[notification.type]

  const handleMarkAsRead = () => {
    setIsRead(true)
    onMarkAsRead(notification.id)
  }

  const IconComponent =
    notification.type === 'warning'
      ? WarningIcon
      : notification.type === 'info'
        ? InfoIcon
        : notification.type === 'action'
          ? UserIcon
          : CheckIcon

  return (
    <div
      className={`rounded-lg border p-4 ${styles.bg} ${styles.border} ${
        isRead ? 'opacity-60' : ''
      }`}
    >
      <div className="flex items-start gap-3">
        <IconComponent className={`size-5 shrink-0 ${styles.icon}`} />
        <div className="min-w-0 flex-1">
          <h4 className={`text-sm font-medium ${styles.title}`}>
            {notification.title}
          </h4>
          <p className={`mt-1 text-sm ${styles.message}`}>
            {notification.message}
          </p>
          <div className="mt-3 flex items-center gap-3">
            {notification.actionLabel && notification.actionHref && (
              <a
                href={notification.actionHref}
                className={`text-sm font-medium ${styles.title} underline hover:no-underline`}
              >
                {notification.actionLabel}
              </a>
            )}
            {!isRead && (
              <button
                onClick={handleMarkAsRead}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Mark as read
              </button>
            )}
          </div>
        </div>
        {notification.dismissible !== false && (
          <button
            onClick={() => onDismiss(notification.id)}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            <CloseIcon className="size-5" />
          </button>
        )}
      </div>
    </div>
  )
}

interface NotificationListProps {
  notifications: NotificationItem[]
  onDismiss: (id: string) => void
  onMarkAsRead: (id: string) => void
}

export function NotificationList({
  notifications,
  onDismiss,
  onMarkAsRead
}: NotificationListProps) {
  if (notifications.length === 0) {
    return null
  }

  return (
    <div className="space-y-3">
      {notifications.map((notification) => (
        <Notification
          key={notification.id}
          notification={notification}
          onDismiss={onDismiss}
          onMarkAsRead={onMarkAsRead}
        />
      ))}
    </div>
  )
}
