import { useAuth } from '../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import StaffDashboard from './StaffDashboard';
import AdminDashboard from './AdminDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  if (user.role === 'admin') return <AdminDashboard />;
  if (user.role === 'staff') return <StaffDashboard />;
  return <StudentDashboard />;
};

export default Dashboard;
