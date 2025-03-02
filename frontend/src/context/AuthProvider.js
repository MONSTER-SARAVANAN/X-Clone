import { createContext, useContext, useEffect, useState } from "react";
import { getToken, removeToken } from "../utils/auth";
import { useQuery } from "@tanstack/react-query";
import { baseUrl } from "../constant/url";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [authUser, setAuthUser] = useState(null);

	const { data, isLoading, refetch } = useQuery({
		queryKey: ["authUser"],
		queryFn: async () => {
			const token = getToken();
			if (!token) return null;

			const res = await fetch(`${baseUrl}/api/auth/me`, {
				headers: { Authorization: `Bearer ${token}` },
			});
			const user = await res.json();
			return res.ok ? user : null;
		},
	});

	useEffect(() => {
		setAuthUser(data);
	}, [data]);

	const logout = () => {
		removeToken();
		setAuthUser(null);
	};

	return (
		<AuthContext.Provider value={{ authUser, isLoading, refetch, logout }}>
			{children}
		</AuthContext.Provider>
	);
};

export const useAuth = () => useContext(AuthContext);
