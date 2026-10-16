// src/routes/ProtectedRoute.jsx
// ✅ Branded loading with FullPageLoader

import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useGetMeQuery } from '@/features/auth/authApi';
import { setUser } from '@/features/auth/authSlice';
import FullPageLoader from '@/components/common/FullPageLoader';

export default function ProtectedRoute({ children }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const user = useSelector((state) => state.auth.user);
  const accessToken = useSelector((state) => state.auth.accessToken);

  // ✅ Fetch user on mount if token exists but user missing (refresh case)
  const {
    data: meRes,
    isLoading,
    isError
  } = useGetMeQuery(undefined, {
    skip: !isAuthenticated || !accessToken || !!user
  });

  // ✅ Update Redux when getMe succeeds
  useEffect(() => {
    if (meRes?.data) {
      dispatch(setUser(meRes.data));
    }
  }, [meRes, dispatch]);

  // ✅ Not authenticated → redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ Loading state — branded full page loader
  if (!user && isLoading) {
    return <FullPageLoader message="Loading your workspace..." />;
  }

  // ✅ Error state — getMe fail (token expired / invalid)
  if (!user && isError) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}