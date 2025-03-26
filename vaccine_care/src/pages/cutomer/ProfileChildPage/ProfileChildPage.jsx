import React, { useState, useEffect, useContext } from "react";
import { Link } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import "./ProfileChildPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import tiemle from "../../../assets/HomePage/tiemle.png";
import tiemtheogoi from "../../../assets/HomePage/tiemtheogoi.png";
import tuvanmuitiem from "../../../assets/HomePage/tuvanmuitiem.png";
import api from "../../../services/api";
import { AuthContext } from "../../../context/AuthContext";
import jwtDecode from "jwt-decode";

function ProfileChildPage() {
  const [childrenData, setChildrenData] = useState([]);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
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
      // console.log("User ID from token:", userId);
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
  
        const childrenArray = response.data.$values ? response.data.$values : response.data;
        // console.log("Tất cả hồ sơ trẻ:", childrenArray);
        setChildrenData(childrenArray);
      } catch (err) {
        console.error("❌ Lỗi khi lấy dữ liệu trẻ em:", err);
        setError("Lỗi khi lấy dữ liệu trẻ em.");
      }
    };
  
    fetchChildren();
  }, [token]);

  const handleDeleteConfirm = (childId) => {
    setConfirmDelete(childId);
  };

  const handleDeleteProfile = async (childId) => {
    try {
      await api.delete(`/Child/delete/${childId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setChildrenData(childrenData.filter(child => child.id !== childId));
      setConfirmDelete(null);
    } catch (err) {
      console.error("❌ Lỗi khi xóa hồ sơ trẻ:", err);
      setError("Không thể xóa hồ sơ trẻ.");
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

      <div className="BookingPage-container">
        <div className="container">
          <div className="row">
            <div className="col-12">
              {childrenData.length > 0 ? (
                childrenData.map((child) => (
                  <div key={child.id} className="Footer-input mt-4">
                    <div className="adow">
                      <div className="ProfileChildPage-single-input">
                        <div className="ProfileChildPage-flex">
                          <Link to={`/vaccination/${child.id}`} className="ProfileChildPage-text">
                            {child.childrenFullname}
                          </Link>
                          <button className="btn btn-danger ms-3" onClick={() => handleDeleteConfirm(child.id)}>
                            Xóa
                          </button>
                        </div>               
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>Không có hồ sơ nào được tạo.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* React-Bootstrap Modal for delete confirmation */}
      <Modal show={confirmDelete !== null} onHide={() => setConfirmDelete(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Xác nhận xóa</Modal.Title>
        </Modal.Header>
        <Modal.Body>Bạn có chắc muốn xóa hồ sơ này không?</Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
            No
          </Button>
          <Button variant="danger" onClick={() => handleDeleteProfile(confirmDelete)}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default ProfileChildPage;
