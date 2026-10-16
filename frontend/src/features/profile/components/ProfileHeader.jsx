// src/features/profile/components/ProfileHeader.jsx

import { Mail, Phone, Calendar, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn, getInitials, formatDate } from '@/lib/utils';
import { ROLE_ICONS, ROLE_COLORS } from '@/features/users/usersTypes';

export default function ProfileHeader({ user }) {
  if (!user) return null;

  const roleName = user.role?.name || 'user';
  const RoleIcon = ROLE_ICONS[roleName] || Shield;
  const roleColor = ROLE_COLORS[roleName] || {
    color: 'text-muted-foreground',
    bg: 'bg-muted'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar */}
          <div className="h-20 w-20 rounded-full bg-accent/10 flex items-center justify-center shrink-0 ring-4 ring-accent/5">
            <span className="text-2xl font-bold text-accent">
              {getInitials(user.name)}
            </span>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-center sm:text-left">
            <h2 className="text-xl font-bold text-foreground truncate">
              {user.name}
            </h2>
            <p className="text-sm text-muted-foreground truncate">
              {user.email}
            </p>

            {/* Role badge */}
            <div className="flex items-center justify-center sm:justify-start gap-2 mt-3 flex-wrap">
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium',
                  roleColor.bg,
                  roleColor.color
                )}
              >
                <RoleIcon className="h-3.5 w-3.5" />
                <span className="capitalize">{roleName}</span>
              </span>
              <Badge variant="success" className="gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                Active
              </Badge>
              {user.permissionsOverride?.length > 0 && (
                <Badge variant="info" className="text-[10px]">
                  Custom permissions
                </Badge>
              )}
            </div>

            {/* Meta */}
            <div className="flex items-center justify-center sm:justify-start gap-4 mt-3 text-xs text-muted-foreground flex-wrap">
              {user.phone && (
                <span className="flex items-center gap-1.5">
                  <Phone className="h-3 w-3" />
                  {user.phone}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Calendar className="h-3 w-3" />
                Joined {user.createdAt ? formatDate(user.createdAt) : '—'}
              </span>
              {user.lastLogin && (
                <span className="flex items-center gap-1.5">
                  <Mail className="h-3 w-3" />
                  Last login {formatDate(user.lastLogin)}
                </span>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}