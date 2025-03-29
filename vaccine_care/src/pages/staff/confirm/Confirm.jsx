import "./Confirm.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Input, Table, Select, notification } from "antd";
import api from "../../../services/api";

const EditableContext = React.createContext(null);
const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} />
      </EditableContext.Provider>
    </Form>
  );
};
const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  inputType,
  options,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({
        ...record,
        ...values,
      });
    } catch (errInfo) {
      console.log("Save failed:", errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        {inputType === "select" ? (
          <Select ref={inputRef} onBlur={save} onChange={save}>
            {options.map((option) => (
              <Select.Option key={option} value={option}>
                {option}
              </Select.Option>
            ))}
          </Select>
        ) : (
          <Input ref={inputRef} onPressEnter={save} onBlur={save} />
        )}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{ paddingInlineEnd: 24 }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};

const Confirm = ({ record }) => {
  const [dataSource, setDataSource] = useState([]);
  const [listRooms, setListRooms] = useState([]);
  const [listDoctors, setListDoctors] = useState([]);
  const [listVaccines, setListVaccines] = useState([]);
  const [appointmentDetails, setAppointmentDetails] = useState(null);
  const [listPackageVaccines, setListPackageVaccines] = useState([]);

  useEffect(() => {
    api
      .get("/Room/get-all")
      .then((response) => {
        if (response.data && Array.isArray(response.data.$values)) {
          const rooms = response.data.$values.map((room) => ({
            id: room.id,
            name: room.roomNumber,
          }));
          setListRooms(rooms);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching rooms:", error));
  }, []);

  useEffect(() => {
    api
      .get("/User/get-all?PageSize=50")
      .then((response) => {
        if (response.data && Array.isArray(response.data.$values)) {
          const doctors = response.data.$values
            .filter((user) => user.role === "doctor")
            .map((doctor) => ({ id: doctor.id, name: doctor.username }));
          setListDoctors(doctors);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching doctors:", error));
  }, []);

  useEffect(() => {
    api
      .get("/Vaccine/get-all")
      .then((response) => {
        if (response.data && Array.isArray(response.data.$values)) {
          const vaccines = response.data.$values.map((vaccine) => vaccine.name);
          setListVaccines(vaccines);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch((error) => console.error("Error fetching vaccines:", error));
  }, []);

  useEffect(() => {
    console.log("Record ID:", record?.id);
    if (record?.id) {
      api
        .get(`/Appointment/get-by-id/${record.id}`)
        .then((response) => {
          setAppointmentDetails(response.data);
        })
        .catch((error) =>
          console.error("Error fetching appointment details:", error)
        );
    }
  }, [record]);

  useEffect(() => {
    if (appointmentDetails?.vaccinePackageId) {
      api
        .get(`/VaccinePackage/get-by-id/${appointmentDetails.vaccinePackageId}`)
        .then((response) => {
          if (response.data && response.data.vaccinePackageItems?.$values) {
            const packageVaccines =
              response.data.vaccinePackageItems.$values.map((item) => ({
                id: item.vaccine.id,
                name: item.vaccine.name,
              }));
            setListPackageVaccines(packageVaccines);
          } else {
            console.error("Invalid API response format:", response.data);
          }
        })
        .catch((error) =>
          console.error("Error fetching package vaccines:", error)
        );
    }
  }, [appointmentDetails]);

  useEffect(() => {
    if (appointmentDetails) {
      const roomName =
        listRooms.find((room) => room.id === appointmentDetails.roomId)?.name ||
        "N/A";
      const doctorName =
        listDoctors.find((doctor) => doctor.id === appointmentDetails.doctorId)
          ?.name || "N/A";
      const date = new Date(appointmentDetails.dateInjection);
      setDataSource([
        {
          key: appointmentDetails.id,
          name: appointmentDetails.childFullName,
          date: date.toLocaleDateString("vi-VN"),
          vaccine: appointmentDetails.vaccineName || "N/A",
          type_vaccine:
            appointmentDetails.vaccineType === "Single" ? "Lẻ" : "Gói",
          doctor: doctorName,
          room: roomName,
          vaccinePackageName: appointmentDetails.vaccinePackageName,
          vaccinePackageId: appointmentDetails.vaccinePackageId,
        },
      ]);
    }
  }, [appointmentDetails, listRooms, listDoctors]);

  const hasVaccinePackage = dataSource.some(
    (item) => item.type_vaccine === "Gói"
  );

  const defaultColumns = [
    {
      title: "Tên bé",
      dataIndex: "name",
      width: "15%",
    },
    {
      title: "Ngày tiêm",
      dataIndex: "date",
      width: "15%",
    },
    {
      title: "Vắc xin",
      dataIndex: "vaccine",
      width: "23%",
      editable: true,
      inputType: "select",
      // options: listVaccines,
      options: dataSource.some((item) => item.type_vaccine === "Gói")
        ? listPackageVaccines.map((v) => v.name) // Nếu là Gói -> chỉ hiển thị vaccine trong gói
        : listVaccines,
    },
    {
      title: "Loại",
      dataIndex: "type_vaccine",
      width: "10%",
    },
    hasVaccinePackage && {
      title: "Tên gói",
      dataIndex: "vaccinePackageName",
      width: "20%",
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      width: "15%",
      editable: true,
      inputType: "select",
      options: listDoctors.map((doctor) => doctor.name),
    },
    {
      title: "Phòng",
      dataIndex: "room",
      width: "15%",
      editable: true,
      inputType: "select",
      options: listRooms.map((room) => room.name),
    },
  ].filter(Boolean);

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];

    // Tự động cập nhật vaccineId và vaccineType nếu đã có dữ liệu trước đó
    const selectedVaccine = dataSource.some(
      (item) => item.type_vaccine === "Gói"
    )
      ? listPackageVaccines.find((v) => v.name === row.vaccine) // Tìm vaccine trong gói
      : listVaccines.find((v) => v === row.vaccine); // Tìm vaccine lẻ

    newData.splice(index, 1, {
      ...item,
      ...row,
      vaccineId: selectedVaccine ? selectedVaccine.id : null,
    });
    setDataSource(newData);
  };

  const handleConfirm = () => {
    if (dataSource.length === 0) return;

    const appointment = dataSource[0]; // Lấy dữ liệu từ bảng

    const doctorObj = listDoctors.find((d) => d.name === appointment.doctor);
    const roomObj = listRooms.find((r) => r.name === appointment.room);

    // Kiểm tra nếu chưa chọn bác sĩ hoặc phòng
  if (!doctorObj) {
    notification.error({
      message: "Vui lòng chọn bác sĩ trước khi xác nhận.",
    });
    return;
  }

  if (!roomObj) {
    notification.error({
      message: "Vui lòng chọn số phòng trước khi xác nhận.",
    });
    return;
  }

    const payload = {
      vaccineId: appointment.vaccineId,
      doctorId: doctorObj.id, // Lấy ID của bác sĩ
      roomId: roomObj.id, // Lấy ID của phòng
    };

    api
      .put(
        `/Appointment/update-status-by-staff/confirm-info?id=${appointment.key}`,
        payload
      )
      .then(() => {
        notification.success({
          message: "Xác nhận thành công",
          description: "Thông tin tiêm chủng đã được cập nhật.",
        });
      })
      .catch((error) => {
        notification.error({
          message: "Xác nhận thất bại",
          description: error.response?.data || "Có lỗi xảy ra khi cập nhật.",
        });
      });
  };

  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell,
    },
  };

  const columns = defaultColumns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave,
        inputType: col.inputType || "text",
        options: col.options || [],
      }),
    };
  });
  return (
    <div className="confirm">
      <h3>Xác nhận mũi tiêm</h3>
      <Table
        components={components}
        rowClassName={() => "editable-row"}
        bordered
        dataSource={dataSource}
        columns={columns}
        pagination={false}
      />
      <button onClick={handleConfirm} className="confirm-button">
        Xác nhận
      </button>
    </div>
  );
};

export default Confirm;
