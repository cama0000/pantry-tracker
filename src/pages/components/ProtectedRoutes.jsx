import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoutes = ({ children }) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  return user ? children : null;
};

export default ProtectedRoutes;
