import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import api from '../../../services/api';
import './child.css';

const Child = () => {
    const [children, setChildren] = useState([]);
    const [loading, setLoading] = useState(true);

    const getAllChildren = () => api.get('/Child/get-all');

    useEffect(() => {
        fetchChildren();
    }, []);

    const fetchChildren = async () => {
        try {
            const response = await getAllChildren();
            const formattedData = response.data.$values.map(child => ({
                id: child.id,
                name: child.childrenFullname,
                dateOfBirth: new Date(child.dob).toLocaleDateString('vi-VN'),
                gender: child.gender,
                fatherName: child.fatherFullName,
                motherName: child.motherFullName,
                fatherPhone: child.fatherPhoneNumber,
                motherPhone: child.motherPhoneNumber,
                address: child.address,
            }));
            setChildren(formattedData);
        } catch (error) {
            console.error('Error fetching children:', error);
        } finally {
            setLoading(false);
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Full Name',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Date of Birth',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
        },
        {
            title: 'Gender',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: "Father's Name",
            dataIndex: 'fatherName',
            key: 'fatherName',
        },
        {
            title: "Father's Phone",
            dataIndex: 'fatherPhone',
            key: 'fatherPhone',
        },
        {
            title: "Mother's Name",
            dataIndex: 'motherName',
            key: 'motherName',
        },
        {
            title: "Mother's Phone",
            dataIndex: 'motherPhone',
            key: 'motherPhone',
        },
        {
            title: 'Address',
            dataIndex: 'address',
            key: 'address',
        },
    ];

    return (
        <div className="admin">
            <div className="child-management">
                <h2 className="child-management-title">Child Management</h2>
                <Table 
                    columns={columns} 
                    dataSource={children}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />
            </div>
        </div>
    );
};

export default Child; 