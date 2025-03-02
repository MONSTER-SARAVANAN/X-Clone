import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import XSvg from "../../../components/svgs/X";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { baseUrl } from "../../../constant/url";
import toast from "react-hot-toast";
import LoadingSpinner from "../../../components/common/LoadingSpinner";
import { setToken } from "../../../utils/auth"; // Token storage utility

const LoginPage = () => {
	const [formData, setFormData] = useState({
		username: "",
		password: "",
	});
	const navigate = useNavigate();
	const queryClient = useQueryClient();

	const {
		mutate: login,
		isPending,
		isError,
		error,
	} = useMutation({
		mutationFn: async ({ username, password }) => {
			const res = await fetch(`${baseUrl}/api/auth/login`, {
				method: "POST",
				credentials: "include", // Ensure cookies are sent with requests
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ username, password }),
			});

			const data = await res.json();
			if (!res.ok) {
				throw new Error(data.error || "Something went wrong");
			}

			// Save token and return data
			setToken(data.token);
			return data;
		},
		onSuccess: () => {
			toast.success("Login successful!");
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
			navigate("/home"); // Redirect to home page after login
		},
		onError: (error) => {
			toast.error(error?.message || "Login failed");
		},
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		login(formData);
	};

	const handleInputChange = (e) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	return (
		<div className='max-w-screen-xl mx-auto flex h-screen'>
			<div className='flex-1 hidden lg:flex items-center justify-center'>
				<XSvg className='lg:w-2/3 fill-white' />
			</div>
			<div className='flex-1 flex flex-col justify-center items-center'>
				<form className='flex gap-4 flex-col' onSubmit={handleSubmit}>
					<XSvg className='w-24 lg:hidden fill-white' />
					<h1 className='text-4xl font-extrabold text-white'>{"Let's"} go.</h1>
					<label className='input input-bordered rounded flex items-center gap-2'>
						<FaUser />
						<input
							type='text'
							className='grow'
							placeholder='Username'
							name='username'
							onChange={handleInputChange}
							value={formData.username}
							required
						/>
					</label>

					<label className='input input-bordered rounded flex items-center gap-2'>
						<MdPassword />
						<input
							type='password'
							className='grow'
							placeholder='Password'
							name='password'
							onChange={handleInputChange}
							value={formData.password}
							required
						/>
					</label>
					<button type="submit" className='btn rounded-full btn-primary text-white'>
						{isPending ? <LoadingSpinner /> : "Login"}
					</button>
					{isError && <p className='text-red-500'>{error?.message}</p>}
				</form>
				<div className='flex flex-col gap-2 mt-4'>
					<p className='text-white text-lg'>{"Don't"} have an account?</p>
					<Link to='/signup'>
						<button className='btn rounded-full btn-primary text-white btn-outline w-full'>Sign up</button>
					</Link>
				</div>
			</div>
		</div>
	);
};

export default LoginPage;
