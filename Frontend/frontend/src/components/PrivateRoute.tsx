import { Navigate, Outlet } from 'react-router-dom';

const PrivateRoute = () => {
  const accessToken = localStorage.getItem('access_token');

  return accessToken ? <Outlet /> : <Navigate to="/login"/>;
};

export default PrivateRoute;
