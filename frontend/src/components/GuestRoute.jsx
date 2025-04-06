import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const GuestRoute = ({ children }) => {
    const { user } = useAuthStore();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return children;
};

export default GuestRoute;  
