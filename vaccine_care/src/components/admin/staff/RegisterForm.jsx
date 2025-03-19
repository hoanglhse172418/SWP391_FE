import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const RegisterForm = ({ isOpen, onClose, type, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            message.success(`Tạo tài khoản ${type === 'doctor' ? 'bác sĩ' : 'nhân viên'} thành công!`);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Validation failed:', error);
            message.error('Vui lòng kiểm tra lại thông tin!');
        }
    };

    return (
        <Modal
            title={`Tạo tài khoản ${type === 'doctor' ? 'bác sĩ' : 'nhân viên'}`}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Tạo"
            cancelText="Hủy"
            className="staff-modal"
            maskStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.45)' }}
            style={{ top: '20px' }}
        >
            <Form
                form={form}
                layout="vertical"
                name="register_form"
            >
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[
                        { required: true, message: 'Vui lòng nhập tên đăng nhập!' },
                        { min: 3, message: 'Tên đăng nhập phải có ít nhất 3 ký tự!' }
                    ]}
                >
                    <Input placeholder="Nhập tên đăng nhập" />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu!' },
                        { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                    ]}
                >
                    <Input.Password placeholder="Nhập mật khẩu" />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                    ]}
                >
                    <Input placeholder="Nhập email" />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RegisterForm; 