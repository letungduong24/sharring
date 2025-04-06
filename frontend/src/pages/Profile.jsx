import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import useAuthStore from "../store/authStore";
import { toast } from 'sonner';
import Loading from '../components/common/Loading';
import defaultAvt from '../assets/defaultAvt.jpg'
import PostButton from "../components/post/PostButton";
import PostContainer from "../components/post/PostContainer";
import { CiCamera } from "react-icons/ci";
import { uploadImage } from "../lib/uploadImage.js";
import {PhotoView} from "react-photo-view";

const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user, getUserProfile, followUser, unfollowUser, getProfileLoading, followLoading, unfollowLoading, updateProfile, updateProfileLoading, profile } = useAuthStore();
    const [bio, setBio] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [bioError, setBioError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile(username);
                setProfile(data);
                setBio(data.bio || '');
                setUsernameInput(data.username || '');
            } catch (err) {
                console.log(err)
            }
        };

        fetchProfile();
    }, [username, getUserProfile]);

    const handleBioChange = (e) => {
        const value = e.target.value;
        if (value.length <= 100) {
            setBio(value);
            setBioError('');
        } else {
            setBioError('Tiểu sử không được vượt quá 100 ký tự');
        }
    };

    const handleUsernameChange = (e) => {
        setUsernameInput(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (bio.length > 100) {
            setBioError('Tiểu sử không được vượt quá 100 ký tự');
            return;
        }

        try {
            await updateProfile({
                username: usernameInput,
                bio: bio,
                profilePicture: profile.profilePicture
            });
            toast.success('Cập nhật thông tin thành công');
            document.getElementById('my_modal_2').close();
            
            // Redirect to new username if it was changed
            if (usernameInput !== username) {
                navigate(`/profile/${usernameInput}`);
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Cập nhật thông tin thất bại');
        }
    };

    const handleFollow = async () => {
        try {
            await followUser(profile._id);
            setProfile(prev => ({
                ...prev,
                followers: [...prev.followers, user._id],
                isFollowing: true
            }));
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể theo dõi người dùng");
        }
    };

    const handleUnfollow = async () => {
        try {
            await unfollowUser(profile._id);
            setProfile(prev => ({
                ...prev,
                followers: prev.followers.filter(id => id !== user._id),
                isFollowing: false
            }));
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể bỏ theo dõi người dùng");
        }
    };

    const handleImageClick = () => {
        document.getElementById('image_modal').showModal();
    };

    const handleAccept = async () => {
        if (!selectedImage) {
            toast.error('Vui lòng chọn ảnh');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('file', selectedImage);
            formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);

            const imageUrl = await uploadImage(formData);
            if (!imageUrl) {
                throw new Error('Upload ảnh thất bại');
            }

            await updateProfile({
                username: profile.username,
                bio: profile.bio,
                profilePicture: imageUrl
            });

            // Update the profile state with the new image URL
            setProfile(prev => ({
                ...prev,
                profilePicture: imageUrl
            }));

            toast.success('Cập nhật ảnh đại diện thành công');
            document.getElementById('image_modal').close();
            setSelectedImage(null);
        } catch (err) {
            toast.error(err.message || 'Cập nhật ảnh đại diện thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    if (getProfileLoading) {
        return (
            <Loading />
        );
    }

    if (!profile && !getProfileLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
                <p className="text-gray-600 text-5xl font-bold">404</p>
                <p className="text-gray-600 text-2xl ">Không tìm thấy trang cá nhân</p>
            </div>
        );
    }

    const isOwnProfile = user._id === profile._id;

    return (
        <div className="text-gray-600 min-h-screen w-full p-2 md:p-5 bg-gray-50 flex flex-col items-center gap-5">
            <div className="w-full md:w-3/4 lg:w-1/2 h-fit bg-white md:rounded-xl border border-gray-200 shadow-md">
                <div className="w-full grid grid-cols-2 p-5">
                    {/* info section */}
                    <div className="flex flex-col justify-between">
                        <div className="">
                            <h4 className="font-bold text-2xl">{profile.username}</h4>
                            <h4 className=" text-sm font-semibold">{profile.bio || 'Chưa có tiểu sử'}</h4>
                        </div>
                        <div className="">
                            <h4 className="text-sm">{profile.followers?.length !==0 ? `${profile.followers?.length} người theo dõi` : 'Không có người theo dõi'}</h4>
                        </div>
                    </div>
                    {/* avatar section */}
                    <div className="w-full justify-end flex relative">
                        <PhotoView 
                            src={profile.profilePicture || defaultAvt}
                            animation={false}
                        >
                            <img 
                                className="cursor-pointer w-25 aspect-square rounded-full object-cover" 
                                src={profile.profilePicture || defaultAvt} 
                                alt="" 
                            />
                        </PhotoView>
                        <CiCamera 
                            onClick={handleImageClick}
                            className="w-8 h-8 absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-300 stroke-[1.0] cursor-pointer hover:bg-gray-100" 
                        />
                    </div>
                </div>
                {isOwnProfile && (
                    <div className="w-full px-5 pb-5">
                        <button onClick={()=>document.getElementById('my_modal_2').showModal()} className="border border-gray-300 font-bold cursor-pointer w-full px-2 py-2 rounded-lg">Sửa trang cá nhân</button>
                    </div>
                )}
            </div>

            {isOwnProfile && (
                <PostButton />
            )}

            <PostContainer userId={profile._id} />
            
            <dialog id="my_modal_2" className="modal text-gray-600">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Sửa trang cá nhân</h3>
                    <form className="w-full" onSubmit={handleSubmit}>
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
                                value={usernameInput}
                                onChange={handleUsernameChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                            />
                        </div>
                        <div className="mb-2">
                            <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-gray-600"
                            >
                                Tiểu sử
                            </label>
                            <textarea
                                type="text"
                                id="bio"
                                name="bio"
                                rows={5}
                                value={bio}
                                onChange={handleBioChange}
                                className={`w-full px-3 py-2 border ${bioError ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600`}
                            />
                            <div className="flex justify-between items-center mt-1">
                                {bioError && (
                                    <span className="text-red-500 text-sm">{bioError}</span>
                                )}
                                <span className={`text-sm ${bio.length > 90 ? 'text-red-500' : 'text-gray-500'}`}>
                                    {bio.length}/100
                                </span>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={updateProfileLoading}
                            className="w-full bg-black text-gray-200 font-bold text-lg px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updateProfileLoading ? 'Đang cập nhật...' : 'Sửa'}
                        </button>
                    </form>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Image Preview Modal */}
            <dialog id="image_modal" className="modal text-gray-600">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Cập nhật ảnh đại diện</h3>
                    <div className="w-full flex flex-col gap-4">
                        <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center">
                            {selectedImage ? (
                                <img 
                                    src={URL.createObjectURL(selectedImage)} 
                                    alt="Preview" 
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="text-gray-400 text-center">
                                    <p>Chưa có ảnh</p>
                                </div>
                            )}
                        </div>
                        <input 
                            type="file" 
                            id="imageInput" 
                            accept="image/*" 
                            className="hidden"
                            onChange={(e) => setSelectedImage(e.target.files[0])}
                        />
                        <label 
                            htmlFor="imageInput"
                            className="w-full border border-gray-300 font-bold text-lg px-4 py-2 rounded-md hover:bg-gray-100 transition-all duration-300 cursor-pointer text-center"
                        >
                            Chọn ảnh
                        </label>
                        <div className="flex gap-2">
                            <button 
                                onClick={handleAccept}
                                disabled={isUploading || !selectedImage}
                                className="flex-1 bg-black text-gray-200 font-bold text-lg px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isUploading ? 'Đang tải lên...' : 'Đồng ý'}
                            </button>
                            <button 
                                onClick={() => {
                                    document.getElementById('image_modal').close();
                                    setSelectedImage(null);
                                }}
                                className="flex-1 border border-gray-300 font-bold text-lg px-4 py-2 rounded-md hover:bg-gray-100 transition-all duration-300 cursor-pointer"
                            >
                                Hủy
                            </button>
                        </div>
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>
        </div>
    );
};

export default Profile; 