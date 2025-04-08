import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space } from 'antd';
import api from '../../../services/api';
import './disease.css';
import '../admin.css';

// Constants
const INITIAL_DISEASE = { id: null, name: '' };

// Table columns configuration
const columns = [
    {
        title: 'ID',
        dataIndex: 'id',
        key: 'id',
        width: 100
    },
    {
        title: 'Tên bệnh',
        dataIndex: 'name',
        key: 'name',
    },
    {
        title: 'Thao tác',
        key: 'action',
        width: 200,
        render: (_, record, { onUpdate, onDelete }) => (
            <Space size="middle">
                <Button type="primary" onClick={() => onUpdate(record)}>
                    Cập nhật
                </Button>
                <Button type="primary" danger onClick={() => onDelete(record)}>
                    Xóa
                </Button>
            </Space>
        ),
    }
];

// Data processing functions
const formatDiseaseData = (disease) => ({
    id: disease.id,
    name: disease.name
});

const Disease = () => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [newDiseaseName, setNewDiseaseName] = useState('');
    const [selectedDisease, setSelectedDisease] = useState(INITIAL_DISEASE);

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const response = await api.get('/Disease/get-all?PageSize=30');
            setDiseases(response.data.$values.map(formatDiseaseData));
        } catch (error) {
            console.error('Error fetching diseases:', error);
            message.error('Có lỗi xảy ra khi tải danh sách bệnh');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDisease = async () => {
        try {
            if (!newDiseaseName.trim()) {
                message.error('Vui lòng nhập tên bệnh');
                return;
            }

            await api.post('/Disease/create', null, {
                params: { name: newDiseaseName.trim() }
            });

            message.success('Thêm bệnh mới thành công');
            setIsCreateModalVisible(false);
            setNewDiseaseName('');
            fetchDiseases();
        } catch (error) {
            console.error('Error creating disease:', error);
            message.error('Có lỗi xảy ra khi thêm bệnh mới');
        }
    };

    const handleUpdateDisease = async () => {
        try {
            if (!selectedDisease?.name.trim()) {
                message.error('Vui lòng nhập tên bệnh');
                return;
            }

            await api.put(`/Disease/update/${selectedDisease.id}`, null, {
                params: { name: selectedDisease.name.trim() }
            });

            message.success('Cập nhật bệnh thành công');
            setIsUpdateModalVisible(false);
            setSelectedDisease(INITIAL_DISEASE);
            fetchDiseases();
        } catch (error) {
            console.error('Error updating disease:', error);
            message.error('Có lỗi xảy ra khi cập nhật bệnh');
        }
    };

    const handleDeleteDisease = async () => {
        try {
            await api.delete(`/Disease/delete/${selectedDisease.id}`);
            message.success('Xóa bệnh thành công');
            setIsDeleteModalVisible(false);
            setSelectedDisease(INITIAL_DISEASE);
            fetchDiseases();
        } catch (error) {
            console.error('Error deleting disease:', error);
            message.error('Có lỗi xảy ra khi xóa bệnh');
        }
    };

    const handleModalClose = (type) => {
        switch (type) {
            case 'create':
                setIsCreateModalVisible(false);
                setNewDiseaseName('');
                break;
            case 'update':
                setIsUpdateModalVisible(false);
                setSelectedDisease(INITIAL_DISEASE);
                break;
            case 'delete':
                setIsDeleteModalVisible(false);
                setSelectedDisease(INITIAL_DISEASE);
                break;
        }
    };

    const tableColumns = columns.map(col => {
        if (col.key === 'action') {
            return {
                ...col,
                render: (_, record) => col.render(_, record, {
                    onUpdate: (disease) => {
                        setSelectedDisease(disease);
                        setIsUpdateModalVisible(true);
                    },
                    onDelete: (disease) => {
                        setSelectedDisease(disease);
                        setIsDeleteModalVisible(true);
                    }
                })
            };
        }
        return col;
    });

    return (
        <div className="admin">
            <div className="disease-management">
                <div className="disease-management-header">
                    <h2 className="disease-management-title">Quản lý bệnh</h2>
                    <Button
                        type="primary"
                        onClick={() => setIsCreateModalVisible(true)}
                        className="create-disease-button"
                    >
                        Thêm bệnh mới
                    </Button>
                </div>
                
                <Table 
                    columns={tableColumns} 
                    dataSource={diseases}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />

                <Modal
                    title="Thêm bệnh mới"
                    open={isCreateModalVisible}
                    onOk={handleCreateDisease}
                    onCancel={() => handleModalClose('create')}
                    okText="Thêm"
                    cancelText="Hủy"
                >
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Tên bệnh:</label>
                        <Input
                            value={newDiseaseName}
                            onChange={(e) => setNewDiseaseName(e.target.value)}
                            placeholder="Nhập tên bệnh"
                        />
                    </div>
                </Modal>

                <Modal
                    title="Cập nhật bệnh"
                    open={isUpdateModalVisible}
                    onOk={handleUpdateDisease}
                    onCancel={() => handleModalClose('update')}
                    okText="Cập nhật"
                    cancelText="Hủy"
                >
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Tên bệnh:</label>
                        <Input
                            value={selectedDisease?.name || ''}
                            onChange={(e) => setSelectedDisease(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            placeholder="Nhập tên bệnh"
                        />
                    </div>
                </Modal>

                <Modal
                    title="Xác nhận xóa"
                    open={isDeleteModalVisible}
                    onOk={handleDeleteDisease}
                    onCancel={() => handleModalClose('delete')}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <p>Bạn có chắc chắn muốn xóa bệnh "{selectedDisease?.name}" không?</p>
                </Modal>
            </div>
        </div>
    );
};

export default Disease; 