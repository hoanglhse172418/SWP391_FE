import React, { useState, useEffect } from 'react';
import './staff.css';
import RegisterForm from './RegisterForm';
import api from '../../../services/api';
import { Modal, message } from 'antd';

const Staff = () => {
    const [activeTab, setActiveTab] = useState('staff'); // 'staff' or 'doctor'
    const [staffMembers, setStaffMembers] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const [sortOption, setSortOption] = useState('name');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [registerType, setRegisterType] = useState('');
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const fetchStaffMembers = async () => {
        try {
            const response = await api.get('/User/get-all?FilterOn=role&FilterQuery=staff');
            setStaffMembers(response.data.$values);
        } catch (error) {
            console.error('Error fetching staff members:', error);
        }
    };

    const fetchDoctors = async () => {
        try {
            const response = await api.get('/User/get-all?FilterOn=role&FilterQuery=doctor');
            setDoctors(response.data.$values);
        } catch (error) {
            console.error('Error fetching doctors:', error);
        }
    };

    useEffect(() => {
        fetchStaffMembers();
        fetchDoctors();
    }, []);

    const handleSort = (option) => {
        const dataToSort = activeTab === 'staff' ? [...staffMembers] : [...doctors];
        const sortedData = dataToSort.sort((a, b) => {
            if (option === 'name') {
                const nameA = a.name ? a.name.toLowerCase() : '';
                const nameB = b.name ? b.name.toLowerCase() : '';
                return nameA.localeCompare(nameB);
            }
            if (option === 'id') {
                const idA = a.id ? a.id.toLowerCase() : '';
                const idB = b.id ? b.id.toLowerCase() : '';
                return idA.localeCompare(idB);
            }
            if (option === 'date') {
                return new Date(a.date) - new Date(b.date);
            }
            if (option === 'status') {
                const statusA = a.status ? a.status.toLowerCase() : '';
                const statusB = b.status ? b.status.toLowerCase() : '';
                return statusA.localeCompare(statusB);
            }
            return 0;
        });
    };

    const handleSortChange = (event) => {
        setSortOption(event.target.value);
        handleSort(event.target.value);
    };

    const handlePageChange = (direction) => {
        if (direction === 'next') {
            setCurrentPage(prev => Math.min(prev + 1, Math.ceil((activeTab === 'staff' ? staffMembers.length : doctors.length) / itemsPerPage)));
        } else {
            setCurrentPage(prev => Math.max(prev - 1, 1));
        }
    };

    const currentData = activeTab === 'staff' ? staffMembers : doctors;
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = currentData.slice(indexOfFirstItem, indexOfLastItem);

    const createStaff = (data) => {
        return api.post('/User/create-staff', {
            username: data.username,
            password: data.password,
            email: data.email
        });
    };

    const createDoctor = (data) => {
        return api.post('/User/create-doctor', {
            username: data.username,
            password: data.password,
            email: data.email
        });
    };

    const handleOpenModal = (type) => {
        setRegisterType(type);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRegisterType('');
    };

    const handleRegister = async (values) => {
        try {
            console.log('Form values:', values);
            
            const payload = {
                username: values.username,
                password: values.password,
                email: values.email
            };
            
            console.log('Sending payload:', payload);

            if (registerType === 'doctor') {
                const response = await createDoctor(payload);
                console.log('Doctor creation response:', response);
            } else {
                const response = await createStaff(payload);
                console.log('Staff creation response:', response);
            }

            if (registerType === 'doctor') {
                await fetchDoctors();
            } else {
                await fetchStaffMembers();
            }

            return true;
        } catch (error) {
            console.error('Error in handleRegister:', error);
            throw error;
        }
    };

    const showDeleteConfirm = (user) => {
        setUserToDelete(user);
        setDeleteModalVisible(true);
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        
        try {
            await api.delete(`/User/delete?id=${userToDelete.id}`);
            message.success(`Successfully deleted ${userToDelete.role === 'doctor' ? 'doctor' : 'staff member'}!`);
            
            if (userToDelete.role === 'doctor') {
                await fetchDoctors();
            } else {
                await fetchStaffMembers();
            }
            
            setDeleteModalVisible(false);
            setUserToDelete(null);
        } catch (error) {
            console.error('Error deleting user:', error);
            message.error('Unable to delete user. Please try again later!');
        }
    };

    return (
        <div className="admin">
            <div className="staff-container">
                <div className="staff-header">
                    <div className="staff-header-left">
                        <h1 className="staff-title">Staff Management</h1>
                        <div className="staff-tabs">
                            <button 
                                className={`tab-button ${activeTab === 'staff' ? 'active' : ''}`}
                                onClick={() => setActiveTab('staff')}
                            >
                                Staff List
                            </button>
                            <button 
                                className={`tab-button ${activeTab === 'doctor' ? 'active' : ''}`}
                                onClick={() => setActiveTab('doctor')}
                            >
                                Doctor List
                            </button>
                        </div>
                    </div>
                    <div className="staff-actions">
                        <button 
                            className="create-account-btn doctor"
                            onClick={() => handleOpenModal('doctor')}
                        >
                            Create Doctor Account
                        </button>
                        <button 
                            className="create-account-btn staff"
                            onClick={() => handleOpenModal('staff')}
                        >
                            Create Staff Account
                        </button>
                    </div>
                </div>
                
                <div className="top-bar">
                    <select value={sortOption} onChange={handleSortChange} className="sort-dropdown">
                        <option value="name">Sort by Name</option>
                        <option value="id">Sort by ID</option>
                        <option value="date">Sort by Date</option>
                        <option value="status">Sort by Status</option>
                    </select>
                </div>

                <div className="table-container">
                    <table className="staff-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Full Name</th>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Created Date</th>
                                {/* <th>Last Updated</th> */}
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map(item => (
                                <tr key={item.id}>
                                    <td>{item.id}</td>
                                    <td>{item.fullname}</td>
                                    <td>{item.username}</td>
                                    <td>{item.email}</td>
                                    <td>{item.role === 'doctor' ? 'Doctor' : 'Staff'}</td>
                                    <td>{new Date(item.createdAt).toLocaleDateString('vi-VN')}</td>
                                    {/* <td>{new Date(item.updatedAt).toLocaleDateString('vi-VN')}</td> */}
                                    <td>
                                        <button 
                                            className="admin-delete-button" 
                                            onClick={() => showDeleteConfirm(item)}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="pagination">
                    <button 
                        onClick={() => handlePageChange('prev')} 
                        disabled={currentPage === 1} 
                        className="nav-button"
                    >
                        ◀ Previous
                    </button>
                    <button 
                        onClick={() => handlePageChange('next')} 
                        disabled={indexOfLastItem >= currentData.length} 
                        className="nav-button"
                    >
                        Next ▶
                    </button>
                </div>

                <RegisterForm 
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    type={registerType}
                    onSubmit={handleRegister}
                />

                <Modal
                    title="Confirm Delete"
                    open={deleteModalVisible}
                    onOk={handleDeleteUser}
                    onCancel={() => {
                        setDeleteModalVisible(false);
                        setUserToDelete(null);
                    }}
                    okText="Delete"
                    cancelText="Cancel"
                >
                    <p>
                        Are you sure you want to delete {userToDelete?.role === 'doctor' ? 'doctor' : 'staff member'} <strong>{userToDelete?.fullname || userToDelete?.username}</strong>?
                    </p>
                    <p>This action cannot be undone.</p>
                </Modal>
            </div>
        </div>
    );
};

export default Staff;