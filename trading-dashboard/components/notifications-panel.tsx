"use client"

import { useAppContext } from "@/context/app-context"
import { Button } from "@/components/ui/button"
import { SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { AlertTriangle, CheckCircle, Info, AlertCircle, X, Bell } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { formatDistanceToNow } from "date-fns"

export default function NotificationsPanel() {
  const { notifications, dismissNotification, markAllNotificationsAsRead } = useAppContext()

  const getIcon = (type: string) => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "info":
        return <Info className="h-4 w-4 text-blue-600" />
      case "alert":
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getIconBg = (type: string) => {
    switch (type) {
      case "warning":
        return "bg-yellow-100"
      case "success":
        return "bg-green-100"
      case "info":
        return "bg-blue-100"
      case "alert":
        return "bg-red-100"
      default:
        return "bg-blue-100"
    }
  }

  return (
    <>
      <SheetHeader>
        <SheetTitle>Notifications</SheetTitle>
        <SheetDescription className="flex items-center justify-between">
          <span>Stay updated with system alerts and market opportunities.</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllNotificationsAsRead} className="text-xs h-7">
              Mark all as read
            </Button>
          )}
        </SheetDescription>
      </SheetHeader>
      <div className="py-4">
        <AnimatePresence initial={false}>
          {notifications.length > 0 ? (
            <div className="space-y-4">
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  transition={{ duration: 0.2 }}
                  className="bg-accent/50 p-3 rounded-lg border border-border relative"
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 absolute top-2 right-2 opacity-60 hover:opacity-100"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Dismiss</span>
                  </Button>
                  <div className="flex items-start gap-3">
                    <div className={`${getIconBg(notification.type)} rounded-full p-1.5 mt-0.5`}>
                      {getIcon(notification.type)}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">{notification.title}</h4>
                      <p className="text-xs text-muted-foreground mt-1">{notification.message}</p>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                        </span>
                        {notification.action && (
                          <Button
                            variant="secondary"
                            size="sm"
                            className="h-7 text-xs"
                            onClick={notification.action.onClick}
                          >
                            {notification.action.label}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="bg-muted rounded-full p-3 mb-3">
                <Bell className="h-5 w-5 text-muted-foreground" />
              </div>
              <h4 className="text-sm font-medium mb-1">No notifications</h4>
              <p className="text-xs text-muted-foreground">You're all caught up!</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </>
  )
}

