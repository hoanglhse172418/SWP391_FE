import React, { useState, useEffect } from 'react';
import { Table } from 'antd';
import api from '../../../services/api';
import './child.css';
import '../admin.css';

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
            title: 'Họ và tên',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Ngày sinh',
            dataIndex: 'dateOfBirth',
            key: 'dateOfBirth',
        },
        {
            title: 'Giới tính',
            dataIndex: 'gender',
            key: 'gender',
        },
        {
            title: "Tên cha",
            dataIndex: 'fatherName',
            key: 'fatherName',
        },
        {
            title: "Số điện thoại cha",
            dataIndex: 'fatherPhone',
            key: 'fatherPhone',
        },
        {
            title: "Tên mẹ",
            dataIndex: 'motherName',
            key: 'motherName',
        },
        {
            title: "Số điện thoại mẹ",
            dataIndex: 'motherPhone',
            key: 'motherPhone',
        },
        {
            title: 'Địa chỉ',
            dataIndex: 'address',
            key: 'address',
        },
    ];

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
            </div>
        </div>
    );
};

export default Child; 