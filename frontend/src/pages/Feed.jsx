import React, { useState } from 'react';
import PostButton from '../components/post/PostButton';
import PostContainer from '../components/post/PostContainer';

const Feed = () => {
    const [activeTab, setActiveTab] = useState('following');

    return (
        <div className="text-gray-600 min-h-screen w-full p-2 md:p-5 bg-gray-50 flex flex-col items-center gap-5">
            <div role="tablist" className="tabs tabs-box">
                <a 
                    role="tab" 
                    className={`tab ${activeTab === 'following' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('following')}
                >
                    Đang theo dõi
                </a>
                <a 
                    role="tab" 
                    className={`tab ${activeTab === 'explore' ? 'tab-active' : ''}`}
                    onClick={() => setActiveTab('explore')}
                >
                    Khám phá
                </a>
            </div>
            <PostButton />
            <PostContainer type={activeTab} />
        </div>
    );
};

export default Feed;

