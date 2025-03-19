import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const RegisterForm = ({ isOpen, onClose, type, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            message.success(`${type === 'doctor' ? 'Bác sĩ' : 'Nhân viên'} đã được tạo thành công`);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Error creating account:', error);
            message.error('Đã xảy ra lỗi khi tạo tài khoản');
        }
    };

    return (
        <Modal
            title={`Tạo tài khoản ${type === 'doctor' ? 'Bác sĩ' : 'Nhân viên'}`}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Tạo"
            cancelText="Hủy"
            style={{ 
                top: '20%',
                transform: 'translateY(-20%)'
            }}
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="username"
                    label="Tên đăng nhập"
                    rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Mật khẩu"
                    rules={[{ required: true, message: 'Vui lòng nhập mật khẩu' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không hợp lệ' }
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RegisterForm; 