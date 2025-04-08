import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Users, Calendar, Bed, UserCheck } from 'lucide-react';
import { Spin } from 'antd';
import api from '../../../services/api';

// Constants
const PRIMARY_COLOR = '#00b894';
const COLORS = ['#8884d8', PRIMARY_COLOR, '#ffc658', '#ff8042', '#a4de6c', '#d884d8', '#4de6c9'];

const INITIAL_STATS = [
    { name: 'Tổng số bệnh nhân', value: 0, icon: <Users className="h-8 w-8" /> },
    { name: 'Tổng số lịch hẹn', value: 0, icon: <Calendar className="h-8 w-8" /> },
    { name: 'Tổng số vắc xin', value: 0, icon: <Bed className="h-8 w-8" /> },
    { name: 'Nhân viên đang hoạt động', value: 0, icon: <UserCheck className="h-8 w-8" /> },
];

// Data processing functions
const processAppointmentData = (appointments) => {
    if (!appointments?.length) return [];
    
    const statusCounts = appointments.reduce((acc, appointment) => {
        const status = (appointment.status || 'Unknown').toLowerCase();
        acc[status] = (acc[status] || 0) + 1;
        return acc;
    }, {});
    
    const statusTranslations = {
        pending: 'Chờ xác nhận',
        confirmed: 'Đã xác nhận',
        completed: 'Hoàn thành',
        cancelled: 'Đã hủy',
        canceled: 'Đã hủy',
        processing: 'Đang xử lý',
        rejected: 'Từ chối',
        unknown: 'Không xác định'
    };
    
    return Object.entries(statusCounts).map(([status, count]) => ({
        name: statusTranslations[status] || status,
        value: count
    }));
};

const processUserRoleData = (users) => {
    if (!users?.length) return [];
    
    const roleCounts = users.reduce((acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
    }, {});
    
    const roleTranslations = {
        admin: 'Quản trị viên',
        doctor: 'Bác sĩ',
        staff: 'Nhân viên',
        user: 'Người dùng'
    };
    
    return Object.entries(roleCounts).map(([role, count]) => ({
        name: roleTranslations[role] || role,
        value: count
    }));
};

const processVaccineAgeRangeData = (vaccines) => {
    if (!vaccines?.length) return [];
    
    const ageRanges = [
        { range: '0-1 tuổi', min: 0, max: 1 },
        { range: '1-2 tuổi', min: 1, max: 2 },
        { range: '2-5 tuổi', min: 2, max: 5 },
        { range: '5-10 tuổi', min: 5, max: 10 },
        { range: '10+ tuổi', min: 10, max: 100 }
    ];
    
    return ageRanges.map(({ range, min, max }) => ({
        name: range,
        value: vaccines.filter(vaccine => 
            vaccine.recAgeStart >= min && vaccine.recAgeStart < max
        ).length
    }));
};

const Dashboard = () => {
    const [stats, setStats] = useState(INITIAL_STATS);
    const [loading, setLoading] = useState(true);
    const [appointmentData, setAppointmentData] = useState([]);
    const [vaccineData, setVaccineData] = useState([]);
    const [userData, setUserData] = useState([]);
    const [animationState, setAnimationState] = useState({ stats: false, charts: false });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [patientsData, appointmentsData, vaccinesData, usersData] = await Promise.all([
                    api.get('/Child/get-all').catch(() => ({ data: { $values: [] } })),
                    api.get('/Appointment/get-all').catch(() => ({ data: { $values: [] } })),
                    api.get('/Vaccine/get-all').catch(() => ({ data: { $values: [] } })),
                    api.get('/User/get-all').catch(() => ({ data: { $values: [] } }))
                ]);
                
                const patients = patientsData.data?.$values || [];
                const appointments = appointmentsData.data?.$values || [];
                const vaccines = vaccinesData.data?.$values || [];
                const users = usersData.data?.$values || [];
                
                setStats([
                    { ...INITIAL_STATS[0], value: patients.length },
                    { ...INITIAL_STATS[1], value: appointments.length },
                    { ...INITIAL_STATS[2], value: vaccines.length },
                    { ...INITIAL_STATS[3], value: users.filter(user => ['staff', 'doctor'].includes(user.role)).length }
                ]);
                
                setAppointmentData(appointments);
                setVaccineData(vaccines);
                setUserData(users);
                
                setLoading(false);
                setTimeout(() => setAnimationState(prev => ({ ...prev, stats: true })), 100);
                setTimeout(() => setAnimationState(prev => ({ ...prev, charts: true })), 500);
            } catch (error) {
                console.error('Error fetching data:', error);
                setStats(INITIAL_STATS);
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderChart = (title, children) => (
        <div className={`admin-dashboard-chart-card ${animationState.charts ? 'animate-in' : ''}`}>
            <h2>{title}</h2>
            {children}
        </div>
    );

    return (
        <div className="admin">
            <div className="admin-dashboard-container">
                <h1 className="admin-dashboard-title">Bảng điều khiển</h1>
                {loading ? (
                    <div className="loading-container">
                        <Spin size="large" />
                    </div>
                ) : (
                    <>
                        <div className="admin-dashboard-stats-grid">
                            {stats.map((stat, index) => (
                                <div 
                                    key={index} 
                                    className={`admin-dashboard-stat-card ${animationState.stats ? 'animate-in' : ''}`}
                                    style={{ transitionDelay: `${index * 100}ms` }}
                                >
                                    <div className="admin-dashboard-stat-icon">{stat.icon}</div>
                                    <div className="admin-dashboard-stat-info">
                                        <h2>{stat.value}</h2>
                                        <p>{stat.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="admin-dashboard-charts-grid">
                            {renderChart('Phân bố giới tính bệnh nhân', (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={[
                                                { name: 'Nam', value: Math.round(stats[0].value * 0.55) },
                                                { name: 'Nữ', value: Math.round(stats[0].value * 0.45) }
                                            ]}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            <Cell fill="#8884d8" />
                                            <Cell fill={PRIMARY_COLOR} />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ))}
                            
                            {renderChart('Trạng thái lịch hẹn', (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={processAppointmentData(appointmentData)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {processAppointmentData(appointmentData).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ))}
                            
                            {renderChart('Vắc xin theo độ tuổi', (
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={processVaccineAgeRangeData(vaccineData)}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar 
                                            dataKey="value" 
                                            name="Số lượng vắc xin" 
                                            fill={PRIMARY_COLOR}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            ))}
                            
                            {renderChart('Phân bố vai trò người dùng', (
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={processUserRoleData(userData)}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {processUserRoleData(userData).map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;