import { useEffect, useState } from "react";
import "./Injection.css";
import { Table } from "antd";
import { motion } from "framer-motion";
import Booking from "../booking/Booking";
import Confirm from "../confirm/Confirm";
import Invoice from "../invoice/Invoice";
import Inject from "../inject/Inject";
import Completed from "../completed/Completed";
import React from "react";
import api from "../../../services/api";
import { Modal, message } from "antd";

const Injection = () => {
  const [activeTab, setActiveTab] = useState("today");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [prevDataString, setPrevDataString] = useState("");
  const [data, setData] = useState([]);
  const steps = [
    { name: "Đặt lịch", component: Booking },
    { name: "Xác nhận", component: Confirm },
    { name: "Thanh toán", component: Invoice },
    { name: "Tiêm", component: Inject },
    { name: "Hoàn Thành", component: Completed },
  ];
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  useEffect(() => {
    if (appointmentDetails && appointmentDetails.processStep) {
      const newStep =
        processStepMap[appointmentDetails.processStep.trim()] ?? 0;
      setCurrentStep(newStep);
    }
  }, [appointmentDetails]);

  useEffect(() => {
    let interval;

    const fetchTodayAndUpcoming = async () => {
      if (activeTab === "today") {
        await fetchAppointments("/Appointment/get-appointment-today");
      } else {
        await fetchAppointments("/Appointment/get-appointment-future");
      }
    };

    fetchTodayAndUpcoming(); // Gọi ngay lần đầu tiên

    interval = setInterval(fetchTodayAndUpcoming, 5000); // Cập nhật mỗi 5 giây, nhưng chỉ khi có thay đổi

    return () => clearInterval(interval);
  }, [activeTab]); // Chỉ theo dõi activeTab

  const fetchAppointments = async (url) => {
    try {
      const response = await api.get(url);
      if (response.data.$values) {
        const formattedData = response.data.$values.map((item) => {
          const date = new Date(item.dateInjection);
          return {
            id: item.id,
            fullname: item.childFullName,
            date: date.toLocaleDateString("vi-VN"),
            status: item.status,
          };
        });

        formattedData.sort((a, b) => b.id - a.id);
        const newDataString = JSON.stringify(formattedData);
        if (newDataString !== prevDataString) {
          setData(formattedData);
          setPrevDataString(newDataString);
        }
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  const processStepMap = {
    Booked: 0, // Bước 1: Đặt lịch
    ConfirmInfo: 1, // Bước 2: Xác nhận
    WaitingInject: 3, // Bước 4: Tiêm/Chờ
    Injected: 4, // Bước 5: Hoàn Thành
  };
  const fetchAppointmentDetails = async (id) => {
    try {
      const response = await api.get(`/Appointment/get-by-id/${id}`);
      const details = response.data;
      setAppointmentDetails(details); // Lưu dữ liệu chi tiết

      // // Kiểm tra processStep từ API có đúng không
      if (details.processStep) {
        console.log("processStep từ API:", details.processStep);
      } else {
        console.log("API không trả về processStep!");
      }

      // Chỉ cập nhật currentStep nếu có giá trị hợp lệ
      if (
        details.processStep &&
        processStepMap[details.processStep] !== undefined
      ) {
        setCurrentStep(processStepMap[details.processStep]);
      }
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết cuộc hẹn:", error);
    }
  };

  const handleDetails = (record) => {
    console.log("Record được chọn:", record);
    setSelectedRecord(record);
    fetchAppointmentDetails(record.id); // Lấy thông tin chi tiết
    // setCurrentStep(record.step || 0); // Nếu record đã có step thì giữ nguyên, nếu chưa có thì đặt 0
  };

  const statusMap = {
    Pending: { label: "Chờ duyệt", className: "status_pending" },
    Processing: { label: "Đang xử lý", className: "status_processing" },
    Completed: { label: "Đã xong", className: "status_completed" },
    Canceled: { label: "Đã hủy", className: "status_canceled" },
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setSelectedRecord((prev) => ({ ...prev, step: (prev?.step || 0) + 1 }));
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedRecord.id
            ? { ...item, step: (selectedRecord.step || 0) + 1 }
            : item
        )
      );
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setSelectedRecord((prev) => ({ ...prev, step: (prev?.step || 0) - 1 }));
      setData((prevData) =>
        prevData.map((item) =>
          item.id === selectedRecord.id
            ? { ...item, step: (selectedRecord.step || 0) - 1 }
            : item
        )
      );
    }
  };

  // const handleCancel = async (id) => {
  //   const isConfirmed = window.confirm("Bạn có chắc chắn muốn hủy lịch hẹn này không?");
  // if (!isConfirmed) return;
  //   try {
  //     const response = await api.put(
  //       `/Appointment/cancel-appointment/${id}`
  //     );

  //     if (response.status === 200) {
  //       // Cập nhật UI sau khi API thành công
  //       setData((prevData) =>
  //         prevData.map((item) =>
  //           item.id === id ? { ...item, status: "Canceled" } : item
  //         )
  //       );
  //     }
  //   } catch (error) {
  //     console.error("Lỗi khi hủy cuộc hẹn:", error);
  //   }
  // };

  const handleCancel = async (id) => {
    Modal.confirm({
      title: "Xác nhận hủy lịch hẹn",
      content: "Bạn có chắc chắn muốn hủy lịch hẹn này không?",
      okText: "Có",
      cancelText: "Không",
      onOk: async () => {
        try {
          const response = await api.put(
            `/Appointment/cancel-appointment/${id}`
          );
          if (response.status === 200) {
            // Cập nhật UI sau khi API thành công
            setData((prevData) =>
              prevData.map((item) =>
                item.id === id ? { ...item, status: "Canceled" } : item
              )
            );
          }
        } catch (error) {
          console.error("Lỗi khi hủy cuộc hẹn:", error);
        }
      },
    });
  };

  const [tableParams, setTableParams] = useState({
    pagination: {
      current: 1,
      pageSize: 10,
      total: 0,
    },
  });

  const getColumns = () => {
    const baseColumns = [
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
        render: (id) => id || "N/A",
        width: "10%",
      },
      {
        title: "Tên bé",
        dataIndex: "fullname",
        sorter: (a, b) => (a.fullname || "").localeCompare(b.fullname || ""),
        width: "20%",
        render: (fullname) => fullname || "N/A",
      },
      {
        title: "Ngày tiêm",
        dataIndex: "date",
        width: "15%",
        sorter: (a, b) => (a.date || "").localeCompare(b.date || ""),
        render: (date) => date || "N/A",
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
    ];
  
    if (activeTab === "today") {
      baseColumns.push({
        title: "Chi tiết",
        width: "15%",
        render: (_, record) => (
          <div className="inject_detail">
            <button
              className={`injection_detail_button ${
                record.status === "Canceled" ? "disabled-button" : ""
              }`}
              onClick={() =>
                record.status !== "Canceled" && handleDetails(record)
              }
              disabled={record.status === "Canceled"}
            >
              Chi tiết
            </button>
            <button
              className={`injection_cancel_button ${
                record.status === "Canceled" || record.status === "Completed"
                  ? "disabled-button"
                  : ""
              }`}
              onClick={() =>
                record.status !== "Canceled" &&
                record.processStep !== "Injected" &&
                handleCancel(record.id)
              }
              disabled={
                record.status === "Canceled" || record.status === "Completed"
              }
            >
              Hủy
            </button>
          </div>
        ),
      });
    }
  
    return baseColumns;
  };
  
  return (
    <div className="injection">
      <h2 className="injection_topic">Danh sách đăng ký tiêm</h2>
      {/* Tab Header */}
      <div className="injection_tab_container">
        <button
          className={`injection_tab_button ${
            activeTab === "today" ? "active" : ""
          }`}
          onClick={() => setActiveTab("today")}
        >
          Hôm nay
        </button>
        <button
          className={`injection_tab_button ${
            activeTab === "upcoming" ? "active" : ""
          }`}
          onClick={() => setActiveTab("upcoming")}
        >
          Sắp tới
        </button>
      </div>

      <div className="injection_tab_content">
        <Table
          columns={getColumns()}
          rowKey={(record) => record.id}
          dataSource={data}
          loading={loading}
          locale={{
            emptyText: "Không có lịch hẹn",
          }}
        />
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
                {steps[currentStep] ? (
                  React.createElement(steps[currentStep].component, {
                    record: selectedRecord,
                    details: appointmentDetails,
                  })
                ) : (
                  <div className="loader"></div>
                )}
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

export default Injection;
