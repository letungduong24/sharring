import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import signUpImage from '../assets/signup.jpg'
import { toast } from 'sonner';
import DarkSmallLoading from '../components/common/DarkSmallLoading';

const SignUp = () => {
    const navigate = useNavigate();
    const { signup, signUploading } = useAuthStore();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate form inputs
        if (!formData.username.trim()) {
            toast.error("Vui lòng nhập tên người dùng");
            return;
        }
        
        if (!formData.email.trim()) {
            toast.error("Vui lòng nhập email");
            return;
        }
        
        if (!formData.password.trim()) {
            toast.error("Vui lòng nhập mật khẩu");
            return;
        }

        try {
            await signup(formData);
            toast.success("Đăng ký thành công!");
            navigate('/');
        } catch (err) {
            toast.error(err.response?.data?.message || "Đăng ký thất bại. Vui lòng thử lại.");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 bg-opacity-95 text-white flex flex-col relative">
            <div className="flex-grow grid grid-cols-1 md:grid-cols-2 min-h-0">
                <div className="relative text-center md:text-start w-full h-full">
                    <img className="w-full h-full object-cover" src={signUpImage} alt="" />
                </div>
                <div className="w-full h-full flex justify-center items-center flex-col">
                    <h1 className="text-gray-600 text-4xl md:text-5xl font-bold mb-1">sharre!</h1>
                    <p className="text-gray-600 text-sm md:text-md ">Chia sẻ những điều mới ngay hôm nay!</p>
                    <form onSubmit={handleSubmit} className="max-w-lg w-full px-4 sm:px-8">
                        <div className="mb-4">
                            <label
                                htmlFor="username"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Tên người dùng
                            </label>
                            <input
                                type="text"
                                id="username"
                                name="username"
                                value={formData.username}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                            />
                        </div>
                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Mật khẩu
                            </label>
                            <input
                                type="password"
                                id="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                            />
                        </div>
                        {signUpLoading ? (
                            <DarkSmallLoading />
                        ) : (
                            <button
                                type="submit"
                                className="w-full bg-black text-gray-200 font-bold text-lg px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-300 cursor-pointer"
                            >
                                Đăng ký
                            </button>
                        )}
                        
                    </form>
                    <div className="mt-4">
                        <p className="text-sm text-gray-500">
                            Đã có tài khoản? <Link to="/signin" className="text-blue-500 hover:text-blue-600">Đăng nhập</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp; 