import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, message } from 'antd';
import axios from 'axios';
import './payment.css';
import '../admin.css';

// Constants
const API_BASE_URL = 'https://vaccinecare.azurewebsites.net/api';

const PAYMENT_TYPES = {
    Single: { text: 'Đơn lẻ', color: 'blue' },
    Package: { text: 'Gói', color: 'purple' }
};

const PAYMENT_METHODS = {
    Cash: 'Tiền mặt',
    VNPay: 'VNPay',
    Other: 'Khác'
};

const PAYMENT_STATUS = {
    Paid: { text: 'Đã thanh toán', color: 'green' },
    Unpaid: { text: 'Chưa thanh toán', color: 'red' }
};

const PACKAGE_STATUS = {
    Completed: { text: 'Đã hoàn thành', color: 'green' },
    NotComplete: { text: 'Chưa hoàn thành', color: 'orange' }
};

// Helper functions
const formatAmount = (amount) => `${parseInt(amount).toLocaleString('vi-VN')} VNĐ`;

const getVaccineNames = (items) => {
    if (!items?.$values) return 'N/A';
    return items.$values.map(item => item.vaccineName).join(', ');
};

const transformPaymentData = (payment) => ({
    key: payment.paymentId.toString(),
    id: payment.paymentId,
    date: 'N/A',
    customerName: 'N/A',
    childName: 'N/A',
    amount: payment.totalPrice,
    paymentMethod: PAYMENT_METHODS[payment.paymentMethod] || 'Khác',
    status: PAYMENT_STATUS[payment.paymentStatus]?.text || 'Không xác định',
    type: payment.type,
    packageStatus: payment.packageProcessStatus,
    vaccines: getVaccineNames(payment.items)
});

const PaymentHistory = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const response = await axios.get(`${API_BASE_URL}/Payment/get-all`);
                
                if (response.data?.$values) {
                    const transformedData = response.data.$values
                        .filter(payment => payment.type)
                        .map(transformPaymentData);
                    
                    setData(transformedData);
                }
            } catch (error) {
                console.error('Error fetching payment data:', error);
                message.error('Không thể tải dữ liệu thanh toán');
            } finally {
                setLoading(false);
            }
        };

        fetchPayments();
    }, []);

    const columns = [
        {
            title: 'Mã thanh toán',
            dataIndex: 'id',
            key: 'id',
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            key: 'type',
            render: (type) => {
                if (!type) return null;
                const typeConfig = PAYMENT_TYPES[type] || { text: 'Không xác định', color: 'default' };
                return <Tag color={typeConfig.color}>{typeConfig.text}</Tag>;
            }
        },
        {
            title: 'Vắc xin',
            dataIndex: 'vaccines',
            key: 'vaccines',
            ellipsis: true,
        },
        {
            title: 'Số tiền (VNĐ)',
            dataIndex: 'amount',
            key: 'amount',
            render: formatAmount,
            sorter: (a, b) => a.amount - b.amount,
        },
        {
            title: 'Phương thức thanh toán',
            dataIndex: 'paymentMethod',
            key: 'paymentMethod',
            filters: Object.values(PAYMENT_METHODS).map(method => ({ text: method, value: method })),
            onFilter: (value, record) => record.paymentMethod === value,
        },
        {
            title: 'Trạng thái thanh toán',
            dataIndex: 'status',
            key: 'status',
            render: (status) => {
                const statusConfig = Object.values(PAYMENT_STATUS).find(config => config.text === status);
                return <Tag color={statusConfig?.color || 'default'}>{status}</Tag>;
            },
        },
        {
            title: 'Trạng thái gói',
            dataIndex: 'packageStatus',
            key: 'packageStatus',
            render: (status) => {
                const statusConfig = PACKAGE_STATUS[status] || { text: 'Không xác định', color: 'default' };
                return <Tag color={statusConfig.color}>{statusConfig.text}</Tag>;
            },
            filters: Object.entries(PACKAGE_STATUS).map(([value, config]) => ({
                text: config.text,
                value
            })),
            onFilter: (value, record) => record.packageStatus === value,
        },
    ];

    return (
        <div className="admin">
            <div className="payment-history">
                <h2 className="payment-history-title">Lịch sử thanh toán</h2>
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : (
                    <Table 
                        columns={columns} 
                        dataSource={data} 
                        rowKey="key"
                        pagination={{ pageSize: 10 }}
                    />
                )}
            </div>
        </div>
    );
};

export default PaymentHistory;
