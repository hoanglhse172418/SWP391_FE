import React, { useEffect, useState } from "react";

import "bootstrap/dist/css/bootstrap.min.css";
import "./VaccinePrice.css";
import api from "../../../services/api";

const VaccineList = () => {
  const [vaccines, setVaccines] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAllVaccines();
  }, []);

  const fetchAllVaccines = async () => {
    setLoading(true);
    try {
      const diseaseResponse = await api.get("/Disease/get-all?PageSize=300");
      const diseaseList = diseaseResponse.data?.["$values"] || [];

      const vaccineRequests = diseaseList.map((disease) =>
        api
          .get(`/Vaccine/get-vaccines-by-diasease-name/${encodeURIComponent(disease.name)}`)
          .then((res) =>
            (res.data?.["$values"] || []).map((vaccine) => ({
              ...vaccine,
              diseaseName: disease.name,
            }))
          )
          .catch((error) => {
            console.error(`Lỗi khi lấy vắc xin cho bệnh ${disease.name}:`, error);
            return [];
          })
      );

      const vaccineResults = await Promise.all(vaccineRequests);
      const allVaccines = vaccineResults.flat();

      setVaccines(allVaccines);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    }
    setLoading(false);
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center VaccineTitle">Danh Sách Vắc Xin</h2>

      {loading ? (
       <div className="loader"></div>
      ) : vaccines.length === 0 ? (
        <p className="text-center">Không có dữ liệu vắc xin.</p>
      ) : (
        <table className="table table-bordered table-striped vaccine-table">
          <thead>
            <tr>
              <th className="vaccine-tableTitle">STT</th>
              <th className="vaccine-tableTitle">Phòng bệnh</th>
              <th className="vaccine-tableTitle">Tên vắc xin</th>
              <th className="vaccine-tableTitle">Nước sản xuất</th>
              <th className="vaccine-tableTitle">Giá bán lẻ (VNĐ)</th>
              <th className="vaccine-tableTitle">Tình trạng</th>
            </tr>
          </thead>
          <tbody>
            {vaccines
              .filter((vaccine) => vaccine.name && vaccine.diseaseName)
              .map((vaccine, index) => (
                <tr key={vaccine.id || index}>
                  <td>{index + 1}</td>
                  <td>{vaccine.diseaseName}</td>
                  <td>{vaccine.name}</td>
                  <td>{vaccine.manufacture || "Không có thông tin"}</td>
                  <td>
                    {vaccine.price
                      ? Number(vaccine.price.toString().replace(/[^\d]/g, ""))
                          .toLocaleString("vi-VN") + " VND"
                      : "Chưa có giá"}
                  </td>
                  <td className={vaccine.inStockNumber > 0 ? "text-success" : "text-danger"}>
                    {vaccine.inStockNumber > 0 ? "Còn hàng" : <span style={{ color: "red" }}>Hết hàng</span>}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default VaccineList;