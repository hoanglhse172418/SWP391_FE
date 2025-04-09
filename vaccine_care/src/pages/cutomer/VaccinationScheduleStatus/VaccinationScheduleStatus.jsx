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
            injections: pkg.vaccineItems.$values
            .sort((a, b) => new Date(a.dateInjection) - new Date(b.dateInjection))
            .map((dose) => ({
              id: dose.id,
              vaccine: `${dose.vaccineName}`,
              date: formatDate(dose.dateInjection),
              status: dose.status,
              dateInjection: new Date(dose.dateInjection).getTime(),
              injectionNote: dose.injectionNote,
            }))
          ,
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

