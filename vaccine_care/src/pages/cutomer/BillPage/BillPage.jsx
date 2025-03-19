import React, { useState, useEffect, useContext } from 'react'
import "./BillPage.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Pagination, Tabs, Modal } from 'antd';
import tiemle from '../../../assets/HomePage/tiemle.png'
import tiemtheogoi from '../../../assets/HomePage/tiemtheogoi.png'
import tuvanmuitiem from '../../../assets/HomePage/tuvanmuitiem.png'

function BillPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [payments, setPayments] = useState([]);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState('single');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const pageSize = 3;

  useEffect(() => {
    if (token) {
      api.get("/Payment/get-payments-for-current-user", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const data = response.data.$values;
        // Sắp xếp payments theo paymentId giảm dần (mới nhất lên đầu)
        const sortedData = [...data].sort((a, b) => {
          // Sắp xếp theo paymentId giảm dần (cao nhất lên đầu)
          return b.paymentId - a.paymentId;
        });
        setPayments(sortedData);
      })
      .catch(error => {
        console.error("Error fetching payments:", error);
      });
    }
  }, [token]);

  const handlePayment = async (paymentId) => {
    try {
      const response = await api.get(`/VNPay/CreatePaymentUrl?paymentId=${paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        window.location.href = response.data; // Redirect to VNPay payment URL
      }
    } catch (error) {
      console.error("Error creating payment URL:", error);
      alert("Không thể tạo đường dẫn thanh toán. Vui lòng thử lại sau!");
    }
  };

  const getFilteredPayments = () => {
    return payments.filter(payment => payment.type.toLowerCase() === activeTab.toLowerCase());
  };

  const getCurrentPageData = () => {
    const filteredPayments = getFilteredPayments();
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filteredPayments.slice(startIndex, endIndex);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const getStatusColor = (status) => {
    return status?.toLowerCase() === 'paid' ? 'text-success' : 'text-danger';
  };

  const handlePaymentClick = (payment, e) => {
    e.stopPropagation();
    setSelectedPayment(payment);
    setIsModalVisible(true);
  };

  const renderPaymentDetail = () => {
    if (!selectedPayment) return null;

    return (
      <div className="payment-detail">
        <div className="detail-header">
          <h5 className="mb-4">Chi tiết hóa đơn #{selectedPayment.paymentId}</h5>
          <div className={`status-badge ${getStatusColor(selectedPayment.paymentStatus)}`}>
            {selectedPayment.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
          </div>
        </div>

        <div className="detail-info">
          <div className="info-row">
            <span className="label">Loại thanh toán:</span>
            <span className="value">{selectedPayment.type === 'Single' ? 'Vaccine Lẻ' : 'Gói Vaccine'}</span>
          </div>
          <div className="info-row">
            <span className="label">Tổng tiền:</span>
            <span className="value price">{formatPrice(selectedPayment.totalPrice)}</span>
          </div>
          <div className="info-row">
            <span className="label">Phương thức:</span>
            <span className="value">{selectedPayment.paymentMethod || 'Chưa thanh toán'}</span>
          </div>
        </div>

        <div className="detail-items mt-4">
          <h6 className="mb-3">Danh sách vaccine:</h6>
          {selectedPayment.items.$values.map((item, index) => (
            <div key={index} className="vaccine-item">
              <div className="info-row">
                <span className="label">Tên vaccine:</span>
                <span className="value">{item.vaccineName}</span>
              </div>
              <div className="info-row">
                <span className="label">Số liều:</span>
                <span className="value">{item.doseNumber}</span>
              </div>
              <div className="info-row">
                <span className="label">Giá mỗi liều:</span>
                <span className="value">{formatPrice(item.pricePerDose)}</span>
              </div>
            </div>
          ))}
        </div>

        {selectedPayment.paymentStatus === 'NotPaid' && (
          <div className="text-center mt-4">
            <button 
              className="btn-payment"
              onClick={() => handlePayment(selectedPayment.paymentId)}
            >
              Thanh toán ngay
            </button>
          </div>
        )}
      </div>
    );
  };

  const renderPaymentList = () => {
    const currentData = getCurrentPageData();
    
    return (
      <ul className="list-group">
        {currentData.map((payment) => (
          <li 
            key={payment.paymentId} 
            className={`list-group-item`}
            onClick={(e) => handlePaymentClick(payment, e)}
          >
            <div className="d-flex justify-content-between align-items-start">
              <div className="payment-info">
                <div className="fw-bold">Mã thanh toán: #{payment.paymentId}</div>
                <div className="payment-details">
                  <small>Tổng tiền: {formatPrice(payment.totalPrice)}</small>
                  <div className="vaccine-list-preview">
                    {payment.items.$values.map((item, index) => (
                      <small key={index} className="d-block">
                        - {item.vaccineName} (Số liều: {item.doseNumber})
                      </small>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-end d-flex flex-column align-items-end">
                <div className={`status-badge ${getStatusColor(payment.paymentStatus)}`}>
                  {payment.paymentStatus === 'Paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                </div>
                {payment.paymentStatus === 'NotPaid' && (
                  <button 
                    className="btn-payment mt-3"
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePayment(payment.paymentId);
                    }}
                  >
                    Thanh toán
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div className='HomePage-Allcontainer'>
      <div className="HomePage-main-container">
        <div className='container'>
          <div className='row'>
            <div className='col-12 mt-152 BookingPage-titletitle'>
              <div className="BookingPage-heading-protected-together">
                Hóa đơn
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container py-4'>
        <div className='bill-list-container'>
          <div className="bill-card p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4>Danh sách hóa đơn</h4>
            </div>
            
            <Tabs
              activeKey={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  key: 'single',
                  label: 'Vaccine Lẻ',
                  children: renderPaymentList()
                },
                {
                  key: 'package',
                  label: 'Gói Vaccine',
                  children: renderPaymentList()
                }
              ]}
            />
            
            <div className="pagination-container mt-3">
              <Pagination
                current={currentPage}
                total={getFilteredPayments().length}
                pageSize={pageSize}
                onChange={setCurrentPage}
              />
            </div>
          </div>
        </div>

        <Modal
          title={null}
          visible={isModalVisible}
          onCancel={() => setIsModalVisible(false)}
          footer={null}
          width={700}
          className="payment-detail-modal"
        >
          {renderPaymentDetail()}
        </Modal>

        <div className="service-categories mt-5">
          <h4 className="text-center mb-4">Danh mục dịch vụ</h4>
          <div className="row justify-content-center">
            <div className="col-md-4 mb-4">
              <div className="service-card">
                <img src={tiemle} alt="Tiêm lẻ" className="service-image" />
                <h5 className="service-title">Tiêm theo gói</h5>
                <p className="service-description">
                  Tiêm chủng theo gói với nhiều ưu đãi hấp dẫn
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="service-card">
                <img src={tiemtheogoi} alt="Tiêm theo gói" className="service-image" />
                <h5 className="service-title">Tiêm lẻ</h5>
                <p className="service-description">
                  Tiêm chủng từng mũi riêng lẻ theo nhu cầu
                </p>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="service-card">
                <img src={tuvanmuitiem} alt="Tư vấn" className="service-image" />
                <h5 className="service-title">Tư vấn mũi tiêm</h5>
                <p className="service-description">
                  Tư vấn lịch tiêm chủng phù hợp cho trẻ
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillPage;
