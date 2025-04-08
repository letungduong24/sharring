import React, { useState } from 'react';
import PostButton from '../components/post/PostButton';
import PostContainer from '../components/post/PostContainer';
import usePostStore from '../store/postStore';

const Feed = () => {
    const [activeTab, setActiveTab] = useState('following');
    const {feedLoading, feedLoadingMore} = usePostStore()

    return (
        <div className="text-gray-600 min-h-screen w-full p-2 md:p-5 bg-gray-50 flex flex-col items-center gap-5">
            <div role="tablist" className="tabs tabs-box">
                <button 
                    disabled={feedLoading}
                    role="tab" 
                    className={` tab ${activeTab === 'following' ? 'tab-active' : ''} cursor-pointer`}
                    onClick={() => setActiveTab('following')}
                >
                    Đang theo dõi
                </button>
                <button 
                    disabled={feedLoading}
                    role="tab" 
                    className={`tab ${activeTab === 'explore' ? 'tab-active' : ''} cursor-pointer`}
                    onClick={() => setActiveTab('explore')}
                >
                    Khám phá
                </button>
            </div>
            <PostButton />
            <PostContainer type={activeTab} />
        </div>
    );
};

export default Feed;

