import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../../context/AuthContext";
import api from "../../../services/api";
import "bootstrap/dist/css/bootstrap.min.css";
import { Modal, Button } from "react-bootstrap";

function VaccinationScheduleStatus() {
  const { token } = useContext(AuthContext);
  const [singleAppointments, setSingleAppointments] = useState([]);
  const [packageAppointments, setPackageAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("single");
  const [searchTerm, setSearchTerm] = useState("");
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

          const singleAppointments = data.singleVaccineAppointments.$values.map((appt) => ({
            id: appt.id,
            customer: appt.childFullName,
            phone: appt.contactPhoneNumber,
            vaccine: appt.vaccineName,
            date: appt.dateInjection.split("T")[0],
            status: appt.status,
            createdAt: new Date(appt.dateInjection).getTime(),
          }));

          const packageAppointments = data.packageVaccineAppointments.$values.map((pkg) => ({
            id: pkg.vaccinePackageId,
            customer: pkg.childFullName,
            phone: pkg.contactPhoneNumber,
            package: pkg.vaccinePackageName,
            createdAt: new Date(pkg.vaccineItems.$values[0].dateInjection).getTime(),
            injections: pkg.vaccineItems.$values.map((dose) => ({
              vaccine: `Mũi ${dose.doseSequence} - ${dose.vaccineName}`,
              date: dose.dateInjection.split("T")[0],
              status: dose.status,
              id: dose.id,
            })),
          }));

          setSingleAppointments([...singleAppointments].sort((a, b) => b.createdAt - a.createdAt));
          setPackageAppointments([...packageAppointments].sort((a, b) => b.createdAt - a.createdAt));
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
      })
      .catch((error) => console.error("Lỗi khi hủy lịch hẹn:", error));
  };

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

      <input
        type="text"
        className="form-control mb-3"
        placeholder="🔍 Tìm kiếm theo tên..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <ul className="nav nav-tabs">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "single" ? "active" : ""}`} onClick={() => setActiveTab("single")}>
            Mũi Lẻ
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === "package" ? "active" : ""}`} onClick={() => setActiveTab("package")}>
            Trọn Gói
          </button>
        </li>
      </ul>

      <div className="tab-content mt-3">
        {activeTab === "single" && (
          <div>
            {singleAppointments.filter((s) => s.customer.toLowerCase().includes(searchTerm.toLowerCase())).map((schedule) => (
              <div className="card mb-4 shadow" key={schedule.id}>
                <div className="card-body">
                  <h5 className="card-title">{schedule.customer}</h5>
                  <p><strong>Vắc xin:</strong> {schedule.vaccine}</p>
                  <p><strong>Ngày tiêm:</strong> {schedule.date}</p>
                  <p><strong>Trạng thái:</strong> {getStatusBadge(schedule.status)}</p>
                  {schedule.status !== "Canceled" && (
                    <button className="btn btn-danger" onClick={() => { setSelectedInjection(schedule); setShowModal(true); }}>
                      Hủy
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "package" && (
          <div>
            {packageAppointments.map((schedule) => (
              <div className="card mb-4 shadow" key={schedule.id}>
                <div className="card-body">
                  <h5 className="card-title">{schedule.customer}</h5>
                  <p><strong>Gói tiêm:</strong> {schedule.package}</p>
                  <table className="table table-bordered mt-3">
                    <thead className="table-dark">
                      <tr>
                        <th>Mũi tiêm</th>
                        <th>Ngày tiêm</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schedule.injections.map((inj) => (
                        <tr key={inj.id}>
                          <td>{inj.vaccine}</td>
                          <td>{inj.date}</td>
                          <td>{getStatusBadge(inj.status)}</td>
                          <td>
                            {inj.status !== "Canceled" && (
                              <button className="btn btn-danger btn-sm" onClick={() => { setSelectedInjection(inj); setShowModal(true); }}>
                                Hủy
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận hủy lịch</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Bạn có chắc chắn muốn hủy "{selectedInjection?.vaccine}" vào ngày {selectedInjection?.date} không?
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Hủy</Button>
          <Button variant="danger" onClick={() => handleCancel(selectedInjection.id)}>Xác nhận</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default VaccinationScheduleStatus;
