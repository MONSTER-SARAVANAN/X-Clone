import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../context/AuthProvider";

const ProtectedRoute = () => {
	const { authUser, isLoading } = useAuth();

	if (isLoading) return <p>Loading...</p>;
	return authUser ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
