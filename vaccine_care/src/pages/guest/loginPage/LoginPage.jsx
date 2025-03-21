import React, { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../../services/api"; // Import API dùng chung
import { AuthContext } from "../../../context/AuthContext";
import "./LoginPage.css";
import "bootstrap/dist/css/bootstrap.min.css";
import Phone from "../../../assets/Login/Tabpanel.png";
import jwtDecode from "jwt-decode"; 
function LoginPage() {
  const { login } = useContext(AuthContext); 
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const loginUser = async (userData) => {
    try {
      // console.log("🔹 Gửi dữ liệu đăng nhập:", userData);
      const response = await api.post("/User/login", userData);
      
      // console.log("✅ Phản hồi từ API:", response.data); 
  
      return response.data; 
    } catch (error) {
      console.error("❌ Lỗi đăng nhập:", error);
  
      if (error.response) {
        // console.error("🔹 Response Data:", error.response.data);
        // console.error("🔹 Status Code:", error.response.status);
        // console.error("🔹 Headers:", error.response.headers);
  
        throw new Error(error.response.data.message || `Lỗi ${error.response.status}: Đăng nhập thất bại!`);
      } else if (error.request) {
        // console.error("❌ Không nhận được phản hồi từ API:", error.request);
        throw new Error("Máy chủ không phản hồi, vui lòng kiểm tra kết nối mạng.");
      } else {
        // console.error("❌ Lỗi khi gửi yêu cầu:", error.message);
        throw new Error("Lỗi không xác định, vui lòng thử lại!");
      }
    }
  };
  

  // const handleLogin = async () => {
  //   setError(null);
  //   console.log("🔹 Dữ liệu gửi lên API:", formData);
  
  //   // Kiểm tra tài khoản cứng trước khi gọi API
  //   const hardcodedAccounts = {
  //     admin: "/admin",
  //     staff: "/staff/injection-in",
  //     doctor: "/doctor/injection-in",
  //   };
  
  //   if (hardcodedAccounts[formData.email] && formData.password === "123") {
  //     console.log(`🔹 Đăng nhập với ${formData.email} cục bộ, không gọi API`);
  //     navigate(hardcodedAccounts[formData.email]);
  //     return;
  //   }
  
  //   // Nếu không phải tài khoản cứng, gọi API đăng nhập
  //   try {
  //     const data = await loginUser(formData);
  //     console.log("✅ Phản hồi từ API:", data);
  
  //     if (typeof data === "string" && data.startsWith("ey")) {
  //       console.log("✅ Token hợp lệ:", data);
  //       login(data); // Lưu token vào context/localStorage
  //       navigate("/"); // Điều hướng sau khi đăng nhập thành công
  //     } else {
  //       console.error("❌ Token không hợp lệ:", data);
  //       throw new Error("API không trả về token hợp lệ.");
  //     }
  //   } catch (err) {
  //     console.error("❌ Lỗi đăng nhập:", err.message);
  //     setError(err.message);
  //   }
  // };
  
  const handleLogin = async () => {
    setError(null);
    // console.log("🔹 Dữ liệu gửi lên API:", formData);

    try {
      const token = await loginUser(formData);
      // console.log("✅ Token nhận được từ API:", token);

      if (typeof token === "string" && token.startsWith("ey")) {
        // console.log("✅ Token hợp lệ:", token);
        login(token); // Lưu token vào context/localStorage

        // Giải mã token để lấy thông tin user
        const decodedToken = jwtDecode(token);
        // console.log("✅ Dữ liệu giải mã từ token:", decodedToken);

        // Lấy role từ token (chú ý key role có dạng URL)
        const userRole = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        // console.log("🔹 Vai trò của user:", userRole);

        if (!userRole) {
          throw new Error("Không tìm thấy role trong token!");
        }

        // Điều hướng dựa trên role
        const rolePaths = {
          admin: "/admin",
          staff: "/staff/injection-in",
          doctor: "/doctor/injection-in",
          user: "/",
        };

        const redirectPath = rolePaths[userRole] || "/";
        // console.log(`➡️ Điều hướng đến: ${redirectPath}`);
        navigate(redirectPath);
      } else {
        // console.error("❌ Token không hợp lệ:", token);
        throw new Error("API không trả về token hợp lệ.");
      }
    } catch (err) {
      // console.error("❌ Lỗi đăng nhập:", err.message);
      setError(err.message);
    }
  };
  

  return (
    <div className="HomePage-Allcontainer">
      <div className="HomePage-main-container">
        <div className="flex-column-eb"></div>
        <div className="container mt-5">
          <div className="row mt-152">
            <div className="col-6">
              <div className="Regis-from">
                <div className="Regis-title">Mời bạn đăng nhập:</div>
                <div className="Regis-input">
                  <div className="Regis-info">Email:</div>
                  <input
                    type="email"
                    name="email"
                    className="Regis-single-input"
                    placeholder="Nhập email của bạn"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="Regis-input">
                  <div className="Regis-info">Mật khẩu:</div>
                  <input
                    type="password"
                    name="password"
                    className="Regis-single-input"
                    placeholder="Nhập mật khẩu"
                    value={formData.password}
                    onChange={handleChange}
                  />
                </div>
                <div className="Regis-input">
                  <button className="Regis-button mt-4" onClick={handleLogin}>
                    Đăng nhập
                  </button>
                </div>
                <div className="Regis-input">
                  <div className="Login-flex">
                    <Link to='/forgotpass' className="Login-text">Bạn quên mật khẩu?</Link>
                    <a href="/register" className="Login-text">
                      Đăng ký tài khoản
                    </a>
                  </div>
                </div>
                {error && <p className="Regis-error text-danger">{error}</p>}
              </div>
            </div>

            <div className="col-6 Regis-kkk">
              <div className="Regis-introContainer">
                <img src={Phone} className="Regis-icon" alt="intro" />
                <div className="Regis-intro">
                  "Chào mừng bạn đến với hệ thống tiêm chủng! Hãy đăng nhập để
                  theo dõi lịch tiêm chủng và bảo vệ sức khỏe của con yêu."
                </div>
                <div className="Regis-intro-khangdoan">-Khang Đoàn-</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
