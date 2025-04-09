


import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { List, Avatar, Button, Modal, message } from "antd";
import { ExclamationCircleOutlined } from "@ant-design/icons";
import jwtDecode from "jwt-decode";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import "./ProfileChildPage.css";

const { confirm } = Modal;

const ProfileChildPage = () => {
  const [childrenData, setChildrenData] = useState([]);
  const [error, setError] = useState(null);
  const { token } = useContext(AuthContext);

  useEffect(() => {
    if (!token) {
      setError("Bạn chưa đăng nhập!");
      return;
    }

    let userId;
    try {
      const decoded = jwtDecode(token);
      userId = decoded.Id;
    } catch (err) {
      console.error("❌ Lỗi giải mã token:", err);
      setError("Token không hợp lệ!");
      return;
    }

    const fetchChildren = async () => {
      try {
        const response = await api.get(`/Child/get-all?FilterOn=userId&FilterQuery=${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const childrenArray = response.data.$values || response.data;
        setChildrenData(childrenArray);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu trẻ em:", err);
        setError("Lỗi khi lấy dữ liệu trẻ em.");
      }
    };

    fetchChildren();
  }, [token]);

  const handleDeleteConfirm = (childId) => {
    confirm({
      title: "Bạn có chắc chắn muốn xóa?",
      icon: <ExclamationCircleOutlined />,
      content: "Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: () => handleDeleteProfile(childId),
    });
  };

  const handleDeleteProfile = async (childId) => {
    try {
      await api.delete(`/Child/delete/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildrenData(childrenData.filter((child) => child.id !== childId));
      message.success("🗑️ Xóa hồ sơ thành công!");
    } catch (err) {
      console.error("❌ Lỗi khi xóa hồ sơ trẻ:", err);
      message.error("Không thể xóa hồ sơ trẻ.");
    }
  };

  if (error) {
    return (
      <div className="alert alert-danger">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="HomePage-Allcontainer">
    <div className="HomePage-main-container">
      <div className="container">
        <div className="row">
          <div className="col-12 mt-152 BookingPage-titletitle">
            <div className="BookingPage-heading-protected-together">
              Hồ Sơ trẻ
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="ProfileChildPage-container" style={{ maxWidth: 800, margin: "0 auto", padding: "2rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>🧒 Danh sách hồ sơ trẻ</h2>
      {childrenData.length > 0 ? (
        <List
          itemLayout="horizontal"
          dataSource={childrenData}
          renderItem={(child) => (
            <List.Item
              actions={[
                <Button danger onClick={() => handleDeleteConfirm(child.id)}>
                  Xóa
                </Button>,
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    src={`https://api.dicebear.com/7.x/initials/svg?seed=${child.childrenFullname}`}
                    alt={child.childrenFullname}
                  />
                }
                title={<Link to={`/vaccination/${child.id}`}>{child.childrenFullname}</Link>}
                description={
                  <>
                    <div>🎂 Ngày sinh: {new Date(child.dob).toLocaleDateString("vi-VN")}</div>
                    <div>🚻 Giới tính: {child.gender}</div>
                  </>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <p style={{ textAlign: "center" }}>Không có hồ sơ nào được tạo.</p>
      )}
    </div>
    </div>


  );
};

export default ProfileChildPage;
