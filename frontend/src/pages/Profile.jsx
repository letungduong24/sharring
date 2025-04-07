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
import usePostStore from "../store/postStore";
const Profile = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const { user, getUserProfile, followUser, unfollowUser, getProfileLoading, followLoading, unfollowLoading, updateProfile, updateProfileLoading, profile, setProfile } = useAuthStore();
    const [bio, setBio] = useState('');
    const [usernameInput, setUsernameInput] = useState('');
    const [bioError, setBioError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isFollowing, setIsFollowing] = useState(false);
    console.log(username)
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const data = await getUserProfile(username);
                setBio(data.bio || '');
                setUsernameInput(data.username || '');
                // Check if current user is following this profile
                if (data.followers && user) {
                    setIsFollowing(data.followers.some(follower => follower._id === user._id));
                }
            } catch (err) {
                console.log(err)
            }
        };

        fetchProfile();

        return () => {
            usePostStore.getState().resetProfilePosts();
        }
    }, [username, getUserProfile, user?._id]);

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
            if (isFollowing) {
                await unfollowUser(profile._id);
                setIsFollowing(false);
                // Update the profile's followers array
                setProfile({
                    ...profile,
                    followers: profile.followers.filter(follower => follower._id !== user._id)
                });
            } else {
                await followUser(profile._id);
                setIsFollowing(true);
                // Update the profile's followers array
                setProfile({
                    ...profile,
                    followers: [...profile.followers, { _id: user._id }]
                });
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Không thể thực hiện thao tác");
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


            toast.success('Cập nhật ảnh đại diện thành công');
            document.getElementById('image_modal').close();
            setSelectedImage(null);
        } catch (err) {
            toast.error(err.message || 'Cập nhật ảnh đại diện thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    const handleOpenFollowers = () => {
        document.getElementById('followers_modal').showModal();
    };

    const handleOpenFollowing = () => {
        document.getElementById('following_modal').showModal();
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
                        <div className="flex gap-4">
                            <button 
                                onClick={handleOpenFollowers}
                                className="text-sm hover:underline cursor-pointer"
                            >
                                {profile.followers?.length || 0} người theo dõi
                            </button>
                            <button 
                                onClick={handleOpenFollowing}
                                className="text-sm hover:underline cursor-pointer"
                            >
                                {profile.following?.length || 0} đang theo dõi
                            </button>
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
                        {isOwnProfile && (
                            <CiCamera 
                                onClick={handleImageClick}
                                className="w-8 h-8 absolute bottom-0 right-0 bg-white rounded-full p-2 border border-gray-300 stroke-[1.0] cursor-pointer hover:bg-gray-100" 
                            />
                        )}
                    </div>
                </div>
                <div className="w-full px-5 pb-5">
                    {isOwnProfile ? (
                        <button 
                            onClick={()=>document.getElementById('my_modal_2').showModal()} 
                            className="border border-gray-300 font-bold cursor-pointer w-full px-2 py-2 rounded-lg"
                        >
                            Sửa trang cá nhân
                        </button>
                    ) : (
                        <button 
                            onClick={handleFollow}
                            disabled={followLoading || unfollowLoading}
                            className={`w-full px-2 py-2 rounded-lg font-bold cursor-pointer ${
                                isFollowing 
                                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                                    : 'bg-black text-white hover:bg-gray-800'
                            }`}
                        >
                            {followLoading || unfollowLoading 
                                ? 'Đang xử lý...' 
                                : isFollowing 
                                    ? 'Bỏ theo dõi' 
                                    : 'Theo dõi'
                            }
                        </button>
                    )}
                </div>
            </div>

            {isOwnProfile && <PostButton />}

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

            {/* Followers Modal */}
            <dialog id="followers_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Người theo dõi</h3>
                    <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                        {profile.followers?.length > 0 ? (
                            profile.followers.map((follower) => (
                                <div 
                                    key={follower._id} 
                                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                    onClick={() => {
                                        document.getElementById('followers_modal').close();
                                        navigate(`/profile/${follower.username}`);
                                    }}
                                >
                                    <img 
                                        src={follower.profilePicture || defaultAvt} 
                                        alt={follower.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{follower.username}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Chưa có người theo dõi</p>
                        )}
                    </div>
                </div>
                <form method="dialog" className="modal-backdrop">
                    <button>close</button>
                </form>
            </dialog>

            {/* Following Modal */}
            <dialog id="following_modal" className="modal">
                <div className="modal-box">
                    <h3 className="font-bold text-lg mb-4">Đang theo dõi</h3>
                    <div className="flex flex-col gap-2 max-h-[60vh] overflow-y-auto">
                        {profile.following?.length > 0 ? (
                            profile.following.map((following) => (
                                <div 
                                    key={following._id} 
                                    className="flex items-center gap-3 p-2 hover:bg-gray-100 rounded-lg cursor-pointer"
                                    onClick={() => {
                                        document.getElementById('following_modal').close();
                                        navigate(`/profile/${following.username}`);
                                    }}
                                >
                                    <img 
                                        src={following.profilePicture || defaultAvt} 
                                        alt={following.username}
                                        className="w-10 h-10 rounded-full object-cover"
                                    />
                                    <div>
                                        <p className="font-semibold">{following.username}</p>
                                        <p className="text-sm text-gray-500">{following.bio || 'Chưa có tiểu sử'}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">Chưa theo dõi ai</p>
                        )}
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