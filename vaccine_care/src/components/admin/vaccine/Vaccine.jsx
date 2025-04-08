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
  Space,
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
    { vaccineId: "", doseNumber: 1, diseaseId: "" },
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
    inStockNumber: "",
    price: "",
    displayPrice: "",
    notes: "",
    diseaseIds: [],
  });
  const [isUpdateModalVisible, setIsUpdateModalVisible] = useState(false);
  const [vaccineToUpdate, setVaccineToUpdate] = useState(null);
  const [vaccineDetails, setVaccineDetails] = useState({});
  const [isDeleteVaccineModalVisible, setIsDeleteVaccineModalVisible] = useState(false);
  const [vaccineToDelete, setVaccineToDelete] = useState(null);

  const getAllVaccines = () => api.get("/Vaccine/get-all");
  const getAllVaccinePackages = () => api.get("/VaccinePackage/get-all");
  const getAllDiseases = () => api.get("/Disease/get-all?PageSize=100");

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

      const diseasesList = diseasesResponse.data.$values.map(disease => ({
        id: disease.id,
        name: disease.name
      }));
      setDiseases(diseasesList);

      // Process vaccines
      const formattedVaccines = [];
      
      // Create a map of id to vaccine for resolving references
      const vaccineReferences = {};
      vaccinesResponse.data.$values.forEach(vaccine => {
        if (vaccine.$id) {
          vaccineReferences[vaccine.$id] = vaccine;
        }
      });
      
      for (const vaccine of vaccinesResponse.data.$values) {
        // Skip processing if this is just a reference (has only $ref property)
        if (vaccine.$ref && !vaccine.id) {
          continue;
        }
        
        // Lấy thông tin bệnh cho mỗi vaccine
        let vaccineDiseasesInfo = [];
        
        // Lấy danh sách bệnh từ vaccine.diseases nếu có
        if (vaccine.diseases?.$values && vaccine.diseases.$values.length > 0) {
          vaccineDiseasesInfo = vaccine.diseases.$values.map(disease => ({
            id: disease.id,
            name: disease.name
          }));
        } else {
          // Nếu không có trong response ban đầu, nếu như vaccine này có diseaseIds, thì tìm trong diseasesList
          try {
            if (vaccine.diseaseIds?.$values && vaccine.diseaseIds.$values.length > 0) {
              const diseaseIds = vaccine.diseaseIds.$values;
              vaccineDiseasesInfo = diseasesList.filter(d => diseaseIds.includes(d.id));
            }
          } catch (error) {
            console.error(`Error extracting disease IDs for vaccine ${vaccine.id}:`, error);
          }
        }

        console.log(`Vaccine ${vaccine.id} - ${vaccine.name}, Diseases:`, 
          vaccineDiseasesInfo.length > 0 ? 
          vaccineDiseasesInfo.map(d => d.name).join(', ') : 
          'Không có dữ liệu bệnh'
        );

        formattedVaccines.push({
          id: vaccine.id,
          name: vaccine.name,
          manufacture: vaccine.manufacture,
          description: vaccine.description,
          imageUrl: vaccine.imageUrl,
          inStockNumber: vaccine.inStockNumber,
          price: vaccine.price,
          displayPrice: formatPrice(vaccine.price),
          recAgeStart: vaccine.recAgeStart,
          recAgeEnd: vaccine.recAgeEnd,
          status: vaccine.inStockNumber > 0 ? "Còn hàng" : "Hết hàng",
          diseases: vaccineDiseasesInfo.map(d => d.name),
          diseaseIds: vaccineDiseasesInfo.map(d => d.id)
        });
      }

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
      defaultSortOrder: 'ascend',
      sorter: (a, b) => a.id - b.id
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
      render: (price) => formatPrice(price),
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
      render: (diseases) => {
        if (!diseases || diseases.length === 0) {
          return <Tag color="default">Chưa phân loại</Tag>;
        }
        
        // Generate the full list of diseases for tooltip
        const allDiseases = diseases.join(', ');
        
        // Show first 2 diseases and +X more if there are more
        return (
          <Tooltip
            title={allDiseases}
            placement="topLeft"
            styles={{ root: { maxWidth: "400px" } }}
          >
            <div className="disease-tags-container">
              {diseases.slice(0, 2).map((disease, index) => (
                <Tag key={index} color="blue" style={{ margin: '2px' }}>
                  {disease}
                </Tag>
              ))}
              {diseases.length > 2 && (
                <Tag color="blue" style={{ margin: '2px' }}>
                  +{diseases.length - 2} loại bệnh khác
                </Tag>
              )}
            </div>
          </Tooltip>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      width: 200,
      render: (_, record) => (
        <Space size="middle">
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
                currentImageUrl: record.imageUrl,
                diseaseIds: record.diseaseIds
              });
              setIsUpdateModalVisible(true);
            }}
          >
            Cập nhật
          </Button>
          <Button
            type="primary"
            danger
            onClick={() => {
              setVaccineToDelete(record);
              setIsDeleteVaccineModalVisible(true);
            }}
          >
            Xóa
          </Button>
        </Space>
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
        title: "Phòng bệnh",
        dataIndex: "diseases",
        key: "diseases",
        width: 200,
        render: (diseases) => {
          if (!diseases || diseases.length === 0) {
            return <Tag color="default">Chưa phân loại</Tag>;
          }
          
          // Generate the full list of diseases for tooltip
          const allDiseases = diseases.join(', ');
          
          // Show first 2 diseases and +X more if there are more
          return (
            <Tooltip
              title={allDiseases}
              placement="topLeft"
              styles={{ root: { maxWidth: "400px" } }}
            >
              <div className="disease-tags-container">
                {diseases.slice(0, 2).map((disease, index) => (
                  <Tag key={index} color="blue" style={{ margin: '2px' }}>
                    {disease}
                  </Tag>
                ))}
                {diseases.length > 2 && (
                  <Tag color="blue" style={{ margin: '2px' }}>
                    +{diseases.length - 2} loại bệnh khác
                  </Tag>
                )}
              </div>
            </Tooltip>
          );
        },
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

    // Map vaccine details to include diseases
    const vaccineItemsWithDiseases = record.vaccinePackageItems.map(item => {
      const vaccineDetails = vaccines.find(v => v.id === item.vaccineId);
      let vaccineDiseasesInfo = [];
      
      if (vaccineDetails) {
        // Lấy danh sách bệnh từ vaccine.diseases nếu có
        if (vaccineDetails.diseases && vaccineDetails.diseases.length > 0) {
          vaccineDiseasesInfo = vaccineDetails.diseases;
        }
      }

      return {
        ...item,
        diseases: vaccineDiseasesInfo
      };
    });

    return (
      <Table
        columns={vaccineColumns}
        dataSource={vaccineItemsWithDiseases}
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
        (v) => v.vaccineId && v.vaccineId !== ""
      );
      if (validVaccines.length === 0) {
        message.error("Vui lòng chọn ít nhất một vaccine");
        return;
      }

      // Kiểm tra trùng lặp bệnh
      const selectedDiseases = validVaccines.map(v => v.diseaseId);
      const uniqueDiseases = new Set(selectedDiseases);
      if (selectedDiseases.length !== uniqueDiseases.size) {
        message.error("Không được chọn trùng lặp bệnh trong gói vaccine");
        return;
      }

      // Kiểm tra trùng lặp vaccine
      const selectedVaccineIds = validVaccines.map(v => v.vaccineId);
      const uniqueVaccines = new Set(selectedVaccineIds);
      if (selectedVaccineIds.length !== uniqueVaccines.size) {
        message.error("Không được chọn trùng lặp vaccine trong gói vaccine");
        return;
      }

      const payload = {
        name: packageName.trim(),
        vaccinePackageItems: selectedVaccines
          .filter((v) => v.vaccineId && v.vaccineId !== "")
          .map((item) => ({
            vaccineId: Number(item.vaccineId),
            doseNumber: 1, // Cố định số liều là 1
          })),
      };

      await api.post("/VaccinePackage/create", payload);
      message.success("Tạo gói vaccine thành công");
      setIsCreateModalVisible(false);
      setPackageName("");
      setSelectedVaccines([{ vaccineId: "", doseNumber: 1, diseaseId: "" }]);
      fetchVaccinePackages();
    } catch (error) {
      console.error("Error creating vaccine package:", error);
      message.error("Đã xảy ra lỗi khi tạo gói vaccine");
    }
  };

  const addVaccineField = () => {
    if (selectedVaccines.length < 3) {
      // Thêm một vaccine mới với giá trị mặc định
      const newVaccine = { vaccineId: "", doseNumber: 1, diseaseId: "" };
      setSelectedVaccines([...selectedVaccines, newVaccine]);
    }
  };

  const removeVaccineField = (index) => {
    setSelectedVaccines(prevVaccines => prevVaccines.filter((_, i) => i !== index));
  };

  const updateVaccineField = (index, field, value) => {
    const newVaccines = [...selectedVaccines];

    // Kiểm tra trùng lặp bệnh khi chọn bệnh mới
    if (field === 'diseaseId' && value) {
      const isDiseaseSelected = selectedVaccines.some(
        (v, i) => i !== index && v.diseaseId === value
      );
      if (isDiseaseSelected) {
        message.error("Bệnh này đã được chọn trong gói vaccine");
        return;
      }
    }

    // Kiểm tra trùng lặp vaccine khi chọn vaccine mới
    if (field === 'vaccineId' && value) {
      const isVaccineSelected = selectedVaccines.some(
        (v, i) => i !== index && v.vaccineId === value
      );
      if (isVaccineSelected) {
        message.error("Vaccine này đã được chọn trong gói vaccine");
        return;
      }
    }

    // Cập nhật giá trị mới
    newVaccines[index] = {
      ...newVaccines[index],
      [field]: value,
    };

    // Reset vaccineId khi thay đổi bệnh
    if (field === 'diseaseId') {
      newVaccines[index].vaccineId = "";
    }

    setSelectedVaccines(newVaccines);
  };

  // Lọc vaccine theo bệnh đã chọn
  const getVaccinesByDiseaseId = (diseaseId) => {
    if (!diseaseId) return [];
    return vaccines.filter(vaccine => 
      vaccine.diseaseIds && vaccine.diseaseIds.includes(Number(diseaseId))
    );
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
      if (!newVaccine.diseaseIds || newVaccine.diseaseIds.length === 0) {
        message.error("Vui lòng chọn ít nhất một bệnh");
        return;
      }

      const formData = new FormData();
      formData.append("VaccineName", newVaccine.vaccineName);
      formData.append("Manufacture", newVaccine.manufacture);
      formData.append("Description", newVaccine.description);
      formData.append("ImageFile", newVaccine.imageFile);
      formData.append("RecAgeStart", newVaccine.recAgeStart);
      formData.append("RecAgeEnd", newVaccine.recAgeEnd);
      formData.append("InStockNumber", newVaccine.inStockNumber);
      formData.append("Price", newVaccine.price);
      formData.append("Notes", newVaccine.notes);

      // Thêm DiseaseIds vào formData
      if (newVaccine.diseaseIds && newVaccine.diseaseIds.length > 0) {
        newVaccine.diseaseIds.forEach((id, index) => {
          formData.append(`DiseaseIds[${index}]`, id);
        });
      }

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
        inStockNumber: "",
        price: "",
        displayPrice: "",
        notes: "",
        diseaseIds: [],
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
      console.log("Updating vaccine with disease IDs:", vaccineToUpdate.diseaseIds);
      
      const formData = new FormData();
      formData.append("VaccineName", vaccineToUpdate.vaccineName);
      formData.append("Manufacture", vaccineToUpdate.manufacture);
      formData.append("Description", vaccineToUpdate.description);
      
      if (vaccineToUpdate.imageFile) {
        formData.append("ImageFile", vaccineToUpdate.imageFile);
      } else {
        const response = await fetch(vaccineToUpdate.currentImageUrl);
        const blob = await response.blob();
        formData.append("ImageFile", blob, "current-image.jpg");
      }

      formData.append("RecAgeStart", vaccineToUpdate.recAgeStart || 0);
      formData.append("RecAgeEnd", vaccineToUpdate.recAgeEnd || 0);
      formData.append("InStockNumber", vaccineToUpdate.inStockNumber);
      formData.append("Price", vaccineToUpdate.price);
      formData.append("Notes", vaccineToUpdate.notes || "");
      
      // Thêm DiseaseIds vào formData
      if (vaccineToUpdate.diseaseIds && vaccineToUpdate.diseaseIds.length > 0) {
        vaccineToUpdate.diseaseIds.forEach((id, index) => {
          formData.append(`DiseaseIds[${index}]`, id);
        });
      }

      await api.put(`/Vaccine/update/${vaccineToUpdate.id}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      message.success("Vaccine đã được cập nhật thành công");
      setIsUpdateModalVisible(false);
      await fetchVaccinesAndDiseases(); // Thêm await để đảm bảo dữ liệu được cập nhật
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
      displayPrice: formatPrice(numericValue)
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

  const handleDeleteVaccine = async () => {
    try {
      await api.delete(`/Vaccine/delete/${vaccineToDelete.id}`);
      message.success("Xóa vaccine thành công");
      setIsDeleteVaccineModalVisible(false);
      setVaccineToDelete(null);
      await fetchVaccinesAndDiseases();
    } catch (error) {
      console.error("Error deleting vaccine:", error);
      message.error("Có lỗi xảy ra khi xóa vaccine");
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
          setSelectedVaccines([{ vaccineId: "", doseNumber: 1, diseaseId: "" }]);
        }}
        okText="Tạo"
        cancelText="Hủy"
        className="admin-vaccine-modal"
        style={{ top: '20px' }}
        width={620}
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
          <div key={index} style={{ marginBottom: "20px" }}>
            <div style={{ display: "flex", gap: "12px", alignItems: "flex-end" }}>
              <div style={{ width: "35%" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Chọn bệnh:</label>
                <Select
                  style={{ width: "100%" }}
                  value={vaccine.diseaseId}
                  onChange={(value) => updateVaccineField(index, "diseaseId", value)}
                  placeholder="Chọn loại bệnh"
                  listHeight={250}
                >
                  {diseases.map((disease) => (
                    <Select.Option key={disease.id} value={disease.id}>
                      {disease.name}
                    </Select.Option>
                  ))}
                </Select>
              </div>
              
              <div style={{ width: "35%" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Vaccine:</label>
                <Select
                  style={{ width: "100%" }}
                  value={vaccine.vaccineId}
                  onChange={(value) => updateVaccineField(index, "vaccineId", value)}
                  placeholder="Chọn vaccine"
                  optionLabelProp="label"
                  listHeight={250}
                  disabled={!vaccine.diseaseId}
                  dropdownMatchSelectWidth={false}
                  dropdownStyle={{ minWidth: '300px' }}
                >
                  {getVaccinesByDiseaseId(vaccine.diseaseId).map((v) => (
                    <Select.Option 
                      key={v.id} 
                      value={v.id} 
                      label={v.name}
                    >
                      <div style={{ padding: '4px 0' }}>
                        <div style={{ fontWeight: 500 }}>{v.name}</div>
                        <div style={{ fontSize: '12px', color: '#666', maxWidth: '280px', whiteSpace: 'normal' }}>
                          {v.manufacture}
                        </div>
                      </div>
                    </Select.Option>
                  ))}
                </Select>
              </div>
              
              <div style={{ width: "15%" }}>
                <label style={{ display: "block", marginBottom: "4px" }}>Số liều:</label>
                <div
                  style={{
                    padding: "4px 11px",
                    border: "1px solid #d9d9d9",
                    borderRadius: "6px",
                    backgroundColor: "#f5f5f5",
                    textAlign: "center",
                    color: "#000000d9",
                    fontSize: "14px",
                    lineHeight: "22px",
                    height: "32px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  1
                </div>
              </div>
              
              {selectedVaccines.length > 1 && (
                <div>
                  <Button 
                    onClick={() => removeVaccineField(index)} 
                    danger
                    icon={<span role="img" aria-label="delete" className="anticon anticon-delete">
                      <svg viewBox="64 64 896 896" focusable="false" data-icon="delete" width="1em" height="1em" fill="currentColor" aria-hidden="true">
                        <path d="M360 184h-8c4.4 0 8-3.6 8-8v8h304v-8c0 4.4 3.6 8 8 8h-8v72h72v-80c0-35.3-28.7-64-64-64H352c-35.3 0-64 28.7-64 64v80h72v-72zm504 72H160c-17.7 0-32 14.3-32 32v32c0 4.4 3.6 8 8 8h60.4l24.7 523c1.6 34.1 29.8 61 63.9 61h454c34.2 0 62.3-26.8 63.9-61l24.7-523H888c4.4 0 8-3.6 8-8v-32c0-17.7-14.3-32-32-32zM731.3 840H292.7l-24.2-512h487l-24.2 512z"></path>
                      </svg>
                    </span>}
                    style={{ 
                      width: 'auto', 
                      minWidth: 'auto',
                      border: 'none', 
                      background: 'transparent',
                      fontSize: '16px'
                    }}
                  />
                </div>
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
            inStockNumber: "",
            price: "",
            displayPrice: "",
            notes: "",
            diseaseIds: [],
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
              <label>Độ tuổi bắt đầu (tháng):</label>
              <InputNumber
                min={1}
                value={newVaccine.recAgeStart}
                onChange={(value) => handleAgeChange(value, 'recAgeStart')}
                style={{ width: "100%" }}
                placeholder="Nhập số tháng tuổi bắt đầu"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi kết thúc (tháng):</label>
              <InputNumber
                min={1}
                value={newVaccine.recAgeEnd}
                onChange={(value) => handleAgeChange(value, 'recAgeEnd')}
                style={{ width: "100%" }}
                placeholder="Nhập số tháng tuổi kết thúc"
              />
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

          <div>
            <label>Phòng ngừa bệnh:</label>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn các bệnh"
              value={newVaccine.diseaseIds}
              onChange={(value) =>
                setNewVaccine((prev) => ({
                  ...prev,
                  diseaseIds: value,
                }))
              }
              optionFilterProp="children"
            >
              {diseases.map((disease) => (
                <Select.Option key={disease.id} value={disease.id}>
                  {disease.name}
                </Select.Option>
              ))}
            </Select>
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
              <label>Độ tuổi bắt đầu (tháng):</label>
              <InputNumber
                min={1}
                value={vaccineToUpdate?.recAgeStart}
                onChange={(value) =>
                  setVaccineToUpdate((prev) => ({
                    ...prev,
                    recAgeStart: value,
                  }))
                }
                style={{ width: "100%" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label>Độ tuổi kết thúc (tháng):</label>
              <InputNumber
                min={1}
                value={vaccineToUpdate?.recAgeEnd}
                onChange={(value) =>
                  setVaccineToUpdate((prev) => ({ ...prev, recAgeEnd: value }))
                }
                style={{ width: "100%" }}
              />
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

          <div>
            <label>Phòng ngừa bệnh:</label>
            <Select
              mode="multiple"
              style={{ width: '100%' }}
              placeholder="Chọn các bệnh"
              value={vaccineToUpdate?.diseaseIds || []}
              onChange={(value) =>
                setVaccineToUpdate((prev) => ({
                  ...prev,
                  diseaseIds: value,
                }))
              }
              optionFilterProp="children"
            >
              {diseases.map((disease) => (
                <Select.Option key={disease.id} value={disease.id}>
                  {disease.name}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </Modal>

      <Modal
        title="Xác nhận xóa"
        open={isDeleteVaccineModalVisible}
        onOk={handleDeleteVaccine}
        onCancel={() => {
          setIsDeleteVaccineModalVisible(false);
          setVaccineToDelete(null);
        }}
        okText="Xóa"
        cancelText="Hủy"
        okButtonProps={{ danger: true }}
      >
        <p>Bạn có chắc chắn muốn xóa vaccine "{vaccineToDelete?.name}" không?</p>
        <p style={{ color: '#ff4d4f' }}>Lưu ý: Hành động này không thể hoàn tác!</p>
      </Modal>
    </>
  );
};

export default Vaccine;
