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
