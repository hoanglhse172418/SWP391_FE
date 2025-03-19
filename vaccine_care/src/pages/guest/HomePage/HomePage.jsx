import React, { useEffect, useState } from 'react'
import "./HomePage.css"
import 'bootstrap/dist/css/bootstrap.min.css';
import Phone from '../../../assets/HomePage/phoneHome.png'
import tiemle from '../../../assets/HomePage/tiemle.png'
import tiemtheogoi from '../../../assets/HomePage/tiemtheogoi.png'
import tuvanmuitiem from '../../../assets/HomePage/tuvanmuitiem.png'
import { Link } from 'react-router-dom';
import { vaccineData } from '../../../components/data/vaccineData';
import api from '../../../services/api';
import { Modal } from 'antd';
function HomePage() {
   // 🔹 Khai báo state trước khi có bất kỳ logic nào khác
   const [vaccines, setVaccines] = useState([]);
   const [vaccinePackages, setVaccinePackages] = useState([]);
   const [selectedPackage, setSelectedPackage] = useState(null);
   const [isModalOpen, setIsModalOpen] = useState(false);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState(null);
 
   useEffect(() => {
     fetchVaccines();
     fetchVaccinePackages();
   }, []);
 
   const fetchVaccines = async () => {
     try {
       const response = await api.get(`/Vaccine/get-all`);
       const vaccineArray = response.data.$values ? response.data.$values : response.data;
       setVaccines(vaccineArray);
       setLoading(false);
     } catch (err) {
       console.error("❌ Lỗi khi lấy dữ liệu vaccine:", err);
       setError("Lỗi khi lấy dữ liệu vaccine.");
       setLoading(false);
     }
   };
 
   const fetchVaccinePackages = async () => {
     try {
       const response = await api.get(`/VaccinePackage/get-all`);
       const packageArray = response.data.$values ? response.data.$values : response.data;
       setVaccinePackages(packageArray);
       setLoading(false);
     } catch (err) {
       console.error("❌ Lỗi khi lấy dữ liệu gói vaccine:", err);
       setError("Lỗi khi lấy dữ liệu gói vaccine.");
       setLoading(false);
     }
   };
 
   const handleShowPackageDetails = (pkg) => {
     setSelectedPackage(pkg);
     setIsModalOpen(true);
   };
 
   const handleCloseModal = () => {
     setSelectedPackage(null);
     setIsModalOpen(false);
   };
 
   // 🔹 Kiểm tra loading/error ngay tại đây
   if (loading) return <div className="loader"></div>;
   if (error) return <div>{error}</div>;
  return (
    <div className='HomePage-Allcontainer'>
      {/* header */}

      {/* Body-homepage */}

      <div className="HomePage-main-container">
             <div className="flex-column-eb">
        <div className="background-1">
          <div className="svg">
            <div className="svg-fill">
              <div className="svg-1" />
            </div>
          </div>
        </div>
        <div className="background-2">
          <div className="stethoscope">
            <div className="stethoscope-fill">
              <div className="stethoscope-3" />
            </div>
          </div>
        </div>
        <div className="background-4">
          <div className="svg-5">
            <div className="svg-fill-6">
              <div className="svg-7" />
            </div>
          </div>
        </div>
             </div>

             <div className='container'>
              <div className='row'>
                <div className='col-12 mt-152'>
                <div className="HomPage-heading-protected-together">
          Chăm sóc bé, từng mũi <br/> tiêm trọn vẹn!
        </div>
        <div className="welcome-software-management">
          "Chào mừng bạn đến với [Tên phần mềm]! Đây là nơi giúp bạn quản lý
          lịch tiêm chủng của bé một cách dễ dàng và hiệu quả. Hãy đồng hành
          cùng chúng tôi để bảo vệ sức khỏe toàn diện cho bé yêu qua từng mũi
          tiêm. "
        </div>
        <div className="hotline-24-7">Đường dây nóng: 24/7</div>

        <div className='HomePage-Hotline'>
        <button className="HomPage-Hotlinelink">
          <img src={Phone} className="HomePage-iconPhone" />
        <span className="phone-number"> 0374277590</span>
        </button>
<Link to='/booking'>
        <button  className="HomPage-datlich">
          <span className="lien-he">Đặt Lịch</span>
        </button>
        </Link>
        </div>

                </div>
              </div>

             </div>

    </div>

       {/* Danh mục vaccine */}
<div className="HomePage-Danhmuc container">
      <div className="HomePage-tilte row">
        <div className="col-6">
          <h2 className="HomePage-dm">Danh mục Vaccine</h2>
        </div>
        <div className="col-6 text-end">
          <Link to="/vaccine-list" className="HomePage-dm">Xem tất cả</Link>
        </div>
      </div>
       <div className="row">
      {vaccines.slice(0, 6).map((vaccine) => (
        <div className="col-lg-4 col-md-6 col-12 mb-4" key={vaccine.id}>
          <div className="HomePage-card card">
            <div className="HomePage-card-actions">
              <Link
                to={`/vaccine/${vaccine.id}`}
                className="HomePage-card-btn btn"
                title="Xem chi tiết"
              >
                👁️
              </Link>
              <Link to={`/vaccine/${vaccine.id}`} className="HomePage-card-image">
                <img
                  src={vaccine.imageUrl}
                  className="card-img-top"
                  alt={vaccine.name}
                />
              </Link>
            </div>
            <div className="HomePage-card-body card-body">
              <h3 className="HomePage-card-title">{vaccine.name}</h3>
              <Link to={`/vaccine/${vaccine.id}`} className="btn btn-primary textdetail">
                Xem chi tiết
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>

    </div>

        {/* Video chăm sóc */}
           <div className='HomePage-videocontainer'>
<div className='container'>
      <div className='row'>
        <div className='col-12'>
        <iframe
  className="HomePage_video"
  src="https://www.youtube.com/embed/F3EDggy99v0?si=0jomCH3bM-cTFR-c"
  frameBorder="0"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
/>
        </div>
      </div>

    </div>
          </div>


          <div className="HomePage-combovaccine">
  <h2 className='HomePage-combovaccine_title'>Danh sách Gói Vắc Xin</h2>
  <div className="row">
    {vaccinePackages.slice(0, 3).map((pkg) => (
      <div className="col-lg-4 col-md-6 col-12 mb-4" key={pkg.id}>
        <div className="HomePage-card card">
          <div className="HomePage-card-body card-body">
            <h3 className="HomePage-card-title">{pkg.name}</h3>
            <p><strong>Giá:</strong> {pkg.price ? pkg.price.toLocaleString() : "Chưa có giá"} VND</p>
            <p><strong>Số loại vắc xin:</strong> {pkg.vaccinePackageItems?.$values?.length ?? 0}</p>
            <button className="btn bnt-homePagecombo" onClick={() => handleShowPackageDetails(pkg)}>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>

  {/* Modal chi tiết gói vắc xin */}
  <Modal
  title={selectedPackage?.name}
  open={isModalOpen}
  onCancel={handleCloseModal}
  footer={null}
>
  {selectedPackage && (
    <div>
      <p><strong>Gói:</strong> {selectedPackage.name}</p>
      <p><strong>Giá:</strong> {selectedPackage.price ? selectedPackage.price.toLocaleString() : "Chưa có giá"} VND</p>
      <h4>Danh sách vắc xin:</h4>
      <ul>
        {selectedPackage.vaccinePackageItems?.$values?.map((item, index) => (
          <li key={index}>
            {item.vaccineName} - 1 Mũi 
          </li>
        )) ?? <p>Không có dữ liệu vắc xin</p>}
      </ul>

      {/* Lưu ý nổi bật */}
      <div style={{
        backgroundColor: "#fff8c4",
        padding: "10px",
        marginTop: "15px",
        border: "2px solid #f1c40f",
        borderRadius: "5px",
        fontWeight: "bold",
        color: "#d35400"
      }}>
        Lưu ý: Tổng Giá trị Gói vắc xin = Tổng giá trị các mũi tiêm lẻ + Khoảng 10% phí đặt giữ theo yêu cầu*
      </div>
    </div>
  )}
</Modal>

</div>


        {/* Danh mục dịch vụ */}
        <div className='HomePage-DichVu container'>
        <div className='HomePage-tilte row '>
        <div className="col-6">
        <h2 className='HomePage-dm'>Danh mục dịch vụ</h2>
            </div>
            </div>
          <div className='container'>
            <div className='row'>
              <div className='col-12'>
                <div className='HomePage-Danhmuc-Background'>
                  <div className='HomePage-Danhmuc-content'>
                    <img src={tiemtheogoi} className='HomePage-Danhmuc-img'></img>
                    <div className='HomePage-Danhmuc-title'>Tiêm theo gói</div>
                  </div>
                  <div className='HomePage-Danhmuc-content'>
                    <img src={tiemle} className='HomePage-Danhmuc-img'></img>
                    <div className='HomePage-Danhmuc-title'>Tiêm lẻ</div>
                  </div>
                  <div className='HomePage-Danhmuc-content'>
                    <img src={tuvanmuitiem} className='HomePage-Danhmuc-img'></img>
                    <div className='HomePage-Danhmuc-title'>Tư vấn mũi tiêm</div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
{/* <FooterGuest/> */}
    </div>
  )
}

export default HomePage
