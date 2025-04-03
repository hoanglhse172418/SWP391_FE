import React, { useEffect, useState, useContext } from "react";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import jwtDecode from "jwt-decode";
import { Card, Descriptions, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { Pie, Column } from "@ant-design/plots";

function ProfilePage() {
  const { token } = useContext(AuthContext);
  const [user, setUser] = useState(null);
  const [children, setChildren] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      return;
    }

    const fetchData = async () => {
      try {
        const decoded = jwtDecode(token);
        const userId = decoded.Id;

        const [userRes, childRes, appointRes] = await Promise.all([
          api.get(`/User/get/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/Child/get-all?FilterOn=userId&FilterQuery=${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          api.get(`/Appointment/customer-appointments`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setUser(userRes.data);
        setChildren(childRes.data["$values"] || []);

        const single = appointRes.data.singleVaccineAppointments?.$values || [];
        const packageAppointments = appointRes.data.packageVaccineAppointments?.$values || [];
        const packageItems = packageAppointments.flatMap(p => p.vaccineItems?.$values || []);
        const allAppointments = [...single, ...packageItems];

        setAppointments(allAppointments);
      } catch (err) {
        console.error("❌ Lỗi khi fetch dữ liệu:", err);
        setError("Không thể tải dữ liệu. Vui lòng thử lại!");
      }
    };

    fetchData();
  }, [token]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!user) {
    return <div>Đang tải dữ liệu người dùng...</div>;
  }

  // === Chart 1: Gender Pie Chart ===
  const genderCount = children.reduce((acc, child) => {
    acc[child.gender] = (acc[child.gender] || 0) + 1;
    return acc;
  }, {});
  const genderData = Object.entries(genderCount).map(([type, value]) => ({
    type,
    value,
  }));
  const genderPieConfig = {
    appendPadding: 10,
    data: genderData,
    angleField: "value",
    colorField: "type",
    radius: 1,
    label: {
      type: "outer",
      content: "{name} ({percentage})",
    },
    interactions: [{ type: "element-active" }],
  };

  // === Chart 2: Appointment Column Chart ===
  const statusCount = appointments.reduce((acc, appt) => {
    acc[appt.status] = (acc[appt.status] || 0) + 1;
    return acc;
  }, {});
  const statusData = Object.entries(statusCount).map(([type, value]) => ({
    type,
    value,
  }));
  const appointmentColumnConfig = {
    data: statusData,
    xField: "type",
    yField: "value",
    label: { position: "middle" },
    xAxis: { label: { autoHide: true, autoRotate: false } },
    meta: {
      type: { alias: "Trạng thái" },
      value: { alias: "Số lượng" },
    },
  };

  return (
    <div className="container mt-5">
      <Card
        title={
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Avatar size="large" icon={<UserOutlined />} />
            <span>Thông tin cá nhân</span>
          </div>
        }
        bordered={false}
        style={{
          marginBottom: 32,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <Descriptions column={1} labelStyle={{ fontWeight: 600 }}>
          <Descriptions.Item label="ID">{user.id}</Descriptions.Item>
          <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
          <Descriptions.Item label="Role">{user.role}</Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(user.createdAt).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {new Date(user.updatedAt).toLocaleString()}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card
        title="Thông tin trẻ và lịch tiêm"
        bordered={false}
        style={{
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          borderRadius: 12,
        }}
      >
        <p><strong>Tổng số trẻ:</strong> {children.length}</p>
        <div className="row">
          <div className="col-md-6">
            <Pie {...genderPieConfig} />
          </div>
          <div className="col-md-6">
            <Column {...appointmentColumnConfig} />
          </div>
        </div>
      </Card>
    </div>
  );
}

export default ProfilePage;
