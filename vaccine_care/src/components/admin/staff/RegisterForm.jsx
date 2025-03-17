import React from 'react';
import { Modal, Form, Input, message } from 'antd';

const RegisterForm = ({ isOpen, onClose, type, onSubmit }) => {
    const [form] = Form.useForm();

    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            await onSubmit(values);
            message.success(`${type === 'doctor' ? 'Doctor' : 'Staff'} account created successfully`);
            form.resetFields();
            onClose();
        } catch (error) {
            console.error('Error creating account:', error);
            message.error('An error occurred while creating the account');
        }
    };

    return (
        <Modal
            title={`Create ${type === 'doctor' ? 'Doctor' : 'Staff'} Account`}
            open={isOpen}
            onOk={handleSubmit}
            onCancel={onClose}
            okText="Create"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
            >
                <Form.Item
                    name="username"
                    label="Username"
                    rules={[{ required: true, message: 'Please enter username' }]}
                >
                    <Input />
                </Form.Item>

                <Form.Item
                    name="password"
                    label="Password"
                    rules={[{ required: true, message: 'Please enter password' }]}
                >
                    <Input.Password />
                </Form.Item>

                <Form.Item
                    name="email"
                    label="Email"
                    rules={[
                        { required: true, message: 'Please enter email' },
                        { type: 'email', message: 'Invalid email format' }
                    ]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default RegisterForm; 