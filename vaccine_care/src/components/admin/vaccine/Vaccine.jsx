import React, { useState, useEffect } from "react";
import {
  Table,
  Tag,
  Image,
  Tooltip,
  Radio,
  Button,
  message,
  Modal,
  Input,
  InputNumber,
  Select,
} from "antd";
import api from "../../../services/api";
import "./vaccine.css";
import "../admin.css";

const Vaccine = () => {
  const [vaccines, setVaccines] = useState([]);
  const [vaccinePackages, setVaccinePackages] = useState([]);
  const [diseases, setDiseases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vaccine");
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [packageName, setPackageName] = useState("");
  const [selectedVaccines, setSelectedVaccines] = useState([
    { vaccineId: "", doseNumber: 1 },
  ]);
  const [isCreateVaccineModalVisible, setIsCreateVaccineModalVisible] =
    useState(false);
  const [newVaccine, setNewVaccine] = useState({
    vaccineName: "",
    manufacture: "",
    description: "",
    imageFile: null,
    recAgeStart: "",
    recAgeEnd: "",
    recAgeStartUnit: "month",
    recAgeEndUnit: "month",
    inStockNumber: "",
    price: "",
    displayPrice: "",
    notes: "",
  });
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [vaccineToUpdate, setVaccineToUpdate] = useState(null);
  const [vaccineDetails, setVaccineDetails] = useState({});

  const getAllVaccines = () => api.get("/Vaccine/get-all");
  const getAllVaccinePackages = () => api.get("/VaccinePackage/get-all");
  const getAllDiseases = () => api.get("/Disease/get-all");
  const getVaccinesByDisease = (diseaseName) => api.get(`/Vaccine/get-vaccines-by-diasease-name/${diseaseName}`);

  useEffect(() => {
    if (activeTab === "vaccine") {
      fetchVaccinesAndDiseases();
    } else {
      fetchVaccinePackages();
    }
  }, [activeTab]);

  const fetchVaccinesAndDiseases = async () => {
    try {
      setLoading(true);
      const [vaccinesResponse, diseasesResponse] = await Promise.all([
        getAllVaccines(),
        getAllDiseases()
      ]);

      const diseasesList = diseasesResponse.data.$values;
      setDiseases(diseasesList);

      // Lấy danh sách vaccine cho từng bệnh
      const vaccinesByDisease = await Promise.all(
        diseasesList.map(async (disease) => {
          try {
            const response = await getVaccinesByDisease(disease.name);
            return {
              diseaseName: disease.name,
              vaccines: response.data.$values || []
            };
          } catch (error) {
            console.error(`Error fetching vaccines for disease ${disease.name}:`, error);
            return {
              diseaseName: disease.name,
              vaccines: []
            };
          }
        })
      );

      // Map vaccines với diseases tương ứng
      const formattedVaccines = vaccinesResponse.data.$values.map(vaccine => {
        const vaccineInDiseases = vaccinesByDisease.filter(vd => 
          vd.vaccines.some(v => v.id === vaccine.id)
        );
        const diseaseNames = vaccineInDiseases.map(vd => vd.diseaseName);

        return {
          id: vaccine.id,
          name: vaccine.name,
          manufacture: vaccine.manufacture,
          description: vaccine.description,
          imageUrl: vaccine.imageUrl,
          inStockNumber: vaccine.inStockNumber,
          price: vaccine.price,
          recAgeStart: vaccine.recAgeStart,
          recAgeEnd: vaccine.recAgeEnd,
          status: vaccine.inStockNumber > 0 ? "Còn hàng" : "Hết hàng",
          diseases: diseaseNames
        };
      });

      setVaccines(formattedVaccines);
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("Có lỗi xảy ra khi tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinePackages = async () => {
    try {
      const response = await getAllVaccinePackages();
      const formattedData = response.data.$values.map((pkg) => ({
        id: pkg.id,
        name: pkg.name,
        totalPrice: pkg.price || 0,
        createdAt: new Date(pkg.createdAt).toLocaleDateString("vi-VN"),
        vaccineCount: pkg.vaccinePackageItems.$values.length,
        status:
          pkg.vaccinePackageItems.$values.length > 0 ? "Active" : "Inactive",
        vaccinePackageItems: pkg.vaccinePackageItems.$values,
      }));
      setVaccinePackages(formattedData);
    } catch (error) {
      console.error("Error fetching vaccine packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVaccinePackageDetails = async (id) => {
    try {
      const response = await api.get(`/VaccinePackage/get-by-id/${id}`);
      return response.data.vaccinePackageItems.$values.map((item) => ({
        id: item.vaccine.id,
        name: item.vaccine.name,
        manufacture: item.vaccine.manufacture,
        price: item.pricePerDose,
        description: item.vaccine.description,
        imageUrl: item.vaccine.imageUrl,
        status: item.vaccine.inStockNumber > 0 ? "Còn hàng" : "Hết hàng",
      }));
    } catch (error) {
      console.error("Error fetching vaccine package details:", error);
      return [];
    }
  };

  const handleTabChange = (e) => {
    setActiveTab(e.target.value);
    setLoading(true);
  };

  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Hình ảnh",
      dataIndex: "imageUrl",
      key: "imageUrl",
      width: 120,
      render: (imageUrl) => (
        <Image
          src={imageUrl}
          alt="vaccine"
          style={{ width: 100, height: 100, objectFit: "cover" }}
        />
      ),
    },
    {
      title: "Tên vắc xin",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "Nhà sản xuất",
      dataIndex: "manufacture",
      key: "manufacture",
      width: 120,
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      width: 300,
      render: (text) => (
        <Tooltip
          title={text}
          placement="topLeft"
          styles={{ root: { maxWidth: "500px" } }}
        >
          <div className="vaccine-description-cell">{text}</div>
        </Tooltip>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "inStockNumber",
      key: "inStockNumber",
      width: 100,
    },
    {
      title: "Giá (VNĐ)",
      dataIndex: "price",
      key: "price",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Còn hàng" ? "green" : "red"}>
          {status}
        </Tag>
      ),
    },
    {
      title: "Phòng bệnh",
      dataIndex: "diseases",
      key: "diseases",
      width: 200,
      render: (diseases) => (
        <div>
          {diseases && diseases.length > 0 ? (
            diseases.map((disease, index) => (
              <Tag key={index} color="blue" style={{ margin: '2px' }}>
                {disease}
              </Tag>
            ))
          ) : (
            <Tag color="default">Chưa phân loại</Tag>
          )}
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      width: 120,
      render: (_, record) => (
        <Button
          type="primary"
          onClick={() => {
            setVaccineToUpdate({
              id: record.id,
              vaccineName: record.name,
              manufacture: record.manufacture,
              description: record.description,
              recAgeStart: record.recAgeStart,
              recAgeEnd: record.recAgeEnd,
              inStockNumber: record.inStockNumber,
              price: record.price,
              notes: record.notes || "",
              imageFile: null,
              currentImageUrl: record.imageUrl
            });
            setIsUpdateModalVisible(true);
          }}
        >
          Cập nhật
        </Button>
      ),
    },
  ];

  const packageColumns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 70,
    },
    {
      title: "Tên gói",
      dataIndex: "name",
      key: "name",
      width: 200,
    },
    {
      title: "Số lượng vắc xin",
      dataIndex: "vaccineCount",
      key: "vaccineCount",
      width: 150,
    },
    {
      title: "Tổng giá (VNĐ)",
      dataIndex: "totalPrice",
      key: "totalPrice",
      width: 150,
      render: (price) => price.toLocaleString("vi-VN"),
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 120,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: (status) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status === "Active" ? "Đang hoạt động" : "Không hoạt động"}</Tag>
      ),
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_, record) => (
        <Button
          className="admin-delete-button"
          type="primary"
          onClick={() => showDeleteConfirm(record.id)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const showDeleteConfirm = (id) => {
    setDeleteId(id);
    setIsModalVisible(true);
  };

  const handleDelete = async () => {
    try {
      // await api.delete(`/VaccinePackage/delete?id=${deleteId}`);
      await api.delete(`/VaccinePackage/delete/${deleteId}`);
      message.success("Package deleted successfully");
      fetchVaccinePackages();
    } catch (error) {
      message.error("Failed to delete package");
    } finally {
      setIsModalVisible(false);
      setDeleteId(null);
    }
  };

  const expandedRowRender = (record) => {
    const vaccineColumns = [
      {
        title: "ID",
        dataIndex: "vaccineId",
        key: "id",
        width: 70,
      },
      {
        title: "Tên vắc xin",
        dataIndex: "vaccineName",
        key: "name",
      },
      {
        title: "Số liều",
        dataIndex: "doseNumber",
        key: "doseNumber",
      },
      {
        title: "Giá mỗi liều (VNĐ)",
        dataIndex: "pricePerDose",
        key: "price",
        render: (price) => price.toLocaleString("vi-VN"),
      },
    ];

    return (
      <Table
        columns={vaccineColumns}
        dataSource={record.vaccinePackageItems}
        pagination={false}
        rowKey="$id"
      />
    );
  };

  const handleCreatePackage = async () => {
    try {
      // Kiểm tra tên gói
      if (!packageName.trim()) {
        message.error("Vui lòng nhập tên gói vaccine");
        return;
      }

      // Kiểm tra các vaccine được chọn
      const validVaccines = selectedVaccines.filter(
        (v) => v.vaccineId && v.doseNumber > 0
      );
      if (validVaccines.length === 0) {
        message.error("Vui lòng chọn ít nhất một vaccine");
        return;
      }

      const payload = {
        name: packageName.trim(),
        vaccinePackageItems: selectedVaccines
          .filter((v) => v.vaccineId && v.doseNumber > 0)
          .map((item) => ({
            vaccineId: Number(item.vaccineId),
            doseNumber: Number(item.doseNumber),
          })),
      };

      await api.post("/VaccinePackage/create", payload);
      message.success("Tạo gói vaccine thành công");
      setIsCreateModalVisible(false);
      setPackageName("");
      setSelectedVaccines([{ vaccineId: "", doseNumber: 1 }]);
      fetchVaccinePackages();
    } catch (error) {
      console.error("Error creating vaccine package:", error);
      message.error("Đã xảy ra lỗi khi tạo gói vaccine");
    }
  };

  const addVaccineField = () => {
    if (selectedVaccines.length < 3) {
      setSelectedVaccines([
        ...selectedVaccines,
        { vaccineId: "", doseNumber: 1 },
      ]);
    }
  };

  const removeVaccineField = (index) => {
    const newVaccines = selectedVaccines.filter((_, i) => i !== index);
    setSelectedVaccines(newVaccines);
  };

  const updateVaccineField = (index, field, value) => {
    const newVaccines = [...selectedVaccines];
    newVaccines[index][field] = value;
    setSelectedVaccines(newVaccines);
  };

  const handleAgeChange = (value, field) => {
    if (value <= 0) {
      message.error("Độ tuổi phải lớn hơn 0");
      return;
    }
    setNewVaccine(prev => ({ ...prev, [field]: value }));
  };

  const handleStockChange = (value) => {
    if (value < 0) {
      message.error("Số lượng trong kho không thể là số âm");
      return;
    }
    setNewVaccine(prev => ({ ...prev, inStockNumber: value }));
  };

  const handleCreateVaccine = async () => {
    try {
      // Validate required fields
      if (!newVaccine.vaccineName.trim()) {
        message.error("Vui lòng nhập tên vaccine");
        return;
      }
      if (!newVaccine.manufacture.trim()) {
        message.error("Vui lòng nhập tên nhà sản xuất");
        return;
      }
      if (!newVaccine.description.trim()) {
        message.error("Vui lòng nhập mô tả vaccine");
        return;
      }
      if (!newVaccine.imageFile) {
        message.error("Vui lòng chọn hình ảnh vaccine");
        return;
      }
      if (!newVaccine.recAgeStart || newVaccine.recAgeStart <= 0) {
        message.error("Độ tuổi bắt đầu phải lớn hơn 0");
        return;
      }
      if (!newVaccine.recAgeEnd || newVaccine.recAgeEnd <= 0) {
        message.error("Độ tuổi kết thúc phải lớn hơn 0");
        return;
      }
      if (newVaccine.recAgeEnd <= newVaccine.recAgeStart) {
        message.error("Độ tuổi kết thúc phải lớn hơn độ tuổi bắt đầu");
        return;
      }
      if (!newVaccine.inStockNumber && newVaccine.inStockNumber !== 0) {
        message.error("Vui lòng nhập số lượng trong kho");
        return;
      }
      if (newVaccine.inStockNumber < 0) {
        message.error("Số lượng trong kho không thể là số âm");
        return;
      }
      if (!newVaccine.price || parseInt(newVaccine.price) <= 0) {
        message.error("Vui lòng nhập giá vaccine hợp lệ");
        return;
      }

      // Chuyển đổi độ tuổi sang tháng
      const startAgeInMonths = convertToMonths(newVaccine.recAgeStart, newVaccine.recAgeStartUnit);
      const endAgeInMonths = convertToMonths(newVaccine.recAgeEnd, newVaccine.recAgeEndUnit);

      const formData = new FormData();
      formData.append("VaccineName", newVaccine.vaccineName);
      formData.append("Manufacture", newVaccine.manufacture);
      formData.append("Description", newVaccine.description);
      formData.append("ImageFile", newVaccine.imageFile);
      formData.append("RecAgeStart", startAgeInMonths);
      formData.append("RecAgeEnd", endAgeInMonths);
      formData.append("InStockNumber", newVaccine.inStockNumber);
      formData.append("Price", newVaccine.price);
      formData.append("Notes", newVaccine.notes);

      await api.post("/Vaccine/create", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Tạo vaccine thành công");
      setIsCreateVaccineModalVisible(false);
      setNewVaccine({
        vaccineName: "",
        manufacture: "",
        description: "",
        imageFile: null,
        recAgeStart: "",
        recAgeEnd: "",
        recAgeStartUnit: "month",
        recAgeEndUnit: "month",
        inStockNumber: "",
        price: "",
        displayPrice: "",
        notes: "",
      });
      fetchVaccinesAndDiseases();
    } catch (error) {
      console.error("Error creating vaccine:", error);
      message.error("Có lỗi xảy ra khi tạo vaccine");
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setNewVaccine((prev) => ({
        ...prev,
        imageFile: e.target.files[0],
      }));
    }
  };

  const handleUpdateStockChange = (value) => {
    if (value < 0) {
      message.error("Số lượng trong kho không thể là số âm");
      return;
    }
    setVaccineToUpdate(prev => ({ ...prev, inStockNumber: value }));
  };

  const handleUpdate = async () => {
    try {
      const formData = new FormData();
      formData.append("VaccineName", vaccineToUpdate.vaccineName);
      formData.append("Manufacture", vaccineToUpdate.manufacture);
      formData.append("Description", vaccineToUpdate.description);
      
      // Nếu có ảnh mới được chọn
      if (vaccineToUpdate.imageFile) {
        formData.append("ImageFile", vaccineToUpdate.imageFile);
      } else {
        // Nếu không có ảnh mới, tạo một Blob từ URL ảnh cũ
        const response = await fetch(vaccineToUpdate.currentImageUrl);
        const blob = await response.blob();
        formData.append("ImageFile", blob, "current-image.jpg");
      }

      formData.append("RecAgeStart", vaccineToUpdate.recAgeStart || 0);
      formData.append("RecAgeEnd", vaccineToUpdate.recAgeEnd || 0);
      formData.append("InStockNumber", vaccineToUpdate.inStockNumber);
      formData.append("Price", vaccineToUpdate.price);
      formData.append("Notes", vaccineToUpdate.notes || "");

      await api.put(`/Vaccine/update/${vaccineToUpdate.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Vaccine đã được cập nhật thành công");
      setIsUpdateModalVisible(false);
      fetchVaccinesAndDiseases();
    } catch (error) {
      console.error("Error updating vaccine:", error);
      message.error("Đã xảy ra lỗi khi cập nhật vaccine");
    }
  };

  // Thêm hàm chuyển đổi tuổi sang tháng
  const convertToMonths = (age, unit) => {
    return unit === "year" ? age * 12 : parseInt(age);
  };

  // Thêm hàm format giá tiền
  const formatPrice = (price) => {
    if (!price) return '';
    // Loại bỏ tất cả ký tự không phải số
    const numericValue = price.toString().replace(/[^0-9]/g, '');
    // Format số với dấu phẩy ngăn cách hàng nghìn
    return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Thêm hàm xử lý thay đổi giá
  const handlePriceChange = (e) => {
    const { value } = e.target;
    // Lấy giá trị số từ chuỗi đã format
    const numericValue = value.replace(/[^0-9]/g, '');
    // Cập nhật state với giá trị đã format
    setNewVaccine(prev => ({
      ...prev,
      price: numericValue,
      displayPrice: formatPrice(numericValue) // Thêm displayPrice để hiển thị
    }));
  };

  // Thêm hàm xử lý thay đổi giá cho form cập nhật
  const handleUpdatePriceChange = (e) => {
    const { value } = e.target;
    const numericValue = value.replace(/[^0-9]/g, '');
    setVaccineToUpdate(prev => ({
      ...prev,
      price: numericValue,
      displayPrice: formatPrice(numericValue)
    }));
  };

  const fetchVaccineDetails = async (vaccineId) => {
    try {
      const vaccine = vaccines.find(v => v.id === vaccineId);
      if (vaccine && vaccine.diseases?.length > 0) {
        return vaccine.diseases.join(', ');
      }
      return '';
    } catch (error) {
      console.error('Error fetching vaccine details:', error);
      return '';
    }
  };

  return (
    <>
      <div className="admin">
        <div className="admin-vaccine-container">
          <div className="admin-vaccine-header">
            <h2 className="admin-vaccine-title">Quản lý vắc xin</h2>
            <div className="admin-vaccine-controls">
              <Radio.Group
                value={activeTab}
                onChange={handleTabChange}
                className="admin-vaccine-tabs"
              >
                <Radio.Button value="vaccine">Vắc xin</Radio.Button>
                <Radio.Button value="package">Gói vắc xin</Radio.Button>
              </Radio.Group>
              {activeTab === "vaccine" ? (
                <Button
                  type="primary"
                  onClick={() => setIsCreateVaccineModalVisible(true)}
                  style={{ marginLeft: "16px" }}
                >
                  Thêm vắc xin mới
                </Button>
              ) : (
                <Button
                  type="primary"
                  onClick={() => setIsCreateModalVisible(true)}
                  style={{ marginLeft: "16px" }}
                >
                  Thêm gói vắc xin mới
                </Button>
              )}
            </div>
          </div>

          {activeTab === "vaccine" ? (
            <Table
              columns={columns}
              dataSource={vaccines}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
              scroll={{ x: 1300 }}
            />
          ) : (
            <Table
              columns={packageColumns}
              dataSource={vaccinePackages}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              loading={loading}
              scroll={{ x: 1000 }}
              expandable={{
                expandedRowRender,
                rowExpandable: (record) =>
                  record.vaccinePackageItems &&
                  record.vaccinePackageItems.length > 0,
              }}
            />
          )}
        </div>
      </div>

      <Modal
        title="Xác nhận xóa"
        open={isModalVisible}
        onOk={handleDelete}
        onCancel={() => setIsModalVisible(false)}
        okText="Xóa"
        cancelText="Hủy"
      >
        <p>Bạn có chắc chắn muốn xóa gói vaccine này không?</p>
      </Modal>

      <Modal
        title="Tạo gói vaccine mới"
        open={isCreateModalVisible}
        onOk={handleCreatePackage}
        onCancel={() => {
          setIsCreateModalVisible(false);
          setPackageName("");
          setSelectedVaccines([{ vaccineId: "", doseNumber: 1 }]);
        }}
        okText="Tạo"
        cancelText="Hủy"
        className="admin-vaccine-modal"
        style={{ top: '20px' }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ marginBottom: "16px" }}>
          <div style={{ marginBottom: "8px" }}>
            <label style={{ display: "block", marginBottom: "4px" }}>Tên gói:</label>
            <Input
              value={packageName}
              onChange={(e) => setPackageName(e.target.value)}
              placeholder="Nhập tên gói vaccine"
            />
          </div>
        </div>

        {selectedVaccines.map((vaccine, index) => (
          <div key={index} style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "flex-end" }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Vaccine:</label>
                <Select
                  style={{ width: "100%" }}
                  value={vaccine.vaccineId}
                  onChange={(value) => updateVaccineField(index, "vaccineId", value)}
                  placeholder="Chọn vaccine"
                >
                  {vaccines.map((v) => (
                    <Select.Option key={v.id} value={v.id}>
                      <div>
                        <div>{v.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>
                          {v.diseases?.length > 0 ? v.diseases.join(', ') : 'Chưa phân loại'}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              <div style={{ width: "80px" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Số liều:</label>
                <InputNumber
                  min={1}
                  value={vaccine.doseNumber}
                  onChange={(value) => updateVaccineField(index, "doseNumber", value)}
                  placeholder="Số liều"
                  style={{ width: "100%" }}
                />
              </div>
              {selectedVaccines.length > 1 && (
                <Button 
                  onClick={() => removeVaccineField(index)} 
                  danger
                  style={{ marginBottom: "1px" }}
                >
                  Xóa
                </Button>
              )}
            </div>
          </div>
        ))}

        {selectedVaccines.length < 3 && (
          <Button 
            type="dashed" 
            onClick={addVaccineField} 
            block
            style={{ marginTop: "8px" }}
          >
            Thêm vaccine
          </Button>
        )}
      </Modal>

      <Modal
        title="Tạo vaccine mới"
        open={isCreateVaccineModalVisible}
        onOk={handleCreateVaccine}
        onCancel={() => {
          setIsCreateVaccineModalVisible(false);
          setNewVaccine({
            vaccineName: "",
            manufacture: "",
            description: "",
            imageFile: null,
            recAgeStart: "",
            recAgeEnd: "",
            recAgeStartUnit: "month",
            recAgeEndUnit: "month",
            inStockNumber: "",
            price: "",
            displayPrice: "",
            notes: "",
          });
        }}
        okText="Tạo"
        cancelText="Hủy"
        width={800}
        className="admin-vaccine-modal"
        style={{ top: '20px' }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label>Tên vaccine:</label>
            <Input
              value={newVaccine.vaccineName}
              onChange={(e) =>
                setNewVaccine((prev) => ({
                  ...prev,
                  vaccineName: e.target.value,
                }))
              }
              placeholder="Nhập tên vaccine"
            />
          </div>

          <div>
            <label>Nhà sản xuất:</label>
            <Input
              value={newVaccine.manufacture}
              onChange={(e) =>
                setNewVaccine((prev) => ({
                  ...prev,
                  manufacture: e.target.value,
                }))
              }
              placeholder="Nhập tên nhà sản xuất"
            />
          </div>

          <div>
            <label>Mô tả:</label>
            <Input.TextArea
              value={newVaccine.description}
              onChange={(e) =>
                setNewVaccine((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả vaccine"
              rows={4}
            />
          </div>

          <div>
            <label>Hình ảnh:</label>
            <input type="file" onChange={handleImageChange} accept="image/*" />
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi bắt đầu:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <InputNumber
                  min={1}
                  value={newVaccine.recAgeStart}
                  onChange={(value) => handleAgeChange(value, 'recAgeStart')}
                  style={{ width: "70%" }}
                  placeholder="Nhập tuổi bắt đầu"
                />
                <Select
                  value={newVaccine.recAgeStartUnit}
                  onChange={(value) =>
                    setNewVaccine((prev) => ({ ...prev, recAgeStartUnit: value }))
                  }
                  style={{ width: "30%" }}
                >
                  <Select.Option value="month">Tháng</Select.Option>
                  <Select.Option value="year">Năm</Select.Option>
                </Select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi kết thúc:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <InputNumber
                  min={1}
                  value={newVaccine.recAgeEnd}
                  onChange={(value) => handleAgeChange(value, 'recAgeEnd')}
                  style={{ width: "70%" }}
                  placeholder="Nhập tuổi kết thúc"
                />
                <Select
                  value={newVaccine.recAgeEndUnit}
                  onChange={(value) =>
                    setNewVaccine((prev) => ({ ...prev, recAgeEndUnit: value }))
                  }
                  style={{ width: "30%" }}
                >
                  <Select.Option value="month">Tháng</Select.Option>
                  <Select.Option value="year">Năm</Select.Option>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label>Số lượng trong kho:</label>
            <InputNumber
              min={0}
              value={newVaccine.inStockNumber}
              onChange={handleStockChange}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng"
            />
          </div>

          <div>
            <label>Giá:</label>
            <Input
              value={newVaccine.displayPrice}
              onChange={handlePriceChange}
              placeholder="Nhập giá vaccine"
              addonAfter="VNĐ"
            />
          </div>

          <div>
            <label>Ghi chú:</label>
            <Input.TextArea
              value={newVaccine.notes}
              onChange={(e) =>
                setNewVaccine((prev) => ({ ...prev, notes: e.target.value }))
              }
              placeholder="Nhập ghi chú"
              rows={3}
            />
          </div>
        </div>
      </Modal>

      <Modal
        title="Cập nhật vaccine"
        open={isUpdateModalVisible}
        onOk={handleUpdate}
        onCancel={() => {
          setIsUpdateModalVisible(false);
          setVaccineToUpdate(null);
        }}
        okText="Cập nhật"
        cancelText="Hủy"
        width={800}
        className="admin-vaccine-modal"
        style={{ top: '20px' }}
        maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
        bodyStyle={{ padding: '20px' }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label>Tên vaccine:</label>
            <Input
              value={vaccineToUpdate?.vaccineName}
              onChange={(e) =>
                setVaccineToUpdate((prev) => ({
                  ...prev,
                  vaccineName: e.target.value,
                }))
              }
              placeholder="Nhập tên vaccine"
            />
          </div>

          <div>
            <label>Nhà sản xuất:</label>
            <Input
              value={vaccineToUpdate?.manufacture}
              onChange={(e) =>
                setVaccineToUpdate((prev) => ({
                  ...prev,
                  manufacture: e.target.value,
                }))
              }
              placeholder="Nhập tên nhà sản xuất"
            />
          </div>

          <div>
            <label>Mô tả:</label>
            <Input.TextArea
              value={vaccineToUpdate?.description}
              onChange={(e) =>
                setVaccineToUpdate((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Nhập mô tả vaccine"
              rows={4}
            />
          </div>

          <div>
            <label>Hình ảnh:</label>
            {vaccineToUpdate?.currentImageUrl && (
              <div style={{ marginBottom: '10px' }}>
                <Image
                  src={vaccineToUpdate.currentImageUrl}
                  alt="Current vaccine"
                  style={{ width: 100, height: 100, objectFit: "cover" }}
                />
                <p style={{ marginTop: '5px', color: '#666' }}>Hình ảnh hiện tại</p>
              </div>
            )}
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setVaccineToUpdate((prev) => ({
                    ...prev,
                    imageFile: e.target.files[0],
                  }));
                }
              }}
              accept="image/*"
            />
            <p style={{ marginTop: '5px', color: '#666' }}>Chọn hình ảnh mới nếu muốn thay đổi</p>
          </div>

          <div style={{ display: "flex", gap: "16px" }}>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi bắt đầu:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <InputNumber
                  min={1}
                  value={vaccineToUpdate?.recAgeStart}
                  onChange={(value) =>
                    setVaccineToUpdate((prev) => ({
                      ...prev,
                      recAgeStart: value,
                    }))
                  }
                  style={{ width: "70%" }}
                />
                <Select
                  value={vaccineToUpdate?.recAgeStartUnit}
                  onChange={(value) =>
                    setVaccineToUpdate((prev) => ({ ...prev, recAgeStartUnit: value }))
                  }
                  style={{ width: "30%" }}
                >
                  <Select.Option value="month">Tháng</Select.Option>
                  <Select.Option value="year">Năm</Select.Option>
                </Select>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi kết thúc:</label>
              <div style={{ display: "flex", gap: "8px" }}>
                <InputNumber
                  min={1}
                  value={vaccineToUpdate?.recAgeEnd}
                  onChange={(value) =>
                    setVaccineToUpdate((prev) => ({ ...prev, recAgeEnd: value }))
                  }
                  style={{ width: "70%" }}
                />
                <Select
                  value={vaccineToUpdate?.recAgeEndUnit}
                  onChange={(value) =>
                    setVaccineToUpdate((prev) => ({ ...prev, recAgeEndUnit: value }))
                  }
                  style={{ width: "30%" }}
                >
                  <Select.Option value="month">Tháng</Select.Option>
                  <Select.Option value="year">Năm</Select.Option>
                </Select>
              </div>
            </div>
          </div>

          <div>
            <label>Số lượng trong kho:</label>
            <InputNumber
              min={0}
              value={vaccineToUpdate?.inStockNumber}
              onChange={handleUpdateStockChange}
              style={{ width: "100%" }}
              placeholder="Nhập số lượng"
            />
          </div>

          <div>
            <label>Giá:</label>
            <Input
              value={vaccineToUpdate?.displayPrice || formatPrice(vaccineToUpdate?.price)}
              onChange={handleUpdatePriceChange}
              placeholder="Nhập giá vaccine"
              addonAfter="VNĐ"
            />
          </div>

          <div>
            <label>Ghi chú:</label>
            <Input.TextArea
              value={vaccineToUpdate?.notes}
              onChange={(e) =>
                setVaccineToUpdate((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              placeholder="Nhập ghi chú"
              rows={3}
            />
          </div>
        </div>
      </Modal>
    </>
  );
};

export default Vaccine;
