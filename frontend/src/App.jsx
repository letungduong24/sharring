import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import ProtectedRoute from './components/ProtectedRoute';
import GuestRoute from './components/GuestRoute';
import NavBar from './components/common/NavBar';
import useAuthStore from './store/authStore';
import { Toaster } from 'sonner';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Topbar from './components/common/Topbar'
import { PhotoProvider } from 'react-photo-view';
import 'react-photo-view/dist/react-photo-view.css';
 
const App = () => {
    const { checkAuth } = useAuthStore();

    useEffect(() => {
        checkAuth();
    }, [checkAuth]);

    return (
        <PhotoProvider style={{ zIndex: 1000 }}>
        <Router>
            <Toaster 
                position="top-center" 
                toastOptions={{
                    style: {
                        background: 'white',
                    },
                }}
            />
            <div className="min-h-screen w-full flex flex-col md:flex-row relative">
                <Topbar />
                <NavBar />
                <main className="flex-grow w-full pb-15 md:pl-20 md:pb-0">
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/signin" element={<GuestRoute><SignIn /></GuestRoute>} />
                        <Route path="/signup" element={<GuestRoute><SignUp /></GuestRoute>} />
                        {/* Protected Routes */}
                        <Route
                            path="/"
                            element={
                                <ProtectedRoute>
                                    <Feed />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/profile/:username"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />

                        {/* Catch all route */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </main>
            </div>
        </Router>
        </PhotoProvider>

    );
};

export default App;
