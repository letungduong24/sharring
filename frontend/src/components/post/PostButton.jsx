import React from 'react'
import useAuthStore from '../../store/authStore'
import PostComposer from './PostComposer'

const PostButton = () => {
  const { user } = useAuthStore()

  const handleOpenModal = () => {
    document.getElementById('post_modal').showModal();
  }

  return (
    <>
      <div className="w-full md:w-3/4 lg:w-1/2 h-fit bg-white md:rounded-xl border border-gray-200 shadow-md">
        <div className="w-full p-5">
          <p className="font-bold mb-2">{user.username} ơi, có gì mới không?</p>
          <button 
            onClick={handleOpenModal}
            className="bg-black/90 text-gray-200 font-bold cursor-pointer w-full px-2 py-2 rounded-lg"
          >
            Đăng bài
          </button>
        </div>
      </div>
      <PostComposer />
    </>
  )
}

export default PostButton