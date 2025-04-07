import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/post/PostCard';
import usePostStore from '../store/postStore';
import { useEffect } from 'react';
import { toast } from 'sonner';
import PostSkeleton from '../components/post/PostSkeleton';

const PostDetail = () => {
 const {id} = useParams();
 const navigate = useNavigate();
 const {getPostById, currentPost, isLoadingPost} = usePostStore();

 useEffect(() => {
    getPostById(id);
 }, [id, getPostById]);

 if (isLoadingPost) {
    return <PostSkeleton />;
 }

 if (!currentPost) {
    return (
        <div className='w-full h-full md:h-screen bg-gray-50'>
            <div className='flex flex-col justify-center items-center h-full gap-4'>
                <h1 className='text-2xl font-bold text-gray-600'>Bài viết không tồn tại</h1>
                <button 
                    onClick={() => navigate('/')}
                    className='cursor-pointer px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors'
                >
                    Quay lại trang chủ
                </button>
            </div>
        </div>
    );
 }

 return <div className='flex justify-center md:h-screen h-full items-center text-gray-600 w-full bg-gray-50'>
        <div className="bg-white w-full h-fit md:w-3/4 lg:w-1/2 rounded-xl border border-gray-200 shadow-md p-5">
            <PostCard post={currentPost} isLast={true} isFirst={true}/>
        </div>
  </div>;
};

export default PostDetail;