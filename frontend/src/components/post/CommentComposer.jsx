import React, { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import usePostStore from '../../store/postStore';
import { toast } from 'sonner';
import { CiImageOn } from "react-icons/ci";
import { uploadImage } from '../../lib/uploadImage';
import { IoMdClose } from "react-icons/io";

const CommentComposer = ({ postId }) => {
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { user } = useAuthStore();
    const { commentPost, commentPostLoading } = usePostStore();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            toast.error('Ảnh vượt quá 10MB');
            return;
        }

        const reader = new FileReader();
        reader.onloadend = () => {
            setImagePreview(reader.result);
            setImage(file);
        };
        reader.readAsDataURL(file);
    };

    const removeImage = () => {
        setImagePreview(null);
        setImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && !image) {
            toast.error('Vui lòng nhập nội dung hoặc thêm ảnh');
            return;
        }

        try {
            setIsUploading(true);
            let imageUrl = null;
            
            if (image) {
                const formData = new FormData();
                formData.append('file', image);
                formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                imageUrl = await uploadImage(formData);
                
                if (!imageUrl) {
                    throw new Error('Upload ảnh thất bại');
                }
            }

            const commentData = {
                content: content.trim(),
                image: imageUrl
            };

            await commentPost({ postId, ...commentData });
            toast.success('Bình luận thành công');
            setContent('');
            setImage(null);
            setImagePreview(null);
        } catch (error) {
            toast.error(error.message || 'Bình luận thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="flex gap-3 items-start">
            <img 
                src={user.profilePicture || '/default-avatar.png'} 
                alt="avatar" 
                className="w-8 h-8 rounded-full"
            />
            <div className="flex-1">
                <form className="w-full" onSubmit={handleSubmit}>
                    <textarea
                        className="w-full border border-gray-300 rounded-md p-2 min-h-[80px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                        placeholder="Viết bình luận..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                    />
                    {imagePreview && (
                        <div className="mt-2 relative w-32">
                            <img 
                                src={imagePreview} 
                                alt="preview" 
                                className="w-full h-32 object-cover rounded-lg"
                            />
                            <button
                                type="button"
                                onClick={removeImage}
                                className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                            >
                                <IoMdClose className='cursor-pointer'/>
                            </button>
                        </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                        <button
                            type="button"
                            onClick={() => fileInputRef.current.click()}
                            className="cursor-pointer text-gray-600 flex items-center gap-1 font-semibold"
                        >
                            <CiImageOn className='stroke-[1]'/>
                            <span>Thêm ảnh</span>
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <button
                            type="submit"
                            disabled={commentPostLoading || isUploading || (!content.trim() && !image)}
                            className={`cursor-pointer px-4 py-2 rounded-md font-bold ${
                                commentPostLoading || isUploading || (!content.trim() && !image)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-gray-200 hover:bg-gray-700 hover:text-white transition-all duration-300'
                            }`}
                        >
                            {commentPostLoading || isUploading ? 'Đang gửi...' : 'Gửi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CommentComposer; 