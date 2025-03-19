import React, { useContext, useEffect, useState } from "react";
import Inject from "../inject/Inject";
import { Table } from "antd";
import { motion } from "framer-motion";
import "./Inject_infor.css";
import Completed from "../../staff/completed/Completed";
import { AuthContext } from "../../../context/AuthContext";
import jwtDecode from "jwt-decode";
import api from "../../../services/api";

const Inject_infor = () => {
  const { token } = useContext(AuthContext);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [childrenMap, setChildrenMap] = useState({});
  const [vaccineMap, setVaccineMap] = useState({});
  const [vaccinePackageMap, setVaccinePackageMap] = useState({});
  const steps = [
    { name: "Tiêm", component: Inject },
    { name: "Hoàn Thành", component: Completed },
  ];
  const [currentStep, setCurrentStep] = useState(0);

  const statusMap = {
    WaitingInject: { label: "Chưa tiêm", className: "status_pending", step: 0 },
    Injected: { label: "Đã tiêm", className: "status_completed", step: 1 },
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError("Bạn chưa đăng nhập!");
          return;
        }

        // Lấy doctorId từ token
        let doctorId;
        try {
          const decoded = jwtDecode(token);
          doctorId = decoded.Id;
        } catch (err) {
          console.error("Lỗi giải mã token:", err);
          setError("Token không hợp lệ!");
          return;
        }

        // Gọi tất cả API cùng lúc
        const [vaccinePackageRes, vaccineRes, childrenRes, appointmentRes] =
          await Promise.all([
            api.get("/VaccinePackage/get-all"),
            api.get("/Vaccine/get-all"),
            api.get("/Child/get-all?PageSize=100"),
            api.get("/Appointment/get-all"),
          ]);

        const [vaccinePackageData, vaccineData, childrenData, appointmentData] =
          await Promise.all([
            vaccinePackageRes.data,
            vaccineRes.data,
            childrenRes.data,
            appointmentRes.data,
          ]);

        // Xử lý dữ liệu
        const vaccinePackageMap =
          vaccinePackageData?.$values?.reduce((acc, pkg) => {
            acc[pkg.id] = pkg.name;
            return acc;
          }, {}) || {};

        const vaccineMap =
          vaccineData?.$values?.reduce((acc, vaccine) => {
            acc[vaccine.id] = vaccine.name;
            return acc;
          }, {}) || {};

        const childrenMap =
          childrenData?.$values?.reduce((acc, child) => {
            acc[child.id] = child.childrenFullname;
            return acc;
          }, {}) || {};

        // Lọc danh sách theo doctorId
        const filteredAppointments =
          appointmentData?.$values?.filter(
            (appointment) => String(appointment.doctorId) === String(doctorId)
          ) || [];

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const upcomingAppointments = filteredAppointments.filter(
          (appointment) => {
            const appointmentDate = new Date(appointment.dateInjection);
            appointmentDate.setHours(0, 0, 0, 0);
            return appointmentDate >= today;
          }
        );

        // Cập nhật state
        setVaccinePackageMap(vaccinePackageMap);
        setVaccineMap(vaccineMap);
        setChildrenMap(childrenMap);

        // Format dữ liệu
        const formattedData = upcomingAppointments
          .filter(
            (item) =>
              item.processStep === "WaitingInject" ||
              item.processStep === "Injected"
          )
          .map((item) => ({
            id: item.id,
            fullname:
              childrenMap[item.childrenId] ||
              " ",
            date: item.dateInjection
              ? new Date(item.dateInjection).toLocaleDateString()
              : "",
            vaccine:
              vaccineMap[item.vaccineId] ||
              " ",
            vaccinePackage: vaccinePackageMap[item.vaccinePackageId] || "__________",
            status: item.processStep || "Không xác định",
          }));

        setData(formattedData);
      } catch (err) {
        console.error("Lỗi fetch dữ liệu:", err);
        setError("Không thể tải danh sách tiêm!");
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, [token]);

  useEffect(() => {
    if (selectedRecord) {
      setCurrentStep(statusMap[selectedRecord.status]?.step ?? 0);
    }
  }, [selectedRecord]);

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const columns = [
    {
      title: "No.",
      width: "7%",
      render: (_, __, index) =>
        (tableParams.pagination.current - 1) * tableParams.pagination.pageSize +
        index +
        1,
    },
    {
      title: "Mã số",
      dataIndex: "id",
      width: "10%",
    },
    {
      title: "Tên bé",
      dataIndex: "fullname",
      sorter: (a, b) => (a.fullname || "").localeCompare(b.fullname || ""),
      width: "15%",
    },
    {
      title: "Vắc xin",
      dataIndex: "vaccine",
      width: "15%",
    },
    {
      title: "Gói vắc xin",
      dataIndex: "vaccinePackage",
      width: "15%",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      width: "15%",
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      width: "15%",
      render: (status) => (
        <span className={`status_label ${statusMap[status]?.className || ""}`}>
          {statusMap[status]?.label || "Không xác định"}
        </span>
      ),
    },

    {
      title: "Chi tiết",
      width: "15%",
      render: (_, record) => (
        <div className="inject_detail">
          <button
            className="injection_detail_button"
            onClick={() => setSelectedRecord(record)}
          >
            Chi tiết
          </button>
        </div>
      ),
    },
  ];

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  return (
    <div className="injection">
      <h2 className="injection_topic">Danh sách tiêm</h2>

      <div className="injection_tab_content">
        <Table columns={columns} rowKey="id" dataSource={data} />
      </div>
      {selectedRecord && (
        <div className="popup_overlay" onClick={() => setSelectedRecord(null)}>
          <div className="popup_container" onClick={(e) => e.stopPropagation()}>
            <button
              className="popup_close"
              onClick={() => setSelectedRecord(null)}
            >
              ✖
            </button>
            <div className="popup_content">
              <h3>Theo dõi tiến trình</h3>
              <div className="step-container">
                {steps.map((step, index) => (
                  <div key={index} className="step-wrapper">
                    <motion.div
                      className={`step-circle ${
                        index <= currentStep ? "active" : "inactive"
                      }`}
                      animate={{ scale: index === currentStep ? 1.2 : 1 }}
                    >
                      {index < currentStep ||
                      (index === steps.length - 1 &&
                        currentStep === steps.length - 1)
                        ? "✔"
                        : index + 1}
                    </motion.div>
                    <span
                      className={`step-label ${
                        index <= currentStep ? "active-text" : "inactive-text"
                      }`}
                    >
                      {step.name}
                    </span>
                  </div>
                ))}
                <motion.div
                  className="progress-bar"
                  style={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(currentStep / (steps.length - 1)) * 100}%`,
                  }}
                />
              </div>

              <div className="step-content">
                {React.createElement(steps[currentStep].component, {
                  record: selectedRecord,
                })}
              </div>

              <div className="button-group">
                <button
                  className="prev-button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                >
                  Trở lại
                </button>
                <button
                  className="next-button"
                  onClick={nextStep}
                  disabled={currentStep >= steps.length - 1}
                >
                  Tiếp theo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inject_infor;
