import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, message } from 'antd';
import api from '../../../services/api';
import './child.css';
import '../admin.css';

const formatChildData = (child) => ({
    id: child.id,
    name: child.childrenFullname,
    dateOfBirth: new Date(child.dob).toLocaleDateString('vi-VN'),
    gender: child.gender,
    fatherName: child.fatherFullName,
    motherName: child.motherFullName,
    fatherPhone: child.fatherPhoneNumber,
    motherPhone: child.motherPhoneNumber,
    address: child.address,
});

const Child = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [childToDelete, setChildToDelete] = useState(null);

    const showDeleteConfirm = (child) => {
        console.log('Showing delete confirmation for child:', child);
        setChildToDelete(child);
        setIsDeleteModalVisible(true);
    };

    const columns = [
        { title: 'ID', dataIndex: 'id', key: 'id' },
        { title: 'Họ và tên', dataIndex: 'name', key: 'name' },
        { title: 'Ngày sinh', dataIndex: 'dateOfBirth', key: 'dateOfBirth' },
        { title: 'Giới tính', dataIndex: 'gender', key: 'gender' },
        { title: "Tên cha", dataIndex: 'fatherName', key: 'fatherName' },
        { title: "Số điện thoại cha", dataIndex: 'fatherPhone', key: 'fatherPhone' },
        { title: "Tên mẹ", dataIndex: 'motherName', key: 'motherName' },
        { title: "Số điện thoại mẹ", dataIndex: 'motherPhone', key: 'motherPhone' },
        { title: 'Địa chỉ', dataIndex: 'address', key: 'address' },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Button 
                    type="primary" 
                    danger 
                    onClick={() => showDeleteConfirm(record)}
                >
                    Xóa
                </Button>
            ),
        },
    ];

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await api.get('/Child/get-all?PageSize=100');
            console.log('Fetched children:', response.data.$values);
            setChildren(response.data.$values.map(formatChildData));
        } catch (error) {
            console.error('Error fetching children:', error);
            message.error('Có lỗi xảy ra khi tải danh sách trẻ em');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteChild = async () => {
        if (!childToDelete) {
            console.error("No child selected for deletion");
            return;
        }
        
        console.log("Attempting to delete child with ID:", childToDelete.id);
        
        try {
            const response = await api.delete(`/Child/delete/${childToDelete.id}`);
            console.log("Delete API response:", response);
            
            message.success('Xóa thông tin trẻ thành công');
            await fetchChildren(); // Refresh danh sách sau khi xóa
            setIsDeleteModalVisible(false);
            setChildToDelete(null);
        } catch (error) {
            console.error('Error deleting child:', error);
            console.error('Error details:', {
                response: error.response,
                message: error.message,
                status: error.response?.status
            });
            message.error('Có lỗi xảy ra khi xóa thông tin trẻ');
        }
    };

    return (
        <div className="admin">
            <div className="child-management">
                <h2 className="child-management-title">Quản lý trẻ em</h2>
                <Table 
                    columns={columns} 
                    dataSource={children}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />

                <Modal
                    title="Xác nhận xóa"
                    open={isDeleteModalVisible}
                    onOk={handleDeleteChild}
                    onCancel={() => {
                        console.log('Canceling delete operation');
                        setIsDeleteModalVisible(false);
                        setChildToDelete(null);
                    }}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <p>Bạn có chắc chắn muốn xóa thông tin của trẻ <strong>{childToDelete?.name}</strong>?</p>
                    <p>Hành động này không thể hoàn tác.</p>
                </Modal>
            </div>
        </div>
    );
};

export default Child; 