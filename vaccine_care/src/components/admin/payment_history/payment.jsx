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
                paymentMethod: payment.paymentMethod === 'Cash' ? 'Cash' : 
                              payment.paymentMethod === 'VNPay' ? 'VNPay' : 
                              'Other',
                status: payment.paymentStatus === 'Paid' ? 'Paid' : 'Unpaid',
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
      title: 'Payment ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        if (!type) return null;
        
        let displayText = 'Unknown';
        let color = 'default';
        
        if (type === 'Single') {
          displayText = 'Single';
          color = 'blue';
        } else if (type === 'Package') {
          displayText = 'Package';
          color = 'purple';
        }
        
        return <Tag color={color}>{displayText}</Tag>;
      }
    },
    {
      title: 'Vaccines',
      dataIndex: 'vaccines',
      key: 'vaccines',
      ellipsis: true,
    },
    {
      title: 'Amount (VND)',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount) => `${parseInt(amount).toLocaleString('vi-VN')} VNĐ`,
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      filters: [
        { text: 'Cash', value: 'Cash' },
        { text: 'VNPay', value: 'VNPay' },
        { text: 'Other', value: 'Phương thức khác' },
      ],
      onFilter: (value, record) => record.paymentMethod === value,
    },
    {
      title: 'Payment Status',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Paid' ? 'green' : 'red'}>
          {status === 'Paid' ? 'Paid' : 'Unpaid'}
        </Tag>
      ),
    },
    {
      title: 'Package Status',
      dataIndex: 'packageStatus',
      key: 'packageStatus',
      render: (status) => {
        let color = 'orange';
        let text = 'Incomplete';
        
        if (status === 'Completed') {
          color = 'green';
          text = 'Completed';
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Completed', value: 'Completed' },
        { text: 'Incomplete', value: 'NotComplete' },
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
        <h2 className="payment-history-title">Payment History</h2>
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
