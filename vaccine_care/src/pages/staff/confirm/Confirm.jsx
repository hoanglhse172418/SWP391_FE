import "./Confirm.css";
import React, { useContext, useEffect, useRef, useState } from "react";
import { Form, Input, Table, Select } from "antd";
import axios from "axios";

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

  useEffect(() => {
    axios.get("https://vaccinecare.azurewebsites.net/api/Room/get-all")
      .then(response => {
        console.log("List room:", response.data);
        if (response.data && Array.isArray(response.data.$values)) {
          const rooms = response.data.$values.map(room => ({
            id: room.id,
            name: room.roomNumber,
          }));
          setListRooms(rooms);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch(error => console.error("Error fetching rooms:", error));
  }, []);

  useEffect(() => {
    axios.get("https://vaccinecare.azurewebsites.net/api/User/get-all")
      .then(response => {
        console.log("List doctors:", response.data);
        if (response.data && Array.isArray(response.data.$values)) {
          const doctors = response.data.$values.filter(user => user.role === "doctor")
            .map(doctor => doctor.username);
          setListDoctors(doctors);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch(error => console.error("Error fetching doctors:", error));
  }, []);

  useEffect(() => {
    axios.get("https://vaccinecare.azurewebsites.net/api/Vaccine/get-all")
      .then(response => {
        console.log("List vaccines:", response.data);
        if (response.data && Array.isArray(response.data.$values)) {
          const vaccines = response.data.$values.map(vaccine => vaccine.name);
          setListVaccines(vaccines);
        } else {
          console.error("Invalid API response format:", response.data);
        }
      })
      .catch(error => console.error("Error fetching vaccines:", error));
  }, []);

  useEffect(() => {
    if (record?.id) {
      axios.get(`https://vaccinecare.azurewebsites.net/api/Appointment/get-by-id/${record.id}`)
        .then(response => {
          setAppointmentDetails(response.data);
        })
        .catch(error => console.error("Error fetching appointment details:", error));
    }
  }, [record]);

  useEffect(() => {
    if (appointmentDetails) {
      const roomName = listRooms.find(room => room.id === appointmentDetails.roomId)?.name || "N/A";
      setDataSource([
        {
          key: appointmentDetails.id,
          name: appointmentDetails.childFullName,
          date: appointmentDetails.dateInjection.split("T")[0],
          vaccine: appointmentDetails.vaccineName || "N/A",
          type_vaccine: appointmentDetails.vaccineType === "Single" ? "Lẻ" : "Gói",
          doctor: appointmentDetails.doctorId || "N/A",
          room: roomName,
        },
      ]);
    }
  }, [appointmentDetails, listRooms]);



  const typeVaccine = ["Lẻ", "Gói"];


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
      width: "15%",
      editable: true,
      inputType: "select",
      options: listVaccines,
    },
    {
      title: "Loại",
      dataIndex: "type_vaccine",
      with: "10%",
      editable: true,
      inputType: "select",
      options: typeVaccine,
    },
    {
      title: "Bác sĩ",
      dataIndex: "doctor",
      with: "15%",
      editable: true,
      inputType: "select",
      options: listDoctors,
    },
    {
      title: "Phòng",
      dataIndex: "room",
      with: "15%",
      editable: true,
      inputType: "select",
      options: listRooms.map(room => room.name),
    },
  ];

  const handleSave = (row) => {
    const newData = [...dataSource];
    const index = newData.findIndex((item) => row.key === item.key);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    setDataSource(newData);
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
    </div>
  );
};

export default Confirm;
