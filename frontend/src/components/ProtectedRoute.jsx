import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Loading from './common/Loading';

const ProtectedRoute = ({ children }) => {
    const { user, loading } = useAuthStore();

    if (loading) {
        return (
            <Loading />
        );
    }

    if (!user) {
        return <Navigate to="/signin" replace />;
    }

    return children;
};

export default ProtectedRoute; 