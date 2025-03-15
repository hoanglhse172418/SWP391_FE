import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './SidebarAdmin.css';
import { FaUsers, FaSyringe, FaChild, FaVirus, FaSignOutAlt } from 'react-icons/fa';
import { useContext } from 'react';
import { AuthContext } from '../../../context/AuthContext';

const SidebarAdmin = ({ isCollapsed }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { logout } = useContext(AuthContext);

    const handleLogout = () => {
        // Xóa token và cập nhật trạng thái đăng nhập
        logout();
        // Điều hướng về trang chủ
        navigate("/");
    };

    return (
        <div className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <ul>
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