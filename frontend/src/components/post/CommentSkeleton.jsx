import React from 'react';

const CommentSkeleton = () => {
    return (
        <div className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200 flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
                <div className="bg-gray-100 rounded-lg p-3">
                    <div className="flex items-center gap-2">
                        <div className="h-4 w-24 bg-gray-200 rounded"></div>
                        <div className="h-3 w-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="mt-2 space-y-2">
                        <div className="h-3 w-full bg-gray-200 rounded"></div>
                        <div className="h-3 w-3/4 bg-gray-200 rounded"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommentSkeleton; 