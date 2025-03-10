import React, { useState, useEffect, useContext } from 'react'
import "./BillPage.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import api from '../../../services/api';
import { Pagination, Select } from 'antd';
import tiemle from '../../../assets/HomePage/tiemle.png'
import tiemtheogoi from '../../../assets/HomePage/tiemtheogoi.png'
import tuvanmuitiem from '../../../assets/HomePage/tuvanmuitiem.png'

function BillPage() {
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);
  const [invoices, setInvoices] = useState([]);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('date'); // 'date' hoặc 'status'
  const pageSize = 3;

  useEffect(() => {
    if (token) {
      api.get("/Appointment/customer-appointments", {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        const data = response.data;
        
        const singleAppointments = data.singleVaccineAppointments.$values
          .filter(appt => appt.status?.toLowerCase() === 'processing')
          .map(appt => ({
            id: appt.id,
            paymentId: appt.paymentId,
            customer: appt.childFullName,
            description: `Tiêm vaccine ${appt.vaccineName}`,
            date: new Date(appt.dateInjection),
            status: appt.status,
            createdAt: new Date(appt.appointmentCreatedDate)
          }));

        const packageAppointments = data.packageVaccineAppointments.$values
          .filter(pkg => pkg.status?.toLowerCase() === 'processing')
          .map(pkg => ({
            id: pkg.id,
            paymentId: pkg.paymentId,
            customer: pkg.childFullName,
            description: `Gói vaccine: ${pkg.vaccinePackageName}`,
            date: new Date(pkg.dateInjection),
            status: pkg.status,
            createdAt: new Date(pkg.appointmentCreatedDate)
          }));

        let allInvoices = [...singleAppointments, ...packageAppointments];
        allInvoices.sort((a, b) => b.createdAt - a.createdAt);
        setInvoices(allInvoices);
      })
      .catch(error => {
        console.error("Error fetching appointments:", error);
      });
    }
  }, [token]);

  const sortInvoices = (invoicesToSort, sortType) => {
    let sortedInvoices = [...invoicesToSort];
    
    if (sortType === 'date') {
      sortedInvoices.sort((a, b) => b.date - a.date);
    } else if (sortType === 'status') {
      sortedInvoices.sort((a, b) => {
        if (a.status.toLowerCase() === 'processing' && b.status.toLowerCase() !== 'processing') return -1;
        if (a.status.toLowerCase() !== 'processing' && b.status.toLowerCase() === 'processing') return 1;
        return b.date - a.date;
      });
    }
    
    setInvoices(sortedInvoices);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    sortInvoices(invoices, value);
  };

  const handlePayment = async () => {
    if (selectedInvoice) {
      try {
        const response = await api.get(`/Payment/detail/${selectedInvoice.paymentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data) {
          navigate(`/billpayment/${selectedInvoice.paymentId}`);
        }
      } catch (error) {
        console.error("Error fetching payment details:", error);
        alert("Không thể tải thông tin thanh toán. Vui lòng thử lại sau!");
      }
    } else {
      alert("Vui lòng chọn một hóa đơn để thanh toán!");
    }
  };

  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return invoices.slice(startIndex, endIndex);
  };

  // Hàm để lấy màu sắc dựa trên trạng thái
  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed':
      case 'hoàn thành':
        return 'text-success';
      case 'cancelled':
      case 'đã hủy':
        return 'text-danger';
      case 'pending':
      case 'chờ xác nhận':
        return 'text-warning';
      default:
        return 'text-primary';
    }
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
              <Select
                defaultValue="date"
                style={{ width: 200 }}
                onChange={handleSortChange}
                options={[
                  { value: 'date', label: 'Sắp xếp theo ngày' },
                  { value: 'status', label: 'Sắp xếp theo trạng thái' }
                ]}
              />
            </div>
            
            <ul className="list-group">
              {getCurrentPageData().map((invoice) => (
                <li 
                  key={invoice.id} 
                  className={`list-group-item ${selectedInvoice?.id === invoice.id ? "active" : ""}`}
                  onClick={() => setSelectedInvoice(invoice)}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <div className="fw-bold">{invoice.customer}</div>
                      <small>{invoice.description}</small>
                    </div>
                    <div className="text-end">
                      <div>{invoice.date.toLocaleDateString('vi-VN')}</div>
                      <div className={`status-badge ${getStatusColor(invoice.status)}`}>
                        {invoice.status}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            
            <div className="pagination-container">
              <Pagination
                current={currentPage}
                total={invoices.length}
                pageSize={pageSize}
                onChange={setCurrentPage}
                className="mt-3"
              />
              
              <button 
                className={`btn-payment ms-auto ${!selectedInvoice ? 'disabled' : ''}`}
                onClick={handlePayment}
                disabled={!selectedInvoice}
              >
                Thanh toán
              </button>
            </div>
          </div>
        </div>

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
