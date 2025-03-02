import { useEffect, useRef, useState } from "react"; 
import { Link, useParams } from "react-router-dom";

import Posts from "../../components/common/Posts";
import ProfileHeaderSkeleton from "../../components/skeletons/ProfileHeaderSkeleton";
import EditProfileModal from "./EditProfileModal";

import { FaArrowLeft } from "react-icons/fa6";
import { MdEdit } from "react-icons/md";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns"; // ✅ Fix: Importing date-fns for formatting

import useFollow from "../../hooks/useFollow";
import useUpdateUserProfile from "../../hooks/useUpdateUserProfile";
import { baseUrl } from "../../constant/url";

const ProfilePage = () => {
    const [coverImg, setCoverImg] = useState(null);
    const [profileImg, setProfileImg] = useState(null);
    const [feedType, setFeedType] = useState("posts"); // ✅ Ensured feedType state is used

    const coverImgRef = useRef(null);
    const profileImgRef = useRef(null);

    const { username } = useParams();

    const { follow, isPending } = useFollow();
    const { data: authUser } = useQuery({ queryKey: ["authUser"] });

    const {
        data: user,
        isLoading,
        refetch,
        isRefetching,
    } = useQuery({
        queryKey: ["userProfile", username],
        queryFn: async () => {
            const res = await fetch(`${baseUrl}/api/users/profile/${username}`, {
                method: "GET",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.error || "Something went wrong");
            }
            return data;
        },
    });

    const { isUpdatingProfile, updateProfile } = useUpdateUserProfile();

    const isMyProfile = authUser?._id === user?._id;
    const amIFollowing = authUser?.following.includes(user?._id);

    // ✅ Fix: Ensure `memberSinceDate` is properly formatted
    const memberSinceDate = user?.createdAt ? format(new Date(user.createdAt), "MMMM yyyy") : null;

    const handleImgChange = (e, state) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                if (state === "coverImg") setCoverImg(reader.result);
                if (state === "profileImg") setProfileImg(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    useEffect(() => {
        refetch();
    }, [username, refetch]);

    return (
        <>
            <div className='flex-[4_4_0] border-r border-gray-700 min-h-screen'>
                {/* HEADER */}
                {(isLoading || isRefetching) && <ProfileHeaderSkeleton />}
                {!isLoading && !isRefetching && !user && <p className='text-center text-lg mt-4'>User not found</p>}
                
                {!isLoading && !isRefetching && user && (
                    <>
                        <div className='flex gap-10 px-4 py-2 items-center'>
                            <Link to='/'>
                                <FaArrowLeft className='w-4 h-4' />
                            </Link>
                            <div className='flex flex-col'>
                                <p className='font-bold text-lg'>{user?.fullName}</p>
                                <span className='text-sm text-slate-500'>{user?.posts?.length || 0} posts</span>
                            </div>
                        </div>

                        {/* COVER IMAGE */}
                        <div className='relative group/cover'>
                            <img
                                src={coverImg || user?.coverImg || "/cover.png"}
                                className='h-52 w-full object-cover'
                                alt="Cover"
                            />
                            {isMyProfile && (
                                <div
                                    className='absolute top-2 right-2 rounded-full p-2 bg-gray-800 bg-opacity-75 cursor-pointer opacity-0 group-hover/cover:opacity-100 transition duration-200'
                                    onClick={() => coverImgRef.current.click()}
                                >
                                    <MdEdit className='w-5 h-5 text-white' />
                                </div>
                            )}

                            <input
                                type='file'
                                hidden
                                accept='image/*'
                                ref={coverImgRef}
                                onChange={(e) => handleImgChange(e, "coverImg")}
                            />
                            <input
                                type='file'
                                hidden
                                accept='image/*'
                                ref={profileImgRef}
                                onChange={(e) => handleImgChange(e, "profileImg")}
                            />
                        </div>

                        {/* PROFILE IMAGE */}
                        <div className='avatar absolute -bottom-16 left-4'>
                            <div className='w-32 rounded-full relative'>
                                <img src={profileImg || user?.profileImg || "/avatar-placeholder.png"} alt="User profile" />
                                {isMyProfile && (
                                    <MdEdit
                                        className='w-4 h-4 text-white absolute bottom-2 right-2 cursor-pointer'
                                        onClick={() => profileImgRef.current.click()}
                                    />
                                )}
                            </div>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className='flex justify-end px-4 mt-5'>
                            {isMyProfile && <EditProfileModal authUser={authUser} />}
                            {!isMyProfile && (
                                <button className='btn btn-outline rounded-full btn-sm' onClick={() => follow(user?._id)}>
                                    {isPending ? "Loading..." : amIFollowing ? "Unfollow" : "Follow"}
                                </button>
                            )}
                            {(coverImg || profileImg) && (
                                <button
                                    className='btn btn-primary rounded-full btn-sm text-white px-4 ml-2'
                                    onClick={async () => {
                                        await updateProfile({ coverImg, profileImg });
                                        setProfileImg(null);
                                        setCoverImg(null);
                                    }}
                                >
                                    {isUpdatingProfile ? "Updating..." : "Update"}
                                </button>
                            )}
                        </div>

                        {/* PROFILE DETAILS */}
                        <div className='flex flex-col gap-4 mt-14 px-4'>
                            <div className='flex flex-col'>
                                <span className='font-bold text-lg'>{user?.fullName}</span>
                                <span className='text-sm text-slate-500'>@{user?.username}</span>
                                <span className='text-sm my-1'>{user?.bio}</span>
                            </div>

                            {/* MEMBER SINCE */}
                            {memberSinceDate && (
                                <div className='flex items-center gap-2'>
                                    <span className='text-sm text-slate-500'>Joined {memberSinceDate}</span>
                                </div>
                            )}

                            {/* FOLLOWERS & FOLLOWING */}
                            <div className='flex gap-2'>
                                <div className='flex gap-1 items-center'>
                                    <span className='font-bold text-xs'>{user?.following.length}</span>
                                    <span className='text-slate-500 text-xs'>Following</span>
                                </div>
                                <div className='flex gap-1 items-center'>
                                    <span className='font-bold text-xs'>{user?.followers.length}</span>
                                    <span className='text-slate-500 text-xs'>Followers</span>
                                </div>
                            </div>
                        </div>

                        {/* POSTS/LIKES SWITCH */}
                        <div className="flex w-full border-b border-gray-700 mt-4">
                            <div
                                className={`flex justify-center flex-1 p-3 cursor-pointer transition duration-300 ${
                                    feedType === "posts" ? "text-white border-b-2 border-blue-500" : "text-gray-500"
                                }`}
                                onClick={() => setFeedType("posts")}
                            >
                                Posts
                            </div>

                            <div
                                className={`flex justify-center flex-1 p-3 cursor-pointer transition duration-300 ${
                                    feedType === "likes" ? "text-white border-b-2 border-blue-500" : "text-gray-500"
                                }`}
                                onClick={() => setFeedType("likes")}
                            >
                                Likes
                            </div>
                        </div>

                        {/* POSTS SECTION */}
                        <Posts feedType={feedType} username={username} userId={user?._id} />
                    </>
                )}
            </div>
        </>
    );
};

export default ProfilePage;
