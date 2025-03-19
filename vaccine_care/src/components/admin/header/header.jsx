import React, { useState, useRef, useEffect } from 'react';
import './header.css';
import logo from '../../../assets/logo_vaccine.png'; // Adjust the path as necessary
import profileImage from '../../../assets/cat.jpg'; // Ensure this path is correct
import { IoMenuOutline } from "react-icons/io5"; // Import icon
import axios from 'axios';
import { Spin } from 'antd';

const API_BASE_URL = 'https://vaccinecare.azurewebsites.net/api';

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

    // Format date function
    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="admin-header">
            <div className="admin-header-title">
                <button className="admin-sidebar-toggle-btn" onClick={toggleSidebar}>
                    <IoMenuOutline />
                </button>
                <img src={logo} alt="Logo" className="admin-header-logo" />
                <span className="admin-header-admin-text">Admin</span>
            </div>
            <div className="admin-header-search-container">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="admin-header-search-input" 
                    aria-label="Search"
                />
                <div className="admin-icons">
                    <div className="admin-profile-picture" onClick={() => setShowModal(true)}>
                        <img src={profileImage} alt="Profile" />
                    </div>
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
                                    <img src={profileImage} alt="Profile" className="admin-modal-profile-img" />
                                    <h2>Account Information</h2>
                                </div>
                                <div className="admin-profile-modal-content">
                                    <div className="admin-info-item">
                                        <strong>Email:</strong>
                                        <span>{userData?.email || 'N/A'}</span>
                                    </div>
                                    <div className="admin-info-item">
                                        <strong>Role:</strong>
                                        <span>{userData?.role ? userData.role.charAt(0).toUpperCase() + userData.role.slice(1) : 'N/A'}</span>
                                    </div>
                                    <div className="admin-info-item">
                                        <strong>Created At:</strong>
                                        <span>{formatDate(userData?.createdAt)}</span>
                                    </div>
                                    <div className="admin-info-item">
                                        <strong>Last Login:</strong>
                                        <span>{formatDate(userData?.lastLogin)}</span>
                                    </div>
                                    <div className="admin-info-item">
                                        <strong>Last Updated:</strong>
                                        <span>{formatDate(userData?.updatedAt)}</span>
                                    </div>
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