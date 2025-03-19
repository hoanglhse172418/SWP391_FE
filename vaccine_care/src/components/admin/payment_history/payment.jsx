import React, { useState, useEffect } from 'react';
import { Table, Tag, Spin, message } from 'antd';
import axios from 'axios';
import './payment.css';

// Move API_BASE_URL to a separate config file or environment variable
const API_BASE_URL = 'https://vaccinecare.azurewebsites.net/api';

const PaymentHistory = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/Payment/get-all`);
        
        if (response.data && response.data.$values) {
          // Transform và lọc data - chỉ lấy những payment có type
          const transformedData = response.data.$values
            .filter(payment => payment.type !== null) // Lọc bỏ các payment có type null
            .map(payment => {
              const vaccineNames = payment.items.$values.map(item => item.vaccineName).join(', ');
              
              return {
                key: payment.paymentId.toString(),
                id: payment.paymentId,
                date: 'N/A', 
                customerName: 'N/A',
                childName: 'N/A',
                amount: payment.totalPrice,
                paymentMethod: payment.paymentMethod === 'Cash' ? 'Tiền mặt' : 
                              payment.paymentMethod === 'VNPay' ? 'VNPay' : 
                              'Khác',
                status: payment.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán',
                type: payment.type,
                packageStatus: payment.packageProcessStatus,
                vaccines: vaccineNames
              };
            });
          
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
        
        let displayText = 'Không xác định';
        let color = 'default';
        
        if (type === 'Single') {
          displayText = 'Đơn lẻ';
          color = 'blue';
        } else if (type === 'Package') {
          displayText = 'Gói';
          color = 'purple';
        }
        
        return <Tag color={color}>{displayText}</Tag>;
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
      render: (amount) => `${parseInt(amount).toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      filters: [
        { text: 'Tiền mặt', value: 'Tiền mặt' },
        { text: 'VNPay', value: 'VNPay' },
        { text: 'Khác', value: 'Khác' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Trạng thái thanh toán',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Đã thanh toán' ? 'green' : 'red'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Trạng thái gói',
      dataIndex: 'packageStatus',
      key: 'packageStatus',
      render: (status) => {
        let color = 'orange';
        let text = 'Chưa hoàn thành';
        
        if (status === 'Completed') {
          color = 'green';
          text = 'Đã hoàn thành';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Đã hoàn thành', value: 'Completed' },
        { text: 'Chưa hoàn thành', value: 'NotComplete' },
      ],
      onFilter: (value, record) => record.packageStatus === value,
    },
  ];

  // Update payment status translations
  const getPaymentStatus = (status) => {
    switch (status) {
      case 'Đã thanh toán':
        return 'Paid';
      case 'Chưa thanh toán':
        return 'Unpaid';
      default:
        return status;
    }
  };

  // Update payment method translations
  const getPaymentMethod = (method) => {
    switch (method) {
      case 'Tiền mặt':
        return 'Cash';
      case 'Phương thức khác':
        return 'Other';
      default:
        return method;
    }
  };

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
