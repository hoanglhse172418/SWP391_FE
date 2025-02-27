// import React, { useState, useEffect, useContext } from "react";
// import { useNavigate } from "react-router-dom";
// import { AuthContext } from "../../../context/AuthContext";
// import api from "../../../services/api"; 
// import "bootstrap/dist/css/bootstrap.min.css";

// function VaccinationScheduleStatus() {
//   const { token } = useContext(AuthContext);
//   const [schedules, setSchedules] = useState([]);
//   const navigate = useNavigate();

//   useEffect(() => {
//     if (token) {
//       api
//         .get("/Appointment/customer-appointments", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then((response) => {
//           const data = response.data;
  
//           const singleAppointments = data.singleVaccineAppointments.$values.map((appt) => ({
//             id: appt.$id,
//             customer: appt.childFullName,
//             phone: appt.contactPhoneNumber,
//             type: "Mũi lẻ",
//             vaccine: appt.vaccineName,
//             date: appt.dateInjection.split("T")[0],
//             status: appt.status,
//             timestamp: new Date(appt.dateInjection).getTime() // Chuyển ngày tiêm thành timestamp
//           }));
  
//           const packageAppointments = data.packageVaccineAppointments.$values.map((pkg) => ({
//             id: pkg.$id,
//             customer: pkg.childFullName,
//             phone: pkg.contactPhoneNumber,
//             type: "Trọn gói",
//             package: pkg.vaccinePackageName,
//             injections: pkg.followUpAppointments.$values.map((dose) => ({
//               vaccine: `Mũi ${dose.doseNumber} - ${dose.vaccineName}`,
//               date: dose.dateInjection.split("T")[0],
//               status: dose.status,
//               timestamp: new Date(dose.dateInjection).getTime() // Chuyển ngày tiêm thành timestamp
//             })),
//           }));
  
//           // Lấy ngày tiêm gần nhất của từng gói tiêm để sắp xếp
//           packageAppointments.forEach(pkg => {
//             pkg.latestDate = Math.max(...pkg.injections.map(inj => inj.timestamp), 0);
//           });
  
//           // Sắp xếp danh sách lịch tiêm theo ngày giảm dần (mới nhất trước)
//           const sortedSchedules = [...singleAppointments, ...packageAppointments].sort((a, b) => {
//             const dateA = a.timestamp || a.latestDate; // Nếu là gói tiêm thì lấy ngày tiêm gần nhất
//             const dateB = b.timestamp || b.latestDate;
//             return dateB - dateA; // Sắp xếp giảm dần
//           });
  
//           setSchedules(sortedSchedules);
//         })
//         .catch((error) => console.error("Lỗi khi tải lịch tiêm:", error));
//     }
//   }, [token]);
  

//   // Xác định màu sắc cho trạng thái tiêm chủng
//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Confirmed":
//         return <span className="badge bg-success">✅ Hoàn tất</span>;
//       case "Pending":
//         return <span className="badge bg-primary">🔵 Chờ xữ lí</span>;
//         case "Processing":
//           return <span className="badge bg-warning text-dark">🟡 Đang xử lý</span>;
//           case "Canceled":
//       return <span className="badge bg-danger">❌ Đã hủy</span>;
//       default:
//         return <span className="badge bg-secondary">{status}</span>;
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">📅 Lịch Tiêm Vaccine</h2>
//       {schedules.map((schedule, index) => (
//         <div className="card mb-4 shadow" key={index}>
//           <div className="card-body">
//             <h5 className="card-title">{schedule.customer}</h5>
//             <p><strong>SĐT:</strong> {schedule.phone}</p>
//             <p><strong>Loại:</strong> {schedule.type}</p>

//             {schedule.type === "Mũi lẻ" ? (
//               <>
//                 <p><strong>Vắc xin:</strong> {schedule.vaccine}</p>
//                 <p><strong>Ngày tiêm:</strong> {schedule.date}</p>
//                 <p><strong>Trạng thái:</strong> {getStatusBadge(schedule.status)}</p>
//               </>
//             ) : (
//               <>
//                 <p><strong>Gói tiêm:</strong> {schedule.package}</p>
//                 <table className="table table-bordered">
//                   <thead className="table-dark">
//                     <tr>
//                       <th>Mũi tiêm</th>
//                       <th>Ngày tiêm</th>
//                       <th>Trạng thái</th>
//                     </tr>
//                   </thead>
//                   <tbody>
//                     {schedule.injections.map((inj, idx) => (
//                       <tr key={idx}>
//                         <td>{inj.vaccine}</td>
//                         <td>{inj.date}</td>
//                         <td>{getStatusBadge(inj.status)}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </>
//             )}
//             {/* <button
//               className="btn btn-primary mt-3"
//               onClick={() => navigate(`/appointmentdetail/${schedule.id}`)}
//             >
//               Xem chi tiết
//             </button> */}
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }

// export default VaccinationScheduleStatus;


import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";

function VaccinationScheduleStatus() {
  const { token } = useContext(AuthContext);
  const [singleAppointments, setSingleAppointments] = useState([]);
  const [packageAppointments, setPackageAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("single"); // Mặc định chọn tab "Mũi lẻ"

  useEffect(() => {
    if (token) {
      api
        .get("/Appointment/customer-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const data = response.data;

          // Lịch tiêm mũi lẻ
          const singleAppointments = data.singleVaccineAppointments.$values.map((appt) => ({
            id: appt.$id,
            customer: appt.childFullName,
            phone: appt.contactPhoneNumber,
            type: "Mũi lẻ",
            vaccine: appt.vaccineName,
            date: appt.dateInjection.split("T")[0],
            status: appt.status,
            timestamp: new Date(appt.dateInjection).getTime(), // Chuyển ngày tiêm thành timestamp
          }));

          // Lịch tiêm trọn gói
          const packageAppointments = data.packageVaccineAppointments.$values.map((pkg) => ({
            id: pkg.$id,
            customer: pkg.childFullName,
            phone: pkg.contactPhoneNumber,
            type: "Trọn gói",
            package: pkg.vaccinePackageName,
            injections: pkg.followUpAppointments.$values.map((dose) => ({
              vaccine: `Mũi ${dose.doseNumber} - ${dose.vaccineName}`,
              date: dose.dateInjection.split("T")[0],
              status: dose.status,
              timestamp: new Date(dose.dateInjection).getTime(),
            })),
          }));

          // Sắp xếp cả hai danh sách theo ngày giảm dần
          setSingleAppointments([...singleAppointments].sort((a, b) => b.timestamp - a.timestamp));
          setPackageAppointments([...packageAppointments].sort((a, b) => {
            const latestDateA = Math.max(...a.injections.map(inj => inj.timestamp), 0);
            const latestDateB = Math.max(...b.injections.map(inj => inj.timestamp), 0);
            return latestDateB - latestDateA;
          }));
        })
        .catch((error) => console.error("Lỗi khi tải lịch tiêm:", error));
    }
  }, [token]);

  // Xác định màu sắc cho trạng thái tiêm chủng
  const getStatusBadge = (status) => {
    switch (status) {
      case "Confirmed":
        return <span className="badge bg-success">✅ Hoàn tất</span>;
      case "Pending":
        return <span className="badge bg-primary">🔵 Chờ xử lý</span>;
      case "Processing":
        return <span className="badge bg-warning text-dark">🟡 Đang xử lý</span>;
      case "Canceled":
        return <span className="badge bg-danger">❌ Đã hủy</span>;
      default:
        return <span className="badge bg-secondary">{status}</span>;
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📅 Lịch Tiêm Vaccine</h2>

      {/* Tabs */}
      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "single" ? "active" : ""}`}
            onClick={() => setActiveTab("single")}
          >
            Mũi Lẻ
          </button>
        </li>
        <li className="nav-item">
          <button
            className={`nav-link ${activeTab === "package" ? "active" : ""}`}
            onClick={() => setActiveTab("package")}
          >
            Trọn Gói
          </button>
        </li>
      </ul>

      {/* Nội dung từng tab */}
      <div className="tab-content mt-3">
        {/* Danh sách Mũi lẻ */}
        {activeTab === "single" && (
          <div>
            {singleAppointments.length > 0 ? (
              singleAppointments.map((schedule, index) => (
                <div className="card mb-4 shadow" key={index}>
                  <div className="card-body">
                    <h5 className="card-title">{schedule.customer}</h5>
                    <p><strong>SĐT:</strong> {schedule.phone}</p>
                    <p><strong>Vắc xin:</strong> {schedule.vaccine}</p>
                    <p><strong>Ngày tiêm:</strong> {schedule.date}</p>
                    <p><strong>Trạng thái:</strong> {getStatusBadge(schedule.status)}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Không có lịch tiêm mũi lẻ nào.</p>
            )}
          </div>
        )}

        {/* Danh sách Trọn gói */}
        {activeTab === "package" && (
          <div>
            {packageAppointments.length > 0 ? (
              packageAppointments.map((schedule, index) => (
                <div className="card mb-4 shadow" key={index}>
                  <div className="card-body">
                    <h5 className="card-title">{schedule.customer}</h5>
                    <p><strong>SĐT:</strong> {schedule.phone}</p>
                    <p><strong>Gói tiêm:</strong> {schedule.package}</p>
                    <table className="table table-bordered">
                      <thead className="table-dark">
                        <tr>
                          <th>Mũi tiêm</th>
                          <th>Ngày tiêm</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {schedule.injections.map((inj, idx) => (
                          <tr key={idx}>
                            <td>{inj.vaccine}</td>
                            <td>{inj.date}</td>
                            <td>{getStatusBadge(inj.status)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center">Không có lịch tiêm trọn gói nào.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default VaccinationScheduleStatus;
