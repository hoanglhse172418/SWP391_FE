import React, { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../../../src/context/AuthContext"; 
import { Link, useNavigate } from "react-router-dom";
import "./HeaderGuest.css";
import logo_vaccine from '../../../assets/logo_vaccine.png';
import Searchicon from '../../../assets/header/Search-icon.png';
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js"; 
import { FaBars, FaTimes } from "react-icons/fa";
import api from "../../../services/api";

const HeaderGuest = () => {
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { isLoggedIn, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();
  console.log("📌 Role của user trong HeaderGuest:", user?.role);
  const toggleDrawer = () => {
    setDrawerOpen(!isDrawerOpen);
  };

  const handleLogout = async () => {
    try {
      console.log("🔹 Đang gửi yêu cầu đăng xuất...");
      const token = localStorage.getItem("access_token");
      if (!token) {
        console.warn("⚠️ Không tìm thấy token, tiến hành đăng xuất cục bộ.");
        logout();
        navigate("/");
        return;
      }

      console.log("✅ Đăng xuất thành công từ API.");
      logout();
      navigate("/");
    } catch (error) {
      console.error("❌ Lỗi khi đăng xuất:", error);
      logout();
      navigate("/");
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth >= 1024) {
        setDrawerOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header>
      <div className="Header-main-container">
        <div className="Header-iconContainer">
          <div className="Header-symbol-1" />
          <div className="Header-symbol-2" />
          <div className="Header-symbol-3" />
          <div className="Header-symbol-4" />
        </div>
        <div className="Header-localtion">
          <span className="Header-dai-hoc-fpt-quan">Đại Học FPT Quận 9</span>
          <span className="Header-phone-number">0374277590</span>
        </div>
      </div>

      <div className="header-content mx-auto flex items-center justify-between">
        <div className="header-logo flex items-center space-x-3">
          <img src={logo_vaccine} alt="Vaxi Logo" className="w-10 h-10" />
        </div>

        {!isMobile && (
          <nav className="header-navigation desktop-menu">
            <Link to="/" className="Header-text">Trang chủ</Link>
            <Link to="/Aboutus" className="Header-text hover:underline">Giới thiệu</Link>
            <Link to="/priceVaccine" className="Header-text hover:underline">Bảng giá</Link>
            <Link to="/camNang" className="Header-text hover:underline">Cẩm nang</Link>
            <Link to="/newlist" className="Header-text hover:underline">Tin tức</Link>
            {isLoggedIn && user?.role === "user" && (
              <div className="HeaderG-flex2">
                <Link to="/profilechild" className="Header-text hover:underline">Hồ sơ trẻ</Link>
                <Link to="/bill" className="Header-text hover:underline">Hóa đơn</Link>
              </div>
            )}
          </nav>
        )}

        {isMobile && (
          <button onClick={toggleDrawer} className="text-3xl text-gray-700">
            {isDrawerOpen ? <FaTimes /> : <FaBars />}
          </button>
        )}

        <div className="header-right-side flex items-center space-x-4">
          <div className="header-search relative">
            <img src={Searchicon} alt="Search" className="w-10 h-10" />
          </div>
          {isLoggedIn ? (
            <div className="header-flex">
              {user?.role === "user" && (
                <Link to='/createchild' className="header-createChild">
                  Tạo Hồ sơ 
                </Link>
              )}
              <div className="dropdown">
                <i className="bi bi-gear-fill header-settings-icon header-logout-icon"
                  id="settingsDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ fontSize: "24px", cursor: "pointer" }}>
                </i>
                <ul className="dropdown-menu" aria-labelledby="settingsDropdown">
                  <div className="kfadsjlkfsajdlfsd">
                    <i className="bi bi-person-heart "></i>
                    <li><a className="dropdown-item" href="/in4">Tài khoản</a></li>
                  </div>
                  <div className="kfadsjlkfsajdlfsd">
                    <i className="bi bi-cash-stack "></i>
                    <li><a className="dropdown-item" href="/transaction">Giao dịch</a></li>
                  </div>
                  <div className="kfadsjlkfsajdlfsd">
                    <i className="bi bi-calendar-event "></i>
                    <li><a className="dropdown-item" href="/vaccinationScheduleStatus">Lịch hẹn</a></li>
                  </div>
                  <div className="kfadsjlkfsajdlfsd">
                    <i className="bi bi-box-arrow-in-right " onClick={handleLogout}></i>
                    <li><a className="dropdown-item" onClick={handleLogout}>Đăng xuất</a></li>
                  </div>
                </ul>
              </div>
            </div>
          ) : (
            <>
              <Link to="/register" className="header-register">Đăng ký</Link>
              <Link to="/login" className="header-login">Đăng nhập</Link>
            </>
          )}
        </div>
      </div>

      {isMobile && (
        <div className={`drawer ${isDrawerOpen ? "open" : ""}`}>
          <nav className="drawer-navigation">
            <Link to="/" className="drawer-link" onClick={toggleDrawer}>Trang chủ</Link>
            <Link to="/Aboutus" className="drawer-link" onClick={toggleDrawer}>Giới thiệu</Link>
            <Link to="/priceVaccine" className="drawer-link" onClick={toggleDrawer}>Bảng giá</Link>
            <Link to="/camNang" className="drawer-link" onClick={toggleDrawer}>Cẩm nang</Link>
            {isLoggedIn && user?.role === "user" && (
              <>
                <Link to="/profilechild" className="drawer-link" onClick={toggleDrawer}>Hồ sơ trẻ</Link>
                <Link to="/bill" className="drawer-link" onClick={toggleDrawer}>Hóa đơn</Link>
              </>
            )}
            {isLoggedIn ? (
              <button className="drawer-link text-red-600" onClick={handleLogout}>Đăng xuất</button>
            ) : (
              <>
                <Link to="/register" className="drawer-link" onClick={toggleDrawer}>Đăng ký</Link>
                <Link to="/login" className="drawer-link" onClick={toggleDrawer}>Đăng nhập</Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};

export default HeaderGuest;
