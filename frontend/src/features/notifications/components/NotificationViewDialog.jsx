// src/features/notifications/components/NotificationViewDialog.jsx

import { useNavigate } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn, formatDateTime } from '@/lib/utils';
import {
  NOTIFICATION_TYPES, PRIORITY_CONFIG, REFERENCE_ROUTES
} from '../notificationsTypes';

export default function NotificationViewDialog({ open, onOpenChange, notification }) {
  const navigate = useNavigate();

  if (!notification) return null;

  const cfg = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  const Icon = cfg.icon;
  const priority = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;

  const route = REFERENCE_ROUTES[notification.referenceType];

  const handleGoTo = () => {
    if (route) {
      navigate(route);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-3">
            <div className={cn('rounded-lg p-2.5 shrink-0', cfg.bg)}>
              <Icon className={cn('h-5 w-5', cfg.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-base leading-snug">
                {notification.title}
              </DialogTitle>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant={cfg.badge} className="text-[10px]">
                  {cfg.label}
                </Badge>
                <Badge variant={priority.variant} className="text-[10px]">
                  {priority.label}
                </Badge>
                {notification.isRead ? (
                  <Badge variant="secondary" className="text-[10px]">Read</Badge>
                ) : (
                  <Badge variant="info" className="text-[10px]">Unread</Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <p className="text-sm text-foreground leading-relaxed">
            {notification.message}
          </p>

          <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2 text-xs">
            <div className="flex justify-between gap-4">
              <span className="text-muted-foreground">Created</span>
              <span className="text-foreground font-medium text-right">
                {formatDateTime(notification.createdAt)}
              </span>
            </div>
            {notification.branch?.name && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Branch</span>
                <span className="text-foreground font-medium text-right">
                  {notification.branch.name}
                </span>
              </div>
            )}
            {notification.referenceType && (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">Reference</span>
                <span className="text-foreground font-medium text-right">
                  {notification.referenceType}
                </span>
              </div>
            )}
          </div>

          {route && (
            <Button onClick={handleGoTo} className="w-full">
              <ExternalLink className="h-4 w-4" />
              Go to {notification.referenceType}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}