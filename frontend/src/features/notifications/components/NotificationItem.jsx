// src/features/notifications/components/NotificationItem.jsx

import { MoreHorizontal, Check, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { cn, formatRelativeTime } from '@/lib/utils';
import { NOTIFICATION_TYPES, PRIORITY_CONFIG } from '../notificationsTypes';

export default function NotificationItem({
  notification, onView, onMarkRead, onDelete
}) {
  const cfg = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.system;
  const Icon = cfg.icon;
  const priority = PRIORITY_CONFIG[notification.priority] || PRIORITY_CONFIG.medium;
  const isUnread = !notification.isRead;

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer',
        isUnread && 'bg-accent/5'
      )}
      onClick={() => onView(notification)}
    >
      {/* Unread dot */}
      <div className="pt-2 w-2 shrink-0">
        {isUnread && (
          <span className="block h-2 w-2 rounded-full bg-accent" />
        )}
      </div>

      {/* Icon */}
      <div className={cn('rounded-lg p-2.5 shrink-0', cfg.bg)}>
        <Icon className={cn('h-4 w-4', cfg.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <Badge variant={cfg.badge} className="text-[10px]">
                {cfg.label}
              </Badge>
              <Badge variant={priority.variant} className="text-[10px]">
                {priority.label}
              </Badge>
            </div>
            <p className={cn(
              'text-sm truncate',
              isUnread ? 'font-semibold text-foreground' : 'font-medium text-foreground/80'
            )}>
              {notification.title}
            </p>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
              {notification.message}
            </p>
          </div>

          {/* Actions */}
          <div onClick={(e) => e.stopPropagation()}>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onView(notification)}>
                  <Eye className="h-4 w-4" />
                  View details
                </DropdownMenuItem>
                {isUnread && (
                  <DropdownMenuItem onClick={(e) => onMarkRead(notification, e)}>
                    <Check className="h-4 w-4" />
                    Mark as read
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(notification)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground mt-1">
          {formatRelativeTime(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}