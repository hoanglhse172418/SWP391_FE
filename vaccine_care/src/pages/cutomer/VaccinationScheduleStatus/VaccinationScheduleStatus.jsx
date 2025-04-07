// import React, { useState, useEffect, useContext } from "react";
// import { AuthContext } from "../../../context/AuthContext";
// import api from "../../../services/api";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { Modal, Button } from "react-bootstrap";
// import "./VaccinationScheduleStatus.css"

// function VaccinationScheduleStatus() {
//   const { token } = useContext(AuthContext);
//   const [singleAppointments, setSingleAppointments] = useState([]);
//   const [packageAppointments, setPackageAppointments] = useState([]);
//   const [activeTab, setActiveTab] = useState("single");
//   const [searchTerm, setSearchTerm] = useState("");
//   const [showModal, setShowModal] = useState(false);
//   const [selectedInjection, setSelectedInjection] = useState(null);

//   useEffect(() => {
//     if (token) {
//       api
//         .get("/Appointment/customer-appointments", {
//           headers: { Authorization: `Bearer ${token}` },
//         })
//         .then((response) => {
//           const data = response.data; // Bổ sung response.data
  
//           const formatDate = (dateString) => {
//             return new Date(dateString).toLocaleDateString("vi-VN", {
//               day: "2-digit",
//               month: "2-digit",
//               year: "numeric",
//             });
//           };
  
//           const singleAppointments = data.singleVaccineAppointments.$values.map((appt) => ({
//             id: appt.id,
//             customer: appt.childFullName,
//             phone: appt.contactPhoneNumber,
//             vaccine: appt.vaccineName,
//             date: formatDate(appt.dateInjection),
//             status: appt.status,
//             dateInjection: new Date(appt.dateInjection).getTime(),
//             injectionNote: appt.injectionNote,
//           }));
  
//           const packageAppointments = data.packageVaccineAppointments.$values.map((pkg) => ({
//             id: pkg.vaccinePackageId,
//             customer: pkg.childFullName,
//             phone: pkg.contactPhoneNumber,
//             package: pkg.vaccinePackageName,
//             dateInjection: new Date(pkg.vaccineItems.$values[0].dateInjection).getTime(),
//             injections: pkg.vaccineItems.$values.map((dose) => ({
//               vaccine: `Mũi ${dose.doseSequence} - ${dose.vaccineName}`,
//               date: formatDate(dose.dateInjection),
//               status: dose.status,
//               id: dose.id,
//               dateInjection: new Date(dose.dateInjection).getTime(),
//               injectionNote: dose.injectionNote,
//             })),
//           }));
  
//           // Gọi setState bên ngoài .map()
//           setSingleAppointments([...singleAppointments].sort((a, b) => a.dateInjection - b.dateInjection));
//           setPackageAppointments([...packageAppointments].sort((a, b) => a.dateInjection - b.dateInjection));
//         })
//         .catch((error) => console.error("Lỗi khi tải lịch tiêm:", error));
//     }
//   }, [token]);
  

//   const handleCancel = (id) => {
//     api
//       .put(`/Appointment/cancel-appointment/${id}`, {}, {
//         headers: { Authorization: `Bearer ${token}` },
//       })
//       .then(() => {
//         setSingleAppointments((prev) =>
//           prev.map((appt) => (appt.id === id ? { ...appt, status: "Canceled" } : appt))
//         );

//         setPackageAppointments((prev) =>
//           prev.map((pkg) => ({
//             ...pkg,
//             injections: pkg.injections.map((inj) =>
//               inj.id === id ? { ...inj, status: "Canceled" } : inj
//             ),
//           }))
//         );

//         setShowModal(false);
//       })
//       .catch((error) => console.error("Lỗi khi hủy lịch hẹn:", error));
//   };

//   const getStatusBadge = (status) => {
//     switch (status) {
//       case "Completed":
//         return <span className="badge bg-success">✅ Hoàn tất</span>;
//       case "Pending":
//         return <span className="badge bg-primary">🔵 Chờ xử lý</span>;
//       case "Processing":
//         return <span className="badge bg-warning text-dark">🟡 Đang xử lý</span>;
//       case "Canceled":
//         return <span className="badge bg-danger">❌ Đã hủy</span>;
//       default:
//         return <span className="badge bg-secondary">{status}</span>;
//     }
//   };

//   return (
//     <div className="container mt-5">
//       <h2 className="text-center mb-4">📅 Lịch Tiêm Vaccine</h2>

//       <input
//         type="text"
//         className="form-control mb-3"
//         placeholder="🔍 Tìm kiếm theo tên..."
//         value={searchTerm}
//         onChange={(e) => setSearchTerm(e.target.value)}
//       />

//       <ul className="nav nav-tabs">
//         <li className="nav-item">
//           <button className={`nav-link ${activeTab === "single" ? "active" : ""}`} onClick={() => setActiveTab("single")}>
//             Mũi Lẻ
//           </button>
//         </li>
//         <li className="nav-item">
//           <button className={`nav-link ${activeTab === "package" ? "active" : ""}`} onClick={() => setActiveTab("package")}>
//             Trọn Gói
//           </button>
//         </li>
//       </ul>

//       <div className="tab-content mt-3">
//         {activeTab === "single" && (
//           <div>
//             {singleAppointments
//               .filter((s) => s.customer.toLowerCase().includes(searchTerm.toLowerCase()))
//               .map((schedule) => (
// <div className="card mb-4 shadow position-relative" key={schedule.id}>
//   <div className="card-body">
//     <button 
//       className="btn btn-danger cancel-btn" 
//       onClick={() => { setSelectedInjection(schedule); setShowModal(true); }}
//       style={{ display: schedule.status === "Canceled" || schedule.status === "Completed" ? "none" : "block" }}
//     >
//       Hủy
//     </button>
//     <h5 className="card-title">{schedule.customer}</h5>
//     <p><strong>Vắc xin:</strong> {schedule.vaccine}</p>
//     <p><strong>Ngày tiêm:</strong> {schedule.date}</p>
//     <p><strong>Trạng thái:</strong> {getStatusBadge(schedule.status)}</p>
//     <p><strong>Phản ứng sau khi tiêm:</strong> {schedule.injectionNote || "Không có"}</p>

//   </div>
// </div>

//               ))}
//           </div>
//         )}

//         {/* {activeTab === "package" && (
//           <div>
//             {packageAppointments.map((schedule) => (
//               <div className="card mb-4 shadow" key={schedule.id}>
//                 <div className="card-body">
//                   <h5 className="card-title">{schedule.customer}</h5>
//                   <p><strong>Gói tiêm:</strong> {schedule.package}</p>
//                   <table className="table table-bordered mt-3">
//                     <thead className="table-dark">
//                       <tr>
//                         <th>Mũi tiêm</th>
//                         <th>Ngày tiêm</th>
//                         <th>Trạng thái</th>
//                         <th>Hành động</th>
//                       </tr>
//                     </thead>
//                     <tbody>
//                       {schedule.injections.map((inj) => (
//                         <tr key={inj.id}>
//                           <td>{inj.vaccine}</td>
//                           <td>{inj.date}</td>
//                           <td>{getStatusBadge(inj.status)}</td>
//                           <td>
//                             {inj.status !== "Canceled" && inj.status !== "Completed" && (
//                               <button className="btn btn-danger btn-sm" onClick={() => { setSelectedInjection(inj); setShowModal(true); }}>
//                                 Hủy
//                               </button>
//                             )}
//                           </td>
//                           <td colSpan="4" className="text-muted">
//     📝 <strong>Ghi chú:</strong> {inj.injectionNote || "Không có"}
//   </td>
//                         </tr>
                        
//                       ))}
//                     </tbody>
//                   </table>
//                 </div>
//               </div>
//             ))}
//           </div>
//         )} */}
// {activeTab === "package" && (
//   <div>
//     {packageAppointments.map((schedule) => (
//       <div className="card mb-4 shadow" key={schedule.id}>
//         <div className="card-body">
//           <h5 className="card-title">{schedule.customer}</h5>
//           <p><strong>Gói tiêm:</strong> {schedule.package}</p>
//           <table className="table table-bordered mt-3">
//             <thead className="table-dark">
//               <tr>
//                 <th>Mũi tiêm</th>
//                 <th>Ngày tiêm</th>
//                 <th>Trạng thái</th>
//                 <th>Phản ứng sau khi tiêm</th> {/* 👈 Cột mới */}
//                 <th>Hành động</th>
//               </tr>
//             </thead>
//             <tbody>
//               {schedule.injections.map((inj) => (
//                 <tr key={inj.id}>
//                   <td>{inj.vaccine}</td>
//                   <td>{inj.date}</td>
//                   <td>{getStatusBadge(inj.status)}</td>
//                   <td className="text-muted">{inj.injectionNote || "Không có"}</td> {/* 👈 Hiển thị ghi chú ở đây */}
//                   <td>
//                     {inj.status !== "Canceled" && inj.status !== "Completed" && (
//                       <button
//                         className="btn btn-danger btn-sm"
//                         onClick={() => {
//                           setSelectedInjection(inj);
//                           setShowModal(true);
//                         }}
//                       >
//                         Hủy
//                       </button>
//                     )}
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     ))}
//   </div>
// )}




//       </div>
      
//      <Modal show={showModal} onHide={() => setShowModal(false)}>
//       <Modal.Header closeButton>
//            <Modal.Title>Xác nhận hủy lịch</Modal.Title>
//          </Modal.Header>
//         <Modal.Body>
//          Bạn có chắc chắn muốn hủy "{selectedInjection?.vaccine}" vào ngày {selectedInjection?.date} không?
//          </Modal.Body>
//         <Modal.Footer>
//            <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
//          <Button variant="danger" onClick={() => handleCancel(selectedInjection.id)}>Xác nhận</Button>
//          </Modal.Footer>
//        </Modal>
//     </div>
//   );
// }

// export default VaccinationScheduleStatus;
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";
import {
  Select,
  Tabs,
  Table,
  Card,
  Badge,
  Modal,
  Button as AntdButton,
  message,
} from "antd";
import "antd/dist/reset.css";

const { TabPane } = Tabs;

function VaccinationScheduleStatus() {
  const { token } = useContext(AuthContext);
  const [singleAppointments, setSingleAppointments] = useState([]);
  const [packageAppointments, setPackageAppointments] = useState([]);
  const [children, setChildren] = useState([]);
  const [selectedChild, setSelectedChild] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedInjection, setSelectedInjection] = useState(null);

  useEffect(() => {
    if (token) {
      api
        .get("/Appointment/customer-appointments", {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((response) => {
          const data = response.data;

          const formatDate = (dateString) =>
            new Date(dateString).toLocaleDateString("vi-VN", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            });

          const single = data.singleVaccineAppointments.$values.map((appt) => ({
            id: appt.id,
            customer: appt.childFullName,
            phone: appt.contactPhoneNumber,
            vaccine: appt.vaccineName,
            date: formatDate(appt.dateInjection),
            status: appt.status,
            dateInjection: new Date(appt.dateInjection).getTime(),
            injectionNote: appt.injectionNote,
          }));

          const pkg = data.packageVaccineAppointments.$values.map((pkg) => ({
            id: pkg.vaccinePackageId,
            customer: pkg.childFullName,
            phone: pkg.contactPhoneNumber,
            package: pkg.vaccinePackageName,
            dateInjection: new Date(pkg.vaccineItems.$values[0].dateInjection).getTime(),
            injections: pkg.vaccineItems.$values.map((dose) => ({
              id: dose.id,
              vaccine: `Mũi ${dose.doseSequence} - ${dose.vaccineName}`,
              date: formatDate(dose.dateInjection),
              status: dose.status,
              dateInjection: new Date(dose.dateInjection).getTime(),
              injectionNote: dose.injectionNote,
            })),
          }));

          setSingleAppointments(single.sort((a, b) => a.dateInjection - b.dateInjection));
          setPackageAppointments(pkg.sort((a, b) => a.dateInjection - b.dateInjection));

          const allChildren = [...new Set([
            ...single.map(a => a.customer),
            ...pkg.map(p => p.customer)
          ])];
          setChildren(allChildren);
          setSelectedChild(allChildren[0] || "");
        })
        .catch((error) => console.error("Lỗi khi tải lịch tiêm:", error));
    }
  }, [token]);

  const handleCancel = (id) => {
    api
      .put(`/Appointment/cancel-appointment/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setSingleAppointments((prev) =>
          prev.map((appt) => (appt.id === id ? { ...appt, status: "Canceled" } : appt))
        );
        setPackageAppointments((prev) =>
          prev.map((pkg) => ({
            ...pkg,
            injections: pkg.injections.map((inj) =>
              inj.id === id ? { ...inj, status: "Canceled" } : inj
            ),
          }))
        );
        setShowModal(false);
        message.success("Đã hủy lịch thành công!");
      })
      .catch((error) => {
        console.error("Lỗi khi hủy lịch hẹn:", error);
        message.error("Hủy lịch thất bại!");
      });
  };

  const handleCancelPackage = (injections) => {
    const cancelable = injections.filter(inj => inj.status !== "Canceled" && inj.status !== "Completed");

    Promise.all(
      cancelable.map(inj =>
        api.put(`/Appointment/cancel-appointment/${inj.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` },
        })
      )
    ).then(() => {
      message.success("Đã hủy toàn bộ lịch trong gói!");
      setPackageAppointments(prev =>
        prev.map(pkg => ({
          ...pkg,
          injections: pkg.injections.map(inj =>
            cancelable.some(i => i.id === inj.id)
              ? { ...inj, status: "Canceled" }
              : inj
          )
        }))
      );
    }).catch((err) => {
      console.error("Lỗi khi hủy toàn bộ:", err);
      message.error("Có lỗi khi hủy gói!");
    });
  };

  const canCancelPackage = (injections) =>
    injections.every(inj => inj.status !== "Completed") &&
    injections.some(inj => inj.status !== "Canceled");

  const getStatusBadge = (status) => {
    const map = {
      Completed: { status: "success", text: "✅ Hoàn tất" },
      Pending: { status: "processing", text: "🔵 Chờ xử lý" },
      Processing: { status: "warning", text: "🟡 Đang xử lý" },
      Canceled: { status: "error", text: "❌ Đã hủy" },
    };
    return <Badge status={map[status]?.status || "default"} text={map[status]?.text || status} />;
  };

  const filteredSingle = singleAppointments.filter((s) => s.customer === selectedChild);
  const filteredPackage = packageAppointments.filter((p) => p.customer === selectedChild);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">📅 Lịch Tiêm Vaccine</h2>

      <Select
        style={{ width: 300, marginBottom: 20 }}
        placeholder="Chọn bé"
        value={selectedChild}
        onChange={(value) => setSelectedChild(value)}
        options={children.map((c) => ({ label: c, value: c }))}
      />

      <Tabs defaultActiveKey="single">
        <TabPane tab="💉 Mũi lẻ" key="single">
          {filteredSingle.map((appt) => (
            <Card key={appt.id} title={appt.customer} className="mb-3">
              <p><strong>Vắc xin:</strong> {appt.vaccine}</p>
              <p><strong>Ngày tiêm:</strong> {appt.date}</p>
              <p><strong>Trạng thái:</strong> {getStatusBadge(appt.status)}</p>
              <p><strong>Phản ứng:</strong> {appt.injectionNote || "Không có"}</p>
              {["Canceled", "Completed"].includes(appt.status) ? null : (
                <AntdButton danger onClick={() => { setSelectedInjection(appt); setShowModal(true); }}>
                  Hủy
                </AntdButton>
              )}
            </Card>
          ))}
        </TabPane>

        <TabPane tab="📦 Trọn gói" key="package">
          {filteredPackage.map((pkg) => (
            <Card key={pkg.id} title={`${pkg.customer} - ${pkg.package}`} className="mb-4">
              {canCancelPackage(pkg.injections) && (
                <AntdButton danger type="primary" className="mb-2" onClick={() => handleCancelPackage(pkg.injections)}>
                  Hủy toàn bộ gói
                </AntdButton>
              )}

              <Table
                dataSource={pkg.injections}
                rowKey="id"
                pagination={false}
                columns={[
                  { title: "Mũi tiêm", dataIndex: "vaccine" },
                  { title: "Ngày tiêm", dataIndex: "date" },
                  {
                    title: "Trạng thái",
                    dataIndex: "status",
                    render: (status) => getStatusBadge(status),
                  },
                  {
                    title: "Phản ứng",
                    dataIndex: "injectionNote",
                    render: (note) => note || "Không có",
                  },
                  {
                    title: "Hành động",
                    render: (_, record) =>
                      !["Canceled", "Completed"].includes(record.status) && (
                        <AntdButton danger size="small" onClick={() => {
                          setSelectedInjection(record);
                          setShowModal(true);
                        }}>
                          Hủy
                        </AntdButton>
                      )
                  }
                ]}
              />
            </Card>
          ))}
        </TabPane>
      </Tabs>

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        onOk={() => handleCancel(selectedInjection.id)}
        okText="Xác nhận"
        cancelText="Đóng"
      >
        Bạn có chắc chắn muốn hủy mũi tiêm: <strong>{selectedInjection?.vaccine}</strong> vào ngày <strong>{selectedInjection?.date}</strong>?
      </Modal>
    </div>
  );
}

export default VaccinationScheduleStatus;

