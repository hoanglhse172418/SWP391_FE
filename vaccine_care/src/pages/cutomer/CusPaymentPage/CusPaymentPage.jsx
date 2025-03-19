import React, { useState, useEffect, useContext } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import api from '../../../services/api';
import './CusPaymentPage.css';
import { Spin } from 'antd';

function CusPaymentPage() {
  const { paymentId } = useParams();
  const { token } = useContext(AuthContext);
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState(null);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cashPaymentStatus, setCashPaymentStatus] = useState('initial'); // 'initial', 'processing', 'success'
  const location = useLocation();

  // Kiểm tra kết quả thanh toán VNPay khi quay lại
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const vnpayStatus = urlParams.get('vnp_ResponseCode');
    
    if (vnpayStatus && appointmentDetails?.id) {
      api.get('/VNPay/ReturnUrl' + window.location.search, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(async response => {
        if (vnpayStatus === '00') {
          try {
            // Sửa cách gọi API - truyền trực tiếp vào URL
            await api.put(
              `/Payment/update-status-payment-status/confirm-payment?appointmentId=${appointmentDetails.id}&paymentMethod=VNPay`,
              null,
              {
                headers: { Authorization: `Bearer ${token}` }
              }
            );
            
            console.log("Cập nhật trạng thái thanh toán thành công");
            navigate('/paymentss');
          } catch (error) {
            console.error('Lỗi khi cập nhật trạng thái thanh toán:', error);
            console.log('appointmentId:', appointmentDetails.id);
            navigate('/paymentFaild');
          }
        } else {
          navigate('/paymentFaild');
        }
      })
      .catch(error => {
        console.error('Lỗi khi kiểm tra kết quả thanh toán:', error);
        navigate('/paymentFaild');
      });
    }
  }, [navigate, token, appointmentDetails]);

  // Xử lý thanh toán tiền mặt
  const handleCashPayment = () => {
    if (cashPaymentStatus === 'initial') {
      setCashPaymentStatus('processing');
    } else if (cashPaymentStatus === 'processing') {
      setCashPaymentStatus('success');
      // Có thể thêm API call để cập nhật trạng thái thanh toán
      setTimeout(() => {
        navigate('/bill'); // Chuyển về trang hóa đơn sau khi thanh toán thành công
      }, 2000);
    }
  };

  // Xử lý thanh toán VNPay
  const handleVNPayPayment = async () => {
    try {
      // Lưu appointmentId vào sessionStorage để sử dụng khi callback
      if (appointmentDetails?.id) {
        sessionStorage.setItem('currentAppointmentId', appointmentDetails.id);
      }
      
      const response = await api.get(`/VNPay/CreatePaymentUrl?PaymentId=${paymentDetails?.paymentId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Chuyển hướng đến trang thanh toán VNPay
      if (response.data) {
        window.location.href = response.data;
      }
    } catch (error) {
      console.error('Lỗi khi tạo URL thanh toán:', error);
      alert('Không thể tạo đường dẫn thanh toán. Vui lòng thử lại sau!');
    }
  };

  // Fetch payment and appointment details
  useEffect(() => {
    // Nếu đang xử lý VNPay return URL, không fetch dữ liệu
    if (location.search && location.search.includes('vnp_ResponseCode')) {
      return;
    }
    
    const fetchDetails = async () => {
      try {
        // Fetch payment details
        const paymentResponse = await api.get(`/Payment/detail/${paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPaymentDetails(paymentResponse.data);

        // Fetch customer appointments
        const appointmentsResponse = await api.get("/Appointment/customer-appointments", {
          headers: { Authorization: `Bearer ${token}` }
        });

        // Tìm appointment tương ứng từ danh sách
        const findAppointment = () => {
          const singleAppointments = appointmentsResponse.data.singleVaccineAppointments.$values;
          const packageAppointments = appointmentsResponse.data.packageVaccineAppointments.$values;
          
          // Tìm trong single appointments
          const singleMatch = singleAppointments.find(
            appt => appt.paymentId === parseInt(paymentId)
          );
          if (singleMatch) return singleMatch;

          // Tìm trong package appointments
          const packageMatch = packageAppointments.find(
            pkg => pkg.paymentId === parseInt(paymentId)
          );
          return packageMatch;
        };

        const matchedAppointment = findAppointment();
        if (matchedAppointment) {
          setAppointmentDetails(matchedAppointment);
        }
        
        setLoading(false);
      } catch (err) {
        setError('Không thể tải thông tin thanh toán');
        setLoading(false);
      }
    };

    if (paymentId && token) {
      fetchDetails();
    }
  }, [paymentId, token, location.search]);

  const getStatusBadgeClass = (status) => {
    switch(status?.toLowerCase()) {
      case 'paid':
        return 'status-badge-success';
      case 'not paid':
        return 'status-badge-pending';
      default:
        return 'status-badge-default';
    }
  };

  const getCashPaymentButton = () => {
    switch (cashPaymentStatus) {
      case 'processing':
        return (
          <button className="btn-cash processing" onClick={handleCashPayment}>
            <Spin /> Xác nhận thanh toán
          </button>
        );
      case 'success':
        return (
          <button className="btn-cash success" disabled>
            ✓ Thanh toán thành công
          </button>
        );
      default:
        return (
          <button className="btn-cash" onClick={handleCashPayment}>
            Thanh toán tiền mặt
          </button>
        );
    }
  };

  if (loading) return <div>Đang tải...</div>;
  if (error) return <div>{error}</div>;
  if (!paymentDetails) return <div>Không tìm thấy thông tin thanh toán</div>;

  return (
    <div className='HomePage-Allcontainer'>
      <div className="HomePage-main-container">
        <div className='container'>
          <div className='row'>
            <div className='col-12 mt-152 BookingPage-titletitle'>
              <div className="BookingPage-heading-protected-together">
                Chi tiết thanh toán
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="payment-card">
          <div className="payment-details">
            <h4>Thông tin thanh toán</h4>
            <div className="info-row">
              <p><strong>Mã thanh toán:</strong> {paymentDetails?.paymentId}</p>
              <p><strong>Mã lịch hẹn:</strong> {appointmentDetails?.id}</p>
              <p><strong>Ngày tiêm:</strong> {appointmentDetails?.dateInjection ? 
                new Date(appointmentDetails.dateInjection).toLocaleDateString('vi-VN') : 
                'Chưa có thông tin'}</p>
              <p><strong>Tổng tiền:</strong> {paymentDetails?.totalPrice?.toLocaleString('vi-VN')} VND</p>
              <p><strong>Phương thức thanh toán:</strong> {
                paymentDetails?.paymentMethod === 'VNPay' ? 'VNPay' :
                paymentDetails?.paymentMethod === 'Cash' ? 'Tiền mặt' :
                'Chưa thanh toán'
              }</p>
              <p><strong>Trạng thái thanh toán:</strong> 
                <span className={`status-badge ${getStatusBadgeClass(paymentDetails?.paymentStatus)}`}>
                  {paymentDetails?.paymentStatus}
                </span>
              </p>
              <p><strong>Trạng thái tiêm chủng:</strong> {appointmentDetails?.status}</p>
            </div>

            <div className="vaccine-details">
              <h5>Chi tiết thanh toán</h5>
              {paymentDetails?.vaccines?.$values?.map((vaccine, index) => (
                <div key={index} className="vaccine-item">
                  <p><strong>Tên vaccine:</strong> {vaccine?.vaccineName}</p>
                  <p><strong>Mũi số:</strong> {vaccine?.doseNumber}</p>
                  <p><strong>Giá/mũi:</strong> {vaccine?.pricePerDose?.toLocaleString('vi-VN')} VND</p>
                  <p><strong>Trạng thái:</strong> {vaccine?.isInjected ? 'Đã tiêm' : 'Chưa tiêm'}</p>
                </div>
              ))}
            </div>
            
            <div className="payment-actions">
              {paymentDetails?.paymentStatus === 'NotPaid' && (
                <button 
                  className="btn-vnpay"
                  onClick={handleVNPayPayment}
                >
                  Thanh toán qua VNPay
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CusPaymentPage;
