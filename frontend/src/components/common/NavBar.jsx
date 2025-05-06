import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import logo from '../../assets/logo.png';
import { CiBookmark } from "react-icons/ci";
import { RiHome3Line } from "react-icons/ri";
import { FiSearch } from "react-icons/fi";
import { RxPerson } from "react-icons/rx";
import { FaPlus } from "react-icons/fa6";
import { HiOutlineMenuAlt2 } from "react-icons/hi";
import { useState, useRef, useEffect } from 'react';
import { IoSettingsOutline } from "react-icons/io5";
import { IoLogOutOutline } from "react-icons/io5";
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import usePostStore from '../../store/postStore';
const menuVariants = {
    initial: { 
        opacity: 0,
        scale: 0.95,
        x: -20
    },
    animate: { 
        opacity: 1,
        scale: 1,
        x: 0,
        transition: {
            type: "spring",
            stiffness: 300,
            damping: 24
        }
    },
    exit: { 
        opacity: 0,
        scale: 0.95,
        x: -20,
        transition: {
            duration: 0.2
        }
    }
};

const itemVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { 
        opacity: 1, 
        x: 0,
        transition: {
            duration: 0.2
        }
    }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

const NavBar = () => {
    const { user, signout } = useAuthStore();
    const navigate = useNavigate();
    const menuRef = useRef(null);

    const handleLogout = async () => {
        await signout();
        toast.success("Đăng xuất thành công!");
        navigate('/signin');
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setShowProfileMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <nav className="bg-gray-50 shadow-lg w-full h-15 md:w-20 fixed bottom-0 md:h-screen flex md:flex-col items-center md:py-8 z-50">
            {/* Logo/Brand */}
            <Link to="/" className="text-white hidden md:block">
                <img src={logo} alt="Logo" className="opacity-65 w-10 h-10 " />
            </Link>

            {/* Navigation Links */}
            <div className="flex md:flex-col flex-1 justify-center cursor-pointer w-full">
                <div className="flex w-full justify-center md:justify-between md:flex-col items-center md:space-y-4">
                    <Link 
                        to="/" 
                        className="flex justify-center items-center md:block rounded-2xl px-6 md:py-3 text-gray-400 hover:bg-gray-200/80 transition-colors"
                    >
                        <RiHome3Line className="text-2xl" />
                    </Link>
                    {user && (
                        <Link 
                            to="/search" 
                            className="flex justify-center items-center md:block rounded-2xl px-6 md:py-3 text-gray-400 hover:bg-gray-200/80 transition-colors"
                        >
                            <FiSearch className="text-2xl" />
                        </Link>
                    )}
                    
                    {user && (
                            <Link 
                                to={`/profile/${user.username}`} 
                                className="flex justify-center items-center md:block rounded-2xl px-6 md:py-3 text-gray-400 hover:bg-gray-200/80 transition-colors"
                            >
                                <RxPerson className="text-2xl" />
                            </Link>
                    )}
                    
                </div>
            </div>

            {user && (
                <button 
                    onClick={() => handleLogout()}
                    className="cursor-pointer flex justify-center items-center md:block rounded-2xl px-6 md:py-3 text-gray-400 hover:bg-gray-200/80 transition-colors"
                >
                    <IoLogOutOutline className="text-2xl" />
                </button>
            )}
        </nav>
    );
};

export default NavBar;  
