// import React, { useEffect, useState } from 'react';
// import { Link } from 'react-router-dom';
// import api from '../../../services/api';
// import "./VaccineListPage.css"
// import { Input } from 'antd';
// function VaccineListPage() {
//   const [vaccines, setVaccines] = useState([]);
//   const [searchedVaccines, setSearchedVaccines] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const { Search } = Input;
//   const fetchVaccines = async () => {
//     try {
//       const response = await api.get(`/Vaccine/get-all`);
//       const vaccineArray = response.data.$values ? response.data.$values : response.data;
//       console.log("Tất cả vaccine:", vaccineArray);
//       setVaccines(vaccineArray);
//       setSearchedVaccines(vaccineArray);
//       setLoading(false);
//     } catch (err) {
//       console.error("❌ Lỗi khi lấy dữ liệu vaccine:", err);
//       setError("Lỗi khi lấy dữ liệu vaccine.");
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchVaccines();
//   }, []);

//   const handleSearch = (event) => {
//     if (event.key === 'Enter') {
//       const trimmedSearch = searchTerm.trim().toLowerCase();
  
//       if (trimmedSearch === "") {
//         setSearchedVaccines(vaccines);
//       } else {
//         const filtered = vaccines.filter((vaccine) => {
//           let vaccineName = vaccine.name.toLowerCase().replace(/^vắc xin\s*/i, ""); 
//           return vaccineName.includes(trimmedSearch);
//         });
  
//         setSearchedVaccines(filtered);
//       }
//     }
//   };
  

//   if (loading) return <div>Loading...</div>;
//   if (error) return <div>{error}</div>;

//   return (
//     <div className="VaccineListPage">
//       <div className="search-bar" style={{ marginBottom: "20px" }}>
//         <Search placeholder="input search text" value={searchTerm}
//           onChange={(e) => setSearchTerm(e.target.value)}
//           onKeyDown={handleSearch} enterButton="Search" size="large" loading />
//       </div>
//       <div className="row">
//         {searchedVaccines.map((vaccine) => (
//           <div className="col-lg-4 col-md-6 col-12 mb-4" key={vaccine.id}>
//             <div className="HomePage-card card">
//               <div className="HomePage-card-actions">
//                 <Link
//                   to={`/vaccine/${vaccine.id}`}
//                   className="HomePage-card-btn btn"
//                   title="Xem chi tiết"
//                 >
//                   👁️
//                 </Link>
//                 <Link to={`/vaccine/${vaccine.id}`} className="HomePage-card-image">
//                   <img
//                     src={vaccine.imageUrl}
//                     className="card-img-top"
//                     alt={vaccine.name}
//                   />
//                 </Link>
//               </div>
//               <div className="HomePage-card-body card-body">
//                 <h3 className="HomePage-card-title">{vaccine.name}</h3>
//                 <Link to={`/vaccine/${vaccine.id}`} className="btn btn-primary textdetail">
//                   Xem chi tiết
//                 </Link>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// export default VaccineListPage;
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../../services/api';
import { Input, Tabs, Modal } from 'antd';
import "./VaccineListPage.css"

const { Search } = Input;
const { TabPane } = Tabs;

function VaccineListPage() {
  const [vaccines, setVaccines] = useState([]);
  const [searchedVaccines, setSearchedVaccines] = useState([]);
  const [vaccinePackages, setVaccinePackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVaccine, setSelectedVaccine] = useState(null);
  const [selectedPackage, setSelectedPackage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchVaccines();
    fetchVaccinePackages();
  }, []);

  const fetchVaccines = async () => {
    try {
      const response = await api.get(`/Vaccine/get-all`);
      const vaccineArray = response.data.$values ? response.data.$values : response.data;
      setVaccines(vaccineArray);
      setSearchedVaccines(vaccineArray);
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
    } catch (err) {
      console.error("❌ Lỗi khi lấy dữ liệu gói vaccine:", err);
    }
  };

  const handleSearch = (event) => {
    if (event.key === 'Enter') {
      const trimmedSearch = searchTerm.trim().toLowerCase();
      if (trimmedSearch === "") {
        setSearchedVaccines(vaccines);
      } else {
        const filtered = vaccines.filter((vaccine) =>
          vaccine.name.toLowerCase().replace(/^vắc xin\s*/i, "").includes(trimmedSearch)
        );
        setSearchedVaccines(filtered);
      }
    }
  };

  const handleShowVaccineDetails = (vaccine) => {
    setSelectedVaccine(vaccine);
    setSelectedPackage(null); // Reset package khi chọn vaccine lẻ
    setIsModalOpen(true);
  };

  const handleShowPackageDetails = (pkg) => {
    setSelectedPackage(pkg);
    setSelectedVaccine(null); // Reset vaccine khi chọn package
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedVaccine(null);
    setSelectedPackage(null);
    setIsModalOpen(false);
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="VaccineListPage">
      <div className="search-bar" style={{ marginBottom: "20px" }}>
        <Search
          placeholder="Nhập tên vắc xin..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleSearch}
          enterButton="Search"
          size="large"
        />
      </div>

      <Tabs defaultActiveKey="1">
        {/* Tab Vắc xin lẻ */}
        <TabPane tab="Vắc xin lẻ" key="1">
          <div className="row">
            {searchedVaccines.map((vaccine) => (
              <div className="col-lg-4 col-md-6 col-12 mb-4" key={vaccine.id}>
                <div className="HomePage-card card">
                  <div className="HomePage-card-actions">
                    <button 
                      className="HomePage-card-btn btn" 
                      title="Xem chi tiết" 
                      onClick={() => handleShowVaccineDetails(vaccine)}
                    >
                      👁️
                    </button>
                    <div className="HomePage-card-image">
                      <img src={vaccine.imageUrl} className="card-img-top" alt={vaccine.name} />
                    </div>
                  </div>
                  <div className="HomePage-card-body card-body">
                    <h3 className="HomePage-card-title">{vaccine.name}</h3>
                    <button className="btn bnt-homePagecombo" onClick={() => handleShowVaccineDetails(vaccine)}>
                      Xem chi tiết
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabPane>

        {/* Tab Gói vắc xin */}
        <TabPane tab="Gói vắc xin" key="2">
  <div className="row">
    {vaccinePackages.map((pkg) => (
      <div className="col-lg-4 col-md-6 col-12 mb-4" key={pkg.id}>
        <div className="HomePage-card card">
          <div className="HomePage-card-body card-body">
            <h3 className="HomePage-card-title">{pkg.name}</h3>
            <p><strong>Giá:</strong> {pkg.price ? pkg.price.toLocaleString() : "Chưa có giá"} VND</p>
            <p>
              <strong>Số loại vắc xin:</strong>{" "}
              {pkg.vaccinePackageItems?.$values ? pkg.vaccinePackageItems.$values.length : 0}
            </p>
            <button className="btn bnt-homePagecombo" onClick={() => handleShowPackageDetails(pkg)}>
              Xem chi tiết
            </button>
          </div>
        </div>
      </div>
    ))}
  </div>
</TabPane>
      </Tabs>

      {/* Modal hiển thị chi tiết vaccine hoặc package */}
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
            {item.vaccineName} - Mũi {item.doseNumber}
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
  );
}

export default VaccineListPage;
