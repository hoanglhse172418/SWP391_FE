import { useEffect, useState } from "react";
import "./Inject.css";
import { notification } from "antd";
import api from "../../../services/api";

const Inject = ({ record }) => {
  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [childId, setChildId] = useState(null);
  const [vaccinationProfileId, setVaccinationProfileId] = useState(null);
  const [vaccinationRecords, setVaccinationRecords] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [vaccineList, setVaccineList] = useState([]);
  const [highlightedVaccines, setHighlightedVaccines] = useState({});
  const [selectedDisease, setSelectedDisease] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [selectedVaccine, setSelectedVaccine] = useState("");
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showModal2, setShowModal2] = useState(false);
  const [vaccineData, setVaccineData] = useState([]);
  const [editingDates, setEditingDates] = useState({});
  const [editingDate, setEditingDate] = useState({});
  const [editingId, setEditingId] = useState(null);
  const headers = [
    " ",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  useEffect(() => {
    const fetchAppointment = async () => {
      try {
        const response = await api.get(`/Appointment/get-by-id/${record.id}`);
        setAppointment(response.data);
      } catch (error) {
        console.error(
          "Lỗi:",
          error.response ? error.response.data.message : error.message
        );
      } finally {
        setLoading(false);
      }
    };

    if (record.id) {
      fetchAppointment();
    }
  }, [record.id]);

  // Lấy childId từ API Child dựa vào childFullName trong appointment
  useEffect(() => {
    if (!appointment?.childFullName) return;

    const fetchChildId = async () => {
      try {
        const response = await api.get("/Child/get-all?PageSize=100");
        const matchedChild = response.data?.$values.find(
          (child) => child.childrenFullname === appointment.childFullName
        );

        if (matchedChild) {
          setChildId(matchedChild.id);
        } else {
          console.warn(
            "Không tìm thấy trẻ em với tên:",
            appointment.childFullName
          );
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu trẻ em:", error);
      }
    };

    fetchChildId();
  }, [appointment?.childFullName]);

  // Khi đã có childId, gọi API để lấy thông tin tiêm chủng
  useEffect(() => {
    const fetchVaccinationProfile = async () => {
      if (!childId) return;

      try {
        const url = `/VaccinationProfile/get-all?FilterOn=childrenId&FilterQuery=${childId}&PageSize=100`;
        const response = await api.get(url);
        const result = await response.data;

        if (result?.$values?.length > 0) {
          setVaccinationProfileId(result.$values[0].id); // Lấy ID tiêm chủng đầu tiên
        }
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu tiêm chủng:", error);
      }
    };

    fetchVaccinationProfile();
  }, [childId]);

  const fetchUpdatedVaccinationRecords = async () => {
    if (!vaccinationProfileId) return;

    try {
      const response = await api.get(
        `/VaccinationDetail/get-all?FilterOn=vaccinationProfileId&FilterQuery=${vaccinationProfileId}&PageSize=100`
      );

      const records = response.data.$values || [];
      // console.log("Updated Vaccine Profile: ", records);

      setVaccinationRecords(records); // Cập nhật UI ngay lập tức
    } catch (error) {
      console.error("Lỗi khi tải lại dữ liệu vaccine:", error);
    }
  };

  useEffect(() => {
    if (vaccinationProfileId) {
      fetchUpdatedVaccinationRecords();
    }
  }, [vaccinationProfileId]);

  const fetchVaccineData = async () => {
    if (!childId || !appointment?.vaccinePackageId) return;
    try {
      const response = await api.get("/Appointment/get-all");

      if (!response.data || !response.data.$values) {
        console.error("API không trả về dữ liệu hợp lệ");
        return;
      }

      const data = response.data.$values;

      const filteredData = data.filter(
        (item) =>
          Number(item.childrenId) === Number(childId) &&
          Number(item.vaccinePackageId) === Number(appointment.vaccinePackageId)
      );

      const result = filteredData.map((item) => ({
        appointmentId: item.id,
        vaccineId: item.vaccineId,
        dateInjection: item.dateInjection,
        status: item.status,
      }));
      // console.log("kết quả: ", result);

      setVaccineData(result);
    } catch (error) {
      console.error("Lỗi khi fetch API:", error);
    }
  };

  useEffect(() => {
    fetchVaccineData();
  }, [childId, appointment?.vaccinePackageId]);

  const handleEditDatePackage = (appointmentId, currentDate) => {
    if (!currentDate) {
      setEditingDates((prev) => ({ ...prev, [appointmentId]: "" }));
    } else {
      const date = new Date(currentDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Điều chỉnh múi giờ

      setEditingDates((prev) => ({
        ...prev,
        [appointmentId]: date.toISOString().split("T")[0], // Giữ đúng ngày theo local
      }));
    }
    setEditingId(appointmentId);
  };

  const handleEditDateExpectedDate = (id, currentDate) => {
    if (!currentDate) {
      setEditingDate((prev) => ({ ...prev, [id]: "" }));
    } else {
      const date = new Date(currentDate);
      date.setMinutes(date.getMinutes() - date.getTimezoneOffset()); // Điều chỉnh múi giờ

      setEditingDate((prev) => ({
        ...prev,
        [id]: date.toISOString().split("T")[0], // Format YYYY-MM-DD
      }));
    }
    setEditingId(id);
  };

  const handleSaveDatesPackage = async () => {
    const updates = Object.entries(editingDates)
      .map(([appointmentId, newDate]) => {
        const parsedDate = new Date(newDate);
        if (isNaN(parsedDate.getTime())) {
          notification.error({
            message: "Ngày không hợp lệ! Vui lòng kiểm tra lại.",
          });
          return null;
        }
        return {
          appointmentId: Number(appointmentId),
          newDate: parsedDate.toISOString(),
        };
      })
      .filter(Boolean); // Lọc bỏ giá trị null

    if (updates.length === 0) {
      alert("Không có thay đổi nào để lưu!");
      return;
    }

    try {
      const response = await api.put(
        "/Appointment/update-multiple-injection-dates",
        updates,
        { headers: { "Content-Type": "application/json" } }
      );

      if (response.status === 200) {
        notification.success({
          message: "Cập nhật thành công",
        });
        setEditingDates({}); // Xóa trạng thái chỉnh sửa
        fetchVaccineData(); // Load lại danh sách mới từ API
      } else {
        notification.error({
          message: "Cập nhật thất bại, vui lòng thử lại!",
        });
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error);
      notification.error({
        message: "Lỗi kết nối! Vui lòng thử lại.",
      });
    }
  };

  const handleSaveDatesExpectedDate = async () => {
    // console.log("Dữ liệu trước khi cập nhật:", editingDate);

    if (!editingDate || Object.keys(editingDate).length === 0) {
      notification.warning({
        message: "Vui lòng chọn ngày trước khi lưu!",
      });
      return;
    }

    const updates = Object.entries(editingDate)
      .map(([id, newDate]) => {
        if (!newDate) {
          console.error(`Dữ liệu ngày không hợp lệ cho ID ${id}:`, newDate);
          return null;
        }

        // Định dạng lại ngày thành YYYY-MM-DD
        const formattedDate = new Date(newDate).toISOString().split("T")[0];
        return { id, expectedDay: formattedDate };
      })
      .filter(Boolean); // Lọc các giá trị null

    // console.log("Danh sách cập nhật gửi lên API:", updates);

    try {
      await Promise.all(
        updates.map(async ({ id, expectedDay }) => {
          const url = `/VaccinationDetail/update-expected-date-by-doctor/${id}?expectedDay=${encodeURIComponent(
            expectedDay
          )}`;
          // console.log(`Gửi API: ${url}`);

          const response = await api.put(url);

          console.log(`API Response cho ID ${id}:`, response.data);
        })
      );

      notification.success({
        message: "Cập nhật thành công",
      });

      fetchUpdatedVaccinationRecords(); // Load lại danh sách
      setEditingId(null); // Tắt chế độ chỉnh sửa
    } catch (error) {
      console.error("Lỗi khi cập nhật:", error.response?.data || error.message);
      notification.error({
        message: "Lỗi hệ thống",
        description:
          error.response?.data?.message || "Có lỗi xảy ra, vui lòng thử lại!",
      });
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "Pending":
        return "Chưa tiêm";
      case "Processing":
        return "Đang xử lý";
      case "Completed":
        return "Đã tiêm";
      case "Canceled":
        return "Đã hủy";
      default:
        return status;
    }
  };

  const getVaccineName = (vaccineId) => {
    const vaccine = vaccineList.find((v) => v.id === vaccineId);
    return vaccine ? vaccine.name : "";
  };

  const getDiseaseName = (diseaseId) => {
    const disease = diseases.find((v) => v.id === diseaseId);
    return disease ? disease.name : "";
  };

  //Vaccine
  useEffect(() => {
    api
      .get("/Vaccine/get-all")
      .then((response) =>
        setVaccineList(response.data.$values || response.data)
      )
      .catch((error) => console.error("API fetch error: ", error));
  }, []);

  useEffect(() => {
    if (vaccinationProfileId) {
      api
        .get(`/VaccineTemplate/get-by-profileid/${vaccinationProfileId}`)
        .then((response) => {
          const vaccineData = response.data.$values || response.data;
          const highlightMap = {};

          vaccineData.forEach((vaccine) => {
            if (!highlightMap[vaccine.month]) {
              highlightMap[vaccine.month] = [];
            }
            highlightMap[vaccine.month].push({
              diseaseId: vaccine.diseaseId,
              notes: vaccine.notes,
              expectedInjectionDate: vaccine.expectedInjectionDate, // Thêm ngày dự kiến
            });
          });

          setHighlightedVaccines(highlightMap);
        })
        .catch((error) => console.error("API fetch error: ", error));
    }
  }, [vaccinationProfileId]);

  useEffect(() => {
    api
      .get("/Disease/get-all?PageSize=100")
      .then((response) => {
        setDiseases(response.data.$values || response.data);
      })
      .catch((error) => console.error("API fetch error: ", error));
  }, []);

  //handle cell click
  const handleCellClick = (disease, month) => {
    setSelectedDisease(disease);
    setSelectedMonth(month);
    const existingRecord = vaccinationRecords.find(
      (record) => record.diseaseId === disease.id && record.month === month
    );

    setSelectedRecord(existingRecord || null);
    setSelectedVaccine(
      existingRecord
        ? vaccineList.find((v) => v.id === existingRecord.vaccineId)?.name
        : ""
    );
    console.log("Thông tin vaccine đã tiêm:", existingRecord);
    setShowModal(true);
  };

  //Handle Confirm
  const handleConfirmInjection = async () => {
    if (!appointment || !vaccinationProfileId) return;
    console.log("ProfileId:", vaccinationProfileId);
    console.log("VaccineId:", appointment.vaccineId);

    setConfirming(true);
    try {
      await api.put(
        `/Appointment/confirm-injection-by-doctor/${appointment.id}`
      );
      await api.put(`/VaccinationDetail/update-vaccine-for-doctor`, null, {
        params: {
          ProfileId: vaccinationProfileId, // ID hồ sơ tiêm chủng
          vaccineId: appointment.vaccineId, // ID vaccine
        },
      });
      notification.success({
        message: "Xác nhận thành công",
      });

      setAppointment({ ...appointment, confirmed: true }); // Cập nhật UI sau khi xác nhận
      fetchUpdatedVaccinationRecords();
      fetchVaccineData();
    } catch (err) {
      notification.error({
        message:
          "Lỗi: " + (err.response ? err.response.data.message : err.message),
      });
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <div className="loader"></div>;

  return (
    <div className="inject">
      <div className="inject-top">
        <h3>Tiêm Vaccine</h3>
        <div className="inject-container">
          <div className="inject-content">
            <p>
              <strong>Mã số:</strong> {appointment.id}
            </p>
            <p>
              <strong>Tên bé:</strong> {appointment.childFullName}
            </p>
            <p>
              <strong>Vắc xin:</strong> {appointment.vaccineName}
            </p>
          </div>
        </div>
        <button
          className="inject-btn"
          type="submit"
          onClick={handleConfirmInjection}
          disabled={confirming}
        >
          {confirming ? "Đang xác nhận..." : "Xác nhận đã tiêm"}
        </button>
      </div>

      <div className="inject-bottom">
        <h3>Sổ tiêm chủng</h3>
        <div className="table-responsive">
          <table className="table table-bordered text-center">
            <thead className="table-primary">
              {/* Dòng 1: Nhóm tiêu đề Tháng và Tuổi */}
              <tr>
                <th rowSpan={2} className="align-middle VaccinPage-Title">
                  Vắc xin
                </th>
                {headers.map((month, index) => (
                  <th key={index} className="align-middle VaccinPage-Title">
                    {month}
                  </th>
                ))}
              </tr>
              {/* Dòng 2: Các tháng và tuổi cụ thể */}
            </thead>
            <tbody>
              {diseases.map((disease, index) => (
                <tr key={index}>
                  <td className="align-middle VaccinPage-Name">
                    {disease.name}
                  </td>
                  {headers.map((monthLabel, idx) => {
                    if (idx === 0) return <td key={idx}></td>; // Bỏ qua "Sơ sinh"

                    const month = idx;

                    // Kiểm tra dữ liệu từ VaccineTemplate
                    const templateInfo = highlightedVaccines[month]?.find(
                      (v) => v.diseaseId === disease.id
                    );
                    const hasTemplateVaccine = !!templateInfo;
                    const note = templateInfo?.notes || "";
                    const expectedDate = templateInfo?.expectedInjectionDate
                      ? new Date(
                          templateInfo.expectedInjectionDate
                        ).toLocaleDateString()
                      : "Chưa có dữ liệu";

                    // Kiểm tra lịch tiêm thực tế (chỉ khi `month` đúng với dữ liệu)
                    const vaccination = vaccinationRecords.find(
                      (record) =>
                        record.diseaseId === disease.id &&
                        record.month === month
                    );

                    // Lấy tên vaccine đã tiêm (nếu có)
                    const injectedVaccine = vaccineList.find(
                      (v) => v.id === vaccination?.vaccineId
                    )?.name;

                    return (
                      <td
                        key={idx}
                        className="align-middle position-relative"
                        onClick={() => handleCellClick(disease, month)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: vaccination?.vaccineId
                            ? "#c8e6c9" // Nếu đã tiêm thì tô màu xanh nhạt
                            : hasTemplateVaccine
                            ? "var(--primary-colorVaccine)" // Nếu có kế hoạch tiêm thì tô màu chủ đạo
                            : "",
                        }}
                      >
                        {/* Hiển thị tên vaccine đã tiêm phía trên dấu tick */}
                        {vaccination?.vaccineId && (
                          <div
                            style={{
                              fontSize: "12px",
                              fontWeight: "bold",
                              color: "#000",
                            }}
                          >
                            {injectedVaccine}
                          </div>
                        )}
                        {/* Chỉ hiển thị dấu tích nếu đã có vaccineId và đúng month */}
                        {vaccination?.vaccineId && vaccination?.month === month
                          ? "✔️"
                          : ""}

                        {/* Chỉ hiển thị tooltip nếu chưa tiêm nhưng có lịch tiêm */}
                        {!vaccination?.vaccineId && hasTemplateVaccine && (
                          <div className="tooltip-box">
                            <div>
                              <strong>Ghi chú:</strong> {note}
                            </div>
                            <div>
                              <strong>Ngày dự kiến:</strong> {expectedDate}
                            </div>
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>

          <div className="VaccinPage-flex">
            <button
              type="submit"
              className="button-update-inject"
              onClick={() => setShowModal2(true)}
            >
              Điều chỉnh mũi tiêm
            </button>
            {/* <button
              type="submit"
              className={`button-update-inject ${
                appointment.vaccineType === "Single"
                  ? "modal-disabled-button"
                  : ""
              }`}
              onClick={() => setShowModal2(true)}
              disabled={appointment.vaccineType === "Single"} // Disable khi là Single
            >
              Điều chỉnh mũi tiêm
            </button> */}
          </div>
        </div>
      </div>

      {showModal2 && (
        <div className="modal-overlay-2">
          <div className="modal-content-2">
            <button
              className="popup_close_modal_2"
              onClick={() => setShowModal2(false)}
            >
              ✖
            </button>
            <div className="modal-table-1">
              <div className="modal-pkg">
                <p>
                  <strong>Dự kiến tiêm</strong>
                </p>
              </div>
              <div className="modal-table-container">
                <table className="modal-table">
                  <thead>
                    <tr>
                      <th>Bệnh</th>
                      <th>Mũi tiêm</th>
                      <th>Ngày dự kiến tiêm</th>
                      <th>Ngày tiêm</th>
                      <th>Vắc xin</th>
                      <th>Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      let doseCount = {}; // Lưu số lần xuất hiện của vaccineId theo bệnh

                      return vaccinationRecords
                        .sort((a, b) => a.diseaseId - b.diseaseId) // Sắp xếp theo diseaseId
                        .map((item, index) => {
                          // Nếu vaccineId đã tồn tại trong doseCount, tăng số thứ tự
                          if (!doseCount[item.diseaseId]) {
                            doseCount[item.diseaseId] = 1;
                          } else {
                            doseCount[item.diseaseId]++;
                          }

                          return (
                            <tr key={index}>
                              <td>{getDiseaseName(item.diseaseId)}</td>

                              {/* Gán đúng mũi tiêm theo thứ tự */}
                              <td>Tiêm mũi {doseCount[item.diseaseId]}</td>

                              <td>
                                {editingId === item.id && !item.vaccineId ? (
                                  <input
                                    type="date"
                                    className="modal-input-date"
                                    value={editingDate[item.id] || ""}
                                    onChange={(e) =>
                                      setEditingDate({
                                        ...editingDate,
                                        [item.id]: e.target.value,
                                      })
                                    }
                                    onBlur={() => setEditingId(null)}
                                    autoFocus
                                  />
                                ) : (
                                  <span
                                    onClick={() => {
                                      if (!item.vaccineId) {
                                        handleEditDateExpectedDate(
                                          item.id,
                                          item.expectedInjectionDate
                                        );
                                      }
                                    }}
                                    style={{
                                      cursor: item.vaccineId
                                        ? "default"
                                        : "pointer",
                                    }}
                                  >
                                    {item.expectedInjectionDate
                                      ? new Date(
                                          item.expectedInjectionDate
                                        ).toLocaleDateString("vi-VN")
                                      : "Chưa có lịch"}
                                  </span>
                                )}
                              </td>

                              <td>
                                {item.actualInjectionDate
                                  ? new Date(
                                      item.actualInjectionDate
                                    ).toLocaleDateString("vi-VN")
                                  : ""}
                              </td>

                              <td>{getVaccineName(item.vaccineId) || ""}</td>

                              <td
                                className={
                                  item.vaccineId
                                    ? "status-datiem"
                                    : "status-chuatiem"
                                }
                              >
                                {item.vaccineId ? "Đã tiêm" : "Chưa tiêm"}
                              </td>
                            </tr>
                          );
                        });
                    })()}
                  </tbody>
                </table>
              </div>
              <div className="VaccinPage-flex1 modal-buttons">
                <button
                  className="btn-save-inject"
                  onClick={handleSaveDatesExpectedDate}
                >
                  Lưu
                </button>
              </div>
            </div>
            {appointment.vaccineType !== "Single" &&
              vaccineData.length > 0 &&
              !vaccineData.every((item) => item.status === "Completed") && (
                <div className="modal-tabel-2">
                  <div className="modal-pkg">
                    <p>
                      <strong>Gói đã mua:</strong>{" "}
                      {appointment.vaccinePackageName}
                    </p>
                  </div>
                  <div className="modal-table-container">
                    <table className="modal-table">
                      <thead>
                        <tr>
                          <th>Vắc xin</th>
                          <th>Ngày tiêm</th>
                          <th>Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody>
                        {vaccineData
                        .slice()
                        .sort((a,b) => new Date(a.dateInjection) - new Date(b.dateInjection))
                        .map((item, index) => (
                          <tr key={index}>
                            <td>
                              
                              {getVaccineName(item.vaccineId)}
                            </td>

                            <td>
                              {editingId === item.appointmentId &&
                              item.status !== "Completed" ? (
                                <input
                                  className="modal-input-date"
                                  type="date"
                                  value={editingDates[item.appointmentId]}
                                  onChange={(e) =>
                                    setEditingDates({
                                      ...editingDates,
                                      [item.appointmentId]: e.target.value,
                                    })
                                  }
                                  onBlur={() => setEditingId(null)} // Khi click ra ngoài thì ẩn input
                                  autoFocus // Tự động focus vào input khi mở
                                />
                              ) : (
                                <span
                                  onClick={() =>
                                    item.status !== "Completed" &&
                                    handleEditDatePackage(
                                      item.appointmentId,
                                      item.dateInjection
                                    )
                                  } // Không cho chỉnh sửa nếu đã hoàn thành
                                  style={{
                                    cursor:
                                      item.status === "Completed"
                                        ? "default"
                                        : "pointer",
                                  }}
                                >
                                  {item.dateInjection
                                    ? new Date(
                                        item.dateInjection
                                      ).toLocaleDateString("vi-VN")
                                    : "Chưa có lịch"}
                                </span>
                              )}
                            </td>
                            <td
                              className={`modal-status-${item.status.toLowerCase()}`}
                            >
                              {getStatusText(item.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="VaccinPage-flex1 modal-buttons">
                    <button
                      className="btn-save-inject"
                      onClick={handleSaveDatesPackage}
                    >
                      Lưu
                    </button>
                  </div>
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Inject;
