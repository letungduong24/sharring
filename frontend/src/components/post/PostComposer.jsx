import React, { useState, useRef } from 'react';
import useAuthStore from '../../store/authStore';
import usePostStore from '../../store/postStore';
import { toast } from 'sonner';
import { CiImageOn } from "react-icons/ci";
import { uploadImage } from '../../lib/uploadImage';
import { IoMdClose } from "react-icons/io";

const PostComposer = () => {
    const [content, setContent] = useState('');
    const [images, setImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);
    const { user } = useAuthStore();
    const { createPost, createPostLoading } = usePostStore();

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB in bytes

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Check total number of images
        if (files.length + images.length > 10) {
            toast.error('Bạn chỉ có thể tải lên tối đa 10 ảnh');
            return;
        }

        // Check file sizes
        const oversizedFiles = files.filter(file => file.size > MAX_FILE_SIZE);
        if (oversizedFiles.length > 0) {
            toast.error(`Các ảnh sau vượt quá 10MB: ${oversizedFiles.map(f => f.name).join(', ')}`);
            return;
        }

        files.forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => [...prev, reader.result]);
                setImages(prev => [...prev, file]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
        setImages(prev => prev.filter((_, i) => i !== index));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!content.trim() && images.length === 0) {
            toast.error('Vui lòng nhập nội dung hoặc thêm ảnh');
            return;
        }

        try {
            setIsUploading(true);
            let imageUrls = [];
            
            if (images.length > 0) {
                for (const image of images) {
                    const formData = new FormData();
                    formData.append('file', image);
                    formData.append('upload_preset', import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET);
                    const imageUrl = await uploadImage(formData);
                    
                    if (!imageUrl) {
                        throw new Error('Upload ảnh thất bại');
                    }
                    imageUrls.push(imageUrl);
                }
            }

            const postData = {
                content: content.trim(),
                media: imageUrls
            };
            console.log(postData)
            await createPost(postData);
            toast.success('Đăng bài thành công');
            setContent('');
            setImages([]);
            setImagePreviews([]);
            document.getElementById('post_modal').close();
        } catch (error) {
            toast.error(error.message || 'Đăng bài thất bại');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <dialog id="post_modal" className="modal text-gray-600">
            <div className="modal-box">
                <h3 className="font-bold text-lg mb-4">Tạo bài viết</h3>
                <form className="w-full" onSubmit={handleSubmit}>
                    <div className="flex gap-3 items-start mb-4">
                        <img 
                            src={user.profilePicture || '/default-avatar.png'} 
                            alt="avatar" 
                            className="w-10 h-10 rounded-full"
                        />
                        <textarea
                            className="flex-1 border border-gray-300 rounded-md p-2 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-gray-500 text-gray-600"
                            placeholder={`${user.username} ơi, bạn đang nghĩ gì thế?`}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                    </div>
                    {imagePreviews.length > 0 && (
                        <div className="mb-4">
                            <div className="grid grid-cols-3 gap-2">
                                {imagePreviews.map((preview, index) => (
                                    <div key={index} className="relative aspect-square">
                                        <img 
                                            src={preview} 
                                            alt={`preview-${index}`} 
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md"
                                        >
                                            <IoMdClose className='cursor-pointer'/>
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">
                                    {imagePreviews.length}/10 ảnh
                                </p>
                                <p className="text-sm text-gray-500">
                                    Tối đa 10MB/ảnh
                                </p>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-between items-center">
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
                            multiple
                            className="hidden"
                        />
                        <button
                            type="submit"
                            disabled={createPostLoading || isUploading || (!content.trim() && images.length === 0)}
                            className={`cursor-pointer px-4 py-2 rounded-md font-bold ${
                                createPostLoading || isUploading || (!content.trim() && images.length === 0)
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-black text-gray-200 hover:bg-gray-700 hover:text-white transition-all duration-300'
                            }`}
                        >
                            {createPostLoading || isUploading ? 'Đang đăng...' : 'Đăng'}
                        </button>
                    </div>
                </form>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    );
};

export default PostComposer; 