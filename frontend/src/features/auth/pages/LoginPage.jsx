// src/features/auth/pages/LoginPage.jsx

import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

import RoleSelectionPage from './RoleSelectionPage';
import LoginFormPage from './LoginFormPage';
import FullPageLoader from '@/components/common/FullPageLoader';
import { getRoleConfig } from '../authTypes';

export default function LoginPage() {
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  // ✅ Selected role state
  const [selectedRole, setSelectedRole] = useState(null);

  // ✅ Loading state — for smoother auth transitions
  const [isChecking, setIsChecking] = useState(true);

  // ✅ Simulate auth check (300ms)
  useEffect(() => {
    const timer = setTimeout(() => setIsChecking(false), 300);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Loading screen
  if (isChecking) {
    return <FullPageLoader message="Checking authentication..." />;
  }

  // ✅ Already authenticated → redirect
  if (isAuthenticated && user) {
    return <Navigate to={from} replace />;
  }

  // Step 1: Role selection
  if (!selectedRole) {
    return <RoleSelectionPage onSelectRole={setSelectedRole} />;
  }

  // Step 2: Login form (role-specific)
  const roleConfig = getRoleConfig(selectedRole);
  return (
    <LoginFormPage
      role={roleConfig}
      onBack={() => setSelectedRole(null)}
    />
  );
}