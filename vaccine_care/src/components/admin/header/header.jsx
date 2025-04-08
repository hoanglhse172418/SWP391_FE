import React, { useState, useRef, useEffect } from 'react';
import './header.css';
import logo from '../../../assets/logo_vaccine.png'; // Adjust the path as necessary
import profileImage from '../../../assets/cat.jpg'; // Ensure this path is correct
import { IoMenuOutline } from "react-icons/io5"; // Import icon
import axios from 'axios';
import { Spin } from 'antd';

// Constants
const API_BASE_URL = 'https://vaccinecare.azurewebsites.net/api';

// Helper functions
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('vi-VN');
};

const formatRole = (role) => {
    if (!role) return 'N/A';
    return role.charAt(0).toUpperCase() + role.slice(1);
};

const Header = ({ toggleSidebar }) => { // Nhận toggleSidebar như một prop
    const [showModal, setShowModal] = useState(false);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const modalRef = useRef(null);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/User/get/1`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowModal(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const renderUserInfo = () => (
        <>
            <div className="admin-info-item">
                <strong>Email:</strong>
                <span>{userData?.email || 'N/A'}</span>
            </div>
            <div className="admin-info-item">
                <strong>Vai trò:</strong>
                <span>{formatRole(userData?.role)}</span>
            </div>
            <div className="admin-info-item">
                <strong>Ngày tạo:</strong>
                <span>{formatDate(userData?.createdAt)}</span>
            </div>
            <div className="admin-info-item">
                <strong>Đăng nhập cuối:</strong>
                <span>{formatDate(userData?.lastLogin)}</span>
            </div>
            <div className="admin-info-item">
                <strong>Cập nhật cuối:</strong>
                <span>{formatDate(userData?.updatedAt)}</span>
            </div>
        </>
    );

    return (
        <div className="admin-header">
            <div className="admin-header-title">
                <button 
                    className="admin-sidebar-toggle-btn" 
                    onClick={toggleSidebar}
                    aria-label="Toggle Sidebar"
                >
                    <IoMenuOutline />
                </button>
                <img src={logo} alt="Logo" className="admin-header-logo" />
                <span className="admin-header-admin-text">Quản trị viên</span>
            </div>

            <div className="admin-icons">
                <div 
                    className="admin-profile-picture" 
                    onClick={() => setShowModal(true)}
                    role="button"
                    tabIndex={0}
                    onKeyPress={(e) => e.key === 'Enter' && setShowModal(true)}
                >
                    <img src={profileImage} alt="Profile" />
                </div>
            </div>

            {showModal && (
                <div className="admin-profile-modal-overlay">
                    <div className="admin-profile-modal" ref={modalRef}>
                        {loading ? (
                            <div className="admin-loading-container">
                                <Spin size="large" />
                            </div>
                        ) : (
                            <>
                                <div className="admin-profile-modal-header">
                                    <img 
                                        src={profileImage} 
                                        alt="Profile" 
                                        className="admin-modal-profile-img" 
                                    />
                                    <h2>Thông tin tài khoản</h2>
                                </div>
                                <div className="admin-profile-modal-content">
                                    {renderUserInfo()}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Header;