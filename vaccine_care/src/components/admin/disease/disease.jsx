import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Input, message, Space } from 'antd';
import api from '../../../services/api';
import './disease.css';
import '../admin.css';

const Disease = () => {
    const [diseases, setDiseases] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
    const [newDiseaseName, setNewDiseaseName] = useState('');
    const [selectedDisease, setSelectedDisease] = useState(null);

    const getAllDiseases = () => api.get('/Disease/get-all?PageSize=30');

    useEffect(() => {
        fetchDiseases();
    }, []);

    const fetchDiseases = async () => {
        try {
            const response = await getAllDiseases();
            const formattedData = response.data.$values.map(disease => ({
                id: disease.id,
                name: disease.name
            }));
            setDiseases(formattedData);
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
                params: {
                    name: newDiseaseName.trim()
                }
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
                params: {
                    name: selectedDisease.name.trim()
                }
            });

            message.success('Cập nhật bệnh thành công');
            setIsUpdateModalVisible(false);
            setSelectedDisease(null);
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
            setSelectedDisease(null);
            fetchDiseases();
        } catch (error) {
            console.error('Error deleting disease:', error);
            message.error('Có lỗi xảy ra khi xóa bệnh');
        }
    };

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
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="primary"
                        onClick={() => {
                            setSelectedDisease(record);
                            setIsUpdateModalVisible(true);
                        }}
                    >
                        Cập nhật
                    </Button>
                    <Button
                        type="primary"
                        danger
                        onClick={() => {
                            setSelectedDisease(record);
                            setIsDeleteModalVisible(true);
                        }}
                    >
                        Xóa
                    </Button>
                </Space>
            ),
        }
    ];

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
                    columns={columns} 
                    dataSource={diseases}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    loading={loading}
                />

                {/* Modal tạo bệnh mới */}
                <Modal
                    title="Thêm bệnh mới"
                    open={isCreateModalVisible}
                    onOk={handleCreateDisease}
                    onCancel={() => {
                        setIsCreateModalVisible(false);
                        setNewDiseaseName('');
                    }}
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

                {/* Modal cập nhật bệnh */}
                <Modal
                    title="Cập nhật bệnh"
                    open={isUpdateModalVisible}
                    onOk={handleUpdateDisease}
                    onCancel={() => {
                        setIsUpdateModalVisible(false);
                        setSelectedDisease(null);
                    }}
                    okText="Cập nhật"
                    cancelText="Hủy"
                >
                    <div style={{ marginBottom: 16 }}>
                        <label style={{ display: 'block', marginBottom: 8 }}>Tên bệnh:</label>
                        <Input
                            value={selectedDisease?.name || ''}
                            onChange={(e) => 
                                setSelectedDisease(prev => ({
                                    ...prev,
                                    name: e.target.value
                                }))
                            }
                            placeholder="Nhập tên bệnh"
                        />
                    </div>
                </Modal>

                {/* Modal xác nhận xóa bệnh */}
                <Modal
                    title="Xác nhận xóa"
                    open={isDeleteModalVisible}
                    onOk={handleDeleteDisease}
                    onCancel={() => {
                        setIsDeleteModalVisible(false);
                        setSelectedDisease(null);
                    }}
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