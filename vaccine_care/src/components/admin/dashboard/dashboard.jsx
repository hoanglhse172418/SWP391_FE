import React, { useState, useEffect } from 'react';
import './dashboard.css';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';
import { Users, Calendar, Bed, UserCheck } from 'lucide-react';
import { Spin } from 'antd';
import apiService, { endpoints } from '../../../services/api';

const Dashboard = () => {
    // Primary color to match sidebar
    const PRIMARY_COLOR = '#00b894'; // This should match your sidebar color
    
    const [stats, setStats] = useState([
        { name: 'Tổng số bệnh nhân', value: 0, icon: <Users className="h-8 w-8" /> },
        { name: 'Lịch hẹn hôm nay', value: 0, icon: <Calendar className="h-8 w-8" /> },
        { name: 'Tổng số vắc xin', value: 0, icon: <Bed className="h-8 w-8" /> },
        { name: 'Nhân viên trực', value: 0, icon: <UserCheck className="h-8 w-8" /> },
    ]);
    const [loading, setLoading] = useState(true);
    const [appointmentData, setAppointmentData] = useState([]);
    const [vaccineData, setVaccineData] = useState([]);
    const [userData, setUserData] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch all data in parallel
                const [patientsData, appointmentsData, vaccinesData, usersData] = await Promise.all([
                    apiService.get(endpoints.getChildren, { PageSize: 35 }),
                    apiService.get(endpoints.getTodayAppointments),
                    apiService.get(endpoints.getVaccines, { PageSize: 35 }),
                    apiService.get(endpoints.getUsers, { PageSize: 35 })
                ]);
                
                // Process patients data
                if (patientsData && patientsData.$values) {
                    const totalPatients = patientsData.$values.length;
                    setStats(prevStats => {
                        const newStats = [...prevStats];
                        newStats[0] = { ...newStats[0], value: totalPatients };
                        return newStats;
                    });
                }
                
                // Process appointments data
                if (appointmentsData && appointmentsData.$values) {
                    const appointments = appointmentsData.$values;
                    setStats(prevStats => {
                        const newStats = [...prevStats];
                        newStats[1] = { ...newStats[1], value: appointments.length };
                        return newStats;
                    });
                    setAppointmentData(appointments);
                }
                
                // Process vaccines data
                if (vaccinesData && vaccinesData.$values) {
                    const vaccines = vaccinesData.$values;
                    setStats(prevStats => {
                        const newStats = [...prevStats];
                        newStats[2] = { ...newStats[2], value: vaccines.length };
                        return newStats;
                    });
                    setVaccineData(vaccines);
                }
                
                // Process users data
                if (usersData && usersData.$values) {
                    const users = usersData.$values;
                    const staffCount = users.filter(
                        user => user.role === 'staff' || user.role === 'doctor'
                    ).length;
                    setStats(prevStats => {
                        const newStats = [...prevStats];
                        newStats[3] = { ...newStats[3], value: staffCount };
                        return newStats;
                    });
                    setUserData(users);
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Process appointment data for charts
    const getAppointmentStatusData = () => {
        if (!appointmentData.length) return [];
        
        const statusCounts = appointmentData.reduce((acc, appointment) => {
            const status = appointment.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(statusCounts).map(status => ({
            name: status === 'Completed' ? 'Hoàn thành' : 
                  status === 'Processing' ? 'Đang xử lý' : status,
            value: statusCounts[status]
        }));
    };
    
    // Process user data for charts
    const getUserRoleData = () => {
        if (!userData.length) return [];
        
        const roleCounts = userData.reduce((acc, user) => {
            const role = user.role;
            acc[role] = (acc[role] || 0) + 1;
            return acc;
        }, {});
        
        return Object.keys(roleCounts).map(role => ({
            name: role === 'admin' ? 'Quản trị viên' : 
                  role === 'doctor' ? 'Bác sĩ' : 
                  role === 'staff' ? 'Nhân viên' : 
                  role === 'user' ? 'Người dùng' : role,
            value: roleCounts[role]
        }));
    };
    
    // Process vaccine data for charts
    const getVaccineAgeRangeData = () => {
        if (!vaccineData.length) return [];
        
        // Group vaccines by age range
        const ageRanges = [
            { range: '0-1 tuổi', min: 0, max: 1 },
            { range: '1-2 tuổi', min: 1, max: 2 },
            { range: '2-5 tuổi', min: 2, max: 5 },
            { range: '5-10 tuổi', min: 5, max: 10 },
            { range: '10+ tuổi', min: 10, max: 100 }
        ];
        
        const ageRangeCounts = ageRanges.map(range => {
            const count = vaccineData.filter(vaccine => 
                vaccine.recAgeStart >= range.min && vaccine.recAgeStart < range.max
            ).length;
            
            return {
                name: range.range,
                value: count
            };
        });
        
        return ageRangeCounts;
    };

    // Colors for charts
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#a4de6c', '#d884d8', '#4de6c9'];

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
                                <div key={index} className="admin-dashboard-stat-card">
                                    <div className="admin-dashboard-stat-icon">
                                        {stat.icon}
                                    </div>
                                    <div className="admin-dashboard-stat-info">
                                        <h2>{stat.value}</h2>
                                        <p>{stat.name}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="admin-dashboard-charts-grid">
                            {/* Chart 1: Patients by Gender (Placeholder) */}
                            <div className="admin-dashboard-chart-card">
                                <h2>Phân bố bệnh nhân theo giới tính</h2>
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
                                            <Cell fill="#82ca9d" />
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Chart 2: Appointment Status */}
                            <div className="admin-dashboard-chart-card">
                                <h2>Trạng thái lịch hẹn hôm nay</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={getAppointmentStatusData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getAppointmentStatusData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Chart 3: Vaccines by Age Range */}
                            <div className="admin-dashboard-chart-card">
                                <h2>Vắc xin theo độ tuổi</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart
                                        data={getVaccineAgeRangeData()}
                                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Legend />
                                        <Bar dataKey="value" name="Số lượng vắc xin" fill="#82ca9d" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                            
                            {/* Chart 4: User Roles */}
                            <div className="admin-dashboard-chart-card">
                                <h2>Phân bố vai trò người dùng</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <PieChart>
                                        <Pie
                                            data={getUserRoleData()}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                            outerRadius={80}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {getUserRoleData().map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default Dashboard;