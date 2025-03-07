import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SidebarAdmin.css';
import { FaUser, FaTachometerAlt, FaUsers, FaSyringe, FaHistory, FaChild, FaVirus, FaSignOutAlt } from 'react-icons/fa';

const SidebarAdmin = ({ isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        // Thêm logic đăng xuất ở đây nếu cần (xóa token, clear localStorage, etc.)
        navigate('/');
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <ul>
                <li>
                    <Link to="/admin/dashboard" className={location.pathname === '/admin/dashboard' ? 'active' : ''}>
                        <FaTachometerAlt className="sidebar-icon" />
                        {!isCollapsed && "Dashboard"}
                    </Link>
                </li>
                <li>
                    <Link to="/admin/staff" className={location.pathname === '/admin/staff' ? 'active' : ''}>
                        <FaUsers className="sidebar-icon" />
                        {!isCollapsed && "Staffs"}
                    </Link>
                </li>
                <li>
                    <Link to="/admin/vaccine" className={location.pathname === '/admin/vaccine' ? 'active' : ''}>
                        <FaSyringe className="sidebar-icon" />
                        {!isCollapsed && "Vaccine"}
                    </Link>
                </li>
                <li>
                    <Link to="/admin/child" className={location.pathname === '/admin/child' ? 'active' : ''}>
                        <FaChild className="sidebar-icon" />
                        {!isCollapsed && "Children"}
                    </Link>
                </li>
                <li>
                    <Link to="/admin/disease" className={location.pathname === '/admin/disease' ? 'active' : ''}>
                        <FaVirus className="sidebar-icon" />
                        {!isCollapsed && "Diseases"}
                    </Link>
                </li>
                <li>
                    <Link to="/admin/payment-history" className={location.pathname === '/admin/payment-history' ? 'active' : ''}>
                        <FaHistory className="sidebar-icon" />
                        {!isCollapsed && "Payment History"}
                    </Link>
                </li>
                <li className="logout-item">
                    <button onClick={handleLogout} className="logout-button">
                        <FaSignOutAlt className="sidebar-icon" />
                        {!isCollapsed && "Logout"}
                    </button>
                </li>
            </ul>
        </div>
    );
};

export default SidebarAdmin;