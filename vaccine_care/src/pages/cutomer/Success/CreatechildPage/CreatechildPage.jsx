// import React, { useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
// import "./CreatechildPage.css";
// import api from '../../../../services/api';
// import { AuthContext } from '../../../../context/AuthContext';
// import jwtDecode from "jwt-decode";

// function CreatechildPage() {
//   // States for child and family info
//   const [childrenFullName, setChildrenFullName] = useState("");
//   const [dob, setDob] = useState("");
//   const [motherFullName, setMotherFullName] = useState("");
//   const [fatherFullName, setFatherFullName] = useState("");
//   const [phonemom, setPhonemom] = useState("");
//   const [phonedad, setPhonedad] = useState("");
//   const [gender, setGender] = useState("Nam");
//   const [province, setProvince] = useState("");
//   const [district, setDistrict] = useState("");
//   const [ward, setWard] = useState("");
//   const [street, setStreet] = useState("");
//   const [errorMessage, setErrorMessage] = useState("");

//   const navigate = useNavigate();
//   const { token } = useContext(AuthContext);


//   const getMaxDate = () => {
//     const today = new Date();
//     return today.toISOString().split("T")[0];
//   };
  
//   const getMinDate = () => {
//     const minDate = new Date();
//     minDate.setMonth(minDate.getMonth() - 12);
//     return minDate.toISOString().split("T")[0];
//   };
  
//   // Decode token to extract userId
//   let userId = 0;
//   if (token) {
//     try {
//       const decoded = jwtDecode(token);
//       userId = decoded.Id; // Ensure this matches your JWT payload property name.
//       console.log("User ID from token:", userId);
//     } catch (err) {
//       console.error("❌ Lỗi giải mã token:", err);
//     }
//   }
//   const handleCreateChild = async () => {
//     setErrorMessage(""); // Reset error
  
//     // Validate required fields
//     if (!childrenFullName || !dob || !motherFullName || !fatherFullName || !phonemom || !phonedad || !province || !district || !ward || !street) {
//       setErrorMessage("Vui lòng điền đầy đủ thông tin.");
//       return;
//     }
  
//     // Validate dob in range 0-12 months
//     const birthDate = new Date(dob);
//     const today = new Date();
//     const twelveMonthsAgo = new Date();
//     twelveMonthsAgo.setMonth(today.getMonth() - 12);
//     if (birthDate < twelveMonthsAgo || birthDate > today) {
//       setErrorMessage("Ngày sinh phải nằm trong khoảng 0-12 tháng tuổi.");
//       return;
//     }
  
//     const address = `${province}, ${district}, ${ward}, ${street}`;
//     const payload = {
//       userId: userId || 0,
//       childrenFullname: childrenFullName,
//       dob: new Date(dob).toISOString(),
//       gender: gender,
//       fatherFullName: fatherFullName,
//       motherFullName: motherFullName,
//       fatherPhoneNumber: phonedad,
//       motherPhoneNumber: phonemom,
//       address: address,
//       vaccinationDetails: [
//         {
//           id: 0,
//           diseaseId: null,
//           vaccineId: null,
//           expectedInjectionDate: new Date().toISOString(),
//           actualInjectionDate: new Date().toISOString()
//         }
//       ]
//     };
  
//     try {
//       console.log("Sending child profile data:", JSON.stringify(payload, null, 2));
//       const response = await api.post("/Child/create", payload, {
//         headers: {
//           "accept": "*/*",
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`
//         }
//       });
//       console.log("API response:", response.data);
//       navigate("/successbaby");
//     } catch (err) {
//       console.error("Error creating child profile:", err);
//       setErrorMessage(err.response?.data?.message || "Đã xảy ra lỗi khi tạo hồ sơ trẻ.");
//     }
//   };
  
//   // const handleCreateChild = async () => {
//   //   setErrorMessage(""); // Reset error message

//   //   if (!childrenFullName || !dob || !motherFullName || !fatherFullName || !phonemom || !phonedad || !province || !district || !ward || !street) {
//   //     setErrorMessage("Vui lòng điền đầy đủ thông tin.");
//   //     return;
//   //   }
  
//   //   const address = `${province}, ${district}, ${ward}, ${street}`;
  
//   //   const payload = {
//   //     userId: userId || 0,
//   //     childrenFullname: childrenFullName,
//   //     dob: new Date(dob).toISOString(),
//   //     gender: gender,
//   //     fatherFullName: fatherFullName,
//   //     motherFullName: motherFullName,
//   //     fatherPhoneNumber: phonedad,
//   //     motherPhoneNumber: phonemom,
//   //     address: address,
//   //     vaccinationDetails: [
//   //       {
//   //         id: 0,
//   //         diseaseId: null, 
//   //         vaccineId: null, 
//   //         expectedInjectionDate: new Date().toISOString(),
//   //         actualInjectionDate: new Date().toISOString()
//   //       }
//   //     ]
//   //   };
  
//   //   try {
//   //     console.log("Sending child profile data:", JSON.stringify(payload, null, 2));
//   //     const response = await api.post("/Child/create", payload, {
//   //       headers: {
//   //         "accept": "*/*",
//   //         "Content-Type": "application/json",
//   //         Authorization: `Bearer ${token}`
//   //       }
//   //     });
//   //     console.log("API response:", response.data);
//   //     navigate("/successbaby");
//   //   } catch (err) {
//   //     console.error("Error creating child profile:", err);
//   //     setErrorMessage(err.response?.data?.message || "Đã xảy ra lỗi khi tạo hồ sơ trẻ.");
//   //   }
//   // };
//   return (
//     <div className='CreatechildPage-container'>
//       <div className='CreatechildPage-From'>
//         <div className='SuccessRegis-title'>Tạo hồ sơ trẻ em</div>
//         <div className='CreatechildPage-content-kk'>
//           <div className='CreatechildPage-content'>
//             <div className='CreatechildPage-Name'>Tên của bé:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Name of child'
//               value={childrenFullName}
//               onChange={(e) => setChildrenFullName(e.target.value)}
//             />
//           </div>
//           <div className='CreatechildPage-content'>
//             <div className='CreatechildPage-Name'>Ngày tháng năm sinh:</div>
//             {/* <input
//               type="date"
//               className='CreatechildPage-input'
//               value={dob}
//               onChange={(e) => setDob(e.target.value)}
//             /> */}
// <input
//   type="date"
//   className='CreatechildPage-input'
//   value={dob}
//   min={getMinDate()} // 12 tháng trước
//   max={getMaxDate()} // hôm nay
//   onChange={(e) => setDob(e.target.value)}
// />

// {errorMessage && (
//   <div style={{ color: "red", marginTop: "10px" }}>
//     {errorMessage}
//   </div>
// )}


//           </div>
//         </div>
//         <div className='CreatechildPage-content-kk'>
//           <div className='CreatechildPage-content'>
//             <div className='CreatechildPage-Name'>Họ tên mẹ:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Name of mother'
//               value={motherFullName}
//               onChange={(e) => setMotherFullName(e.target.value)}
//             />
//           </div>
//           <div className='CreatechildPage-content'>
//             <div className='CreatechildPage-Name'>Họ tên cha:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Name of dad'
//               value={fatherFullName}
//               onChange={(e) => setFatherFullName(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className='CreatechildPage-content-kk'>
//         <div className='CreatechildPage-content'>
//           <div className='CreatechildPage-Name'>Số điện thoại mẹ:</div>
//           <input
//             className='CreatechildPage-input'
//             placeholder='Phone number'
//             value={phonemom}
//             onChange={(e) => setPhonemom(e.target.value)}
//           />
//         </div>
//         <div className='CreatechildPage-content'>
//           <div className='CreatechildPage-Name'>Số điện thoại ba:</div>
//           <input
//             className='CreatechildPage-input'
//             placeholder='Phone number'
//             value={phonedad}
//             onChange={(e) => setPhonedad(e.target.value)}
//           />
//         </div>

//         </div>

//         <div className='CreatechildPage-content'>
//           <div className='CreatechildPage-Name'>Giới tính:</div>
//           <div className="CreatechildPage-custom-select">
//             <span
//               className={`CreatechildPage-custom-option ${gender === "Nam" ? "selected" : ""}`}
//               onClick={() => setGender("Nam")}
//             >
//               Nam
//             </span>
//             <span
//               className={`CreatechildPage-custom-option ${gender === "Nữ" ? "selected" : ""}`}
//               onClick={() => setGender("Nữ")}
//             >
//               Nữ
//             </span>
//           </div>
//         </div>
//         <div className='CreatechildPage-content-kk'>
//           <div className='CreatechildPage-address'>
//             <div className='CreatechildPage-Name'>Tỉnh thành:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Input address'
//               value={province}
//               onChange={(e) => setProvince(e.target.value)}
//             />
//           </div>
//           <div className='CreatechildPage-address'>
//             <div className='CreatechildPage-Name'>Quận huyện:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Input address'
//               value={district}
//               onChange={(e) => setDistrict(e.target.value)}
//             />
//           </div>
//         </div>
//         <div className='CreatechildPage-content-kk'>
//           <div className='CreatechildPage-address'>
//             <div className='CreatechildPage-Name'>Phường xã:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Input address'
//               value={ward}
//               onChange={(e) => setWard(e.target.value)}
//             />
//           </div>
//           <div className='CreatechildPage-address'>
//             <div className='CreatechildPage-Name'>Số nhà, tên đường:</div>
//             <input
//               className='CreatechildPage-input'
//               placeholder='Street, House number'
//               value={street}
//               onChange={(e) => setStreet(e.target.value)}
//             />
//           </div>
//         </div>
//       </div>
//       <div className='CreatechildPage-title'>
//         <div className='SuccessRegis-title'>Chăm sóc từng mũi tiêm trọn vẹn</div>
//         <div className='CreatechildPage-button' onClick={handleCreateChild}>
//           Tạo
//         </div>
//       </div>
//     </div>
//   );
// }

// export default CreatechildPage;
import React, { useState, useContext } from 'react';
import { Form, Input, DatePicker, Select, Row, Col, Button, Typography, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import api from '../../../../services/api';
import { AuthContext } from '../../../../context/AuthContext';
import jwtDecode from "jwt-decode";
import './CreatechildPage.css';

const { Title } = Typography;
const { Option } = Select;

function CreatechildPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { token } = useContext(AuthContext);

  let userId = 0;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId = decoded.Id;
    } catch (err) {
      console.error("❌ Lỗi giải mã token:", err);
    }
  }

  const getMinDate = () => dayjs().subtract(12, 'month');
  const getMaxDate = () => dayjs();

  const onFinish = async (values) => {
    const dob = values.dob.toISOString();
    const address = `${values.province}, ${values.district}, ${values.ward}, ${values.street}`;

    const payload = {
      userId: userId || 0,
      childrenFullname: values.childrenFullname,
      dob,
      gender: values.gender,
      fatherFullName: values.fatherFullName,
      motherFullName: values.motherFullName,
      fatherPhoneNumber: values.fatherPhoneNumber,
      motherPhoneNumber: values.motherPhoneNumber,
      address,
      vaccinationDetails: [
        {
          id: 0,
          diseaseId: null,
          vaccineId: null,
          expectedInjectionDate: new Date().toISOString(),
          actualInjectionDate: new Date().toISOString()
        }
      ]
    };

    try {
      await api.post("/Child/create", payload, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });
      message.success("🎉 Tạo hồ sơ thành công!");
      navigate("/successbaby");
    } catch (error) {
      console.error("Lỗi khi tạo hồ sơ:", error);
      message.error(error.response?.data?.message || "Đã xảy ra lỗi!");
    }
  };

  return (
    <div className="CreatechildPage-container">
      <Title level={2} style={{ textAlign: 'center', marginBottom: 24 }}>🍼 Tạo hồ sơ trẻ em</Title>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ gender: 'Nam' }}
      >
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tên của bé" name="childrenFullname" rules={[{ required: true }]}>
              <Input placeholder="Tên của bé" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày sinh"
              name="dob"
              rules={[{ required: true, message: "Vui lòng chọn ngày sinh!" }]}
            >
              <DatePicker
                format="DD/MM/YYYY"
                style={{ width: '100%' }}
                disabledDate={(current) =>
                  current < getMinDate() || current > getMaxDate()
                }
                placeholder="Chọn ngày sinh"
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Họ tên mẹ" name="motherFullName" rules={[{ required: true }]}>
              <Input placeholder="Tên mẹ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Họ tên cha" name="fatherFullName" rules={[{ required: true }]}>
              <Input placeholder="Tên cha" />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="SĐT mẹ" name="motherPhoneNumber" rules={[{ required: true }]}>
              <Input placeholder="SĐT mẹ" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="SĐT cha" name="fatherPhoneNumber" rules={[{ required: true }]}>
              <Input placeholder="SĐT cha" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item label="Giới tính" name="gender" rules={[{ required: true }]}>
          <Select>
            <Option value="Nam">Nam</Option>
            <Option value="Nữ">Nữ</Option>
          </Select>
        </Form.Item>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Tỉnh/Thành phố" name="province" rules={[{ required: true }]}>
              <Input placeholder="Tỉnh/TP" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Quận/Huyện" name="district" rules={[{ required: true }]}>
              <Input placeholder="Quận/Huyện" />
            </Form.Item>
          </Col>
        </Row>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item label="Phường/Xã" name="ward" rules={[{ required: true }]}>
              <Input placeholder="Phường/Xã" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item label="Số nhà, đường" name="street" rules={[{ required: true }]}>
              <Input placeholder="Số nhà, đường" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item>
          <Button type="primary" htmlType="submit" block size="large">
            🚀 Tạo hồ sơ
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
}

export default CreatechildPage;
