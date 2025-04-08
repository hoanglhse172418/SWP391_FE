import React, { useState, useEffect, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import "./BookingPage.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import api from '../../../services/api';
import { AuthContext } from '../../../context/AuthContext';
import jwtDecode from "jwt-decode";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Button, notification } from 'antd';
import { useNavigate } from 'react-router-dom';


function BookingPage() {
    const { token } = useContext(AuthContext);
    const [children, setChildren] = useState([]);
    const [vaccines, setVaccines] = useState([]);
    const [vaccinePackages, setVaccinePackages] = useState([]);
    const [diseases, setDiseases] = useState([]); 
    const [relatedVaccines, setRelatedVaccines] = useState([]); 
    const [selectedChild, setSelectedChild] = useState('');
    const [selectedVaccine, setSelectedVaccine] = useState('');
    const [selectedDisease, setSelectedDisease] = useState(''); 
    const [selectedVaccinePackage, setSelectedVaccinePackage] = useState(null);
    const [vaccineType, setVaccineType] = useState('');
    const [contactName, setContactName] = useState('');
    const [contactPhone, setContactPhone] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [childId, setChildId] = useState(null);
    const location = useLocation();
    const notificationTypes = ['success', 'info', 'warning', 'error'];
    const [vaccinationProfileId, setVaccinationProfileId] = useState(null);
    const [highlightedVaccines, setHighlightedVaccines] = useState({});
    const [diseaseEarliestDate, setDiseaseEarliestDate] = useState({});
    const [vaccinationDetails, setVaccinationDetails] = useState([]);
    const [diseaseInjectionInfo, setDiseaseInjectionInfo] = useState('');

    const navigate = useNavigate();
    // Hiển thị cảnh báo
    useEffect(() => {
        const fetchVaccinationDetails = async () => {
          if (!selectedChild) return;
      
          try {
            const profileRes = await api.get(`/VaccinationProfile/get-all?FilterOn=childrenId&FilterQuery=${selectedChild}`);
            const profiles = profileRes.data?.$values || [];
            if (profiles.length === 0) return;
      
            const profileId = profiles[0].id;
      
            const res = await api.get(`/VaccinationDetail/get-all?FilterOn=vaccinationProfileId&FilterQuery=${profileId}&PageSize=200`);
            const details = res.data?.$values || [];
            setVaccinationDetails(details);
          } catch (err) {
            console.error("❌ Lỗi khi gọi VaccinationDetail:", err);
          }
        };
      
        fetchVaccinationDetails();
      }, [selectedChild]);
      useEffect(() => {
        if (!selectedDisease || vaccinationDetails.length === 0) {
          setDiseaseInjectionInfo('');
          return;
        }
      
        const selectedDiseaseObj = diseases.find(d => d.name === selectedDisease);
        if (!selectedDiseaseObj) {
          setDiseaseInjectionInfo('');
          return;
        }
      
        const diseaseId = selectedDiseaseObj.id;
        const related = vaccinationDetails.filter(v => v.diseaseId === diseaseId);
        const total = related.length;
        const done = related.filter(v => v.actualInjectionDate !== null).length;
        const remaining = total - done;
      
        if (remaining > 0) {
          setDiseaseInjectionInfo(`🦠 Bệnh "${selectedDisease}" còn ${remaining} mũi cần tiêm để hoàn tất.`);
        } else {
          setDiseaseInjectionInfo(`✅ Bệnh "${selectedDisease}" đã hoàn tất các mũi tiêm.`);
        }
      }, [selectedDisease, vaccinationDetails]);
      


    useEffect(() => {
        const fetchVaccineTemplateByChild = async () => {
          if (!selectedChild) return;
      
          try {
            const profileRes = await api.get(`/VaccinationProfile/get-all?FilterOn=childrenId&FilterQuery=${selectedChild}`);
            const profiles = profileRes.data?.$values || [];
      
            if (profiles.length > 0) {
              const profileId = profiles[0].id;
              const vaccineTemplateRes = await api.get(`/VaccineTemplate/get-by-profileid/${profileId}`);
              const vaccineData = vaccineTemplateRes.data?.$values || vaccineTemplateRes.data;
      
              // 👉 Group theo diseaseId và lấy expectedInjectionDate sớm nhất
              const diseaseToEarliestDate = {};
      
              vaccineData.forEach(vaccine => {
                const diseaseId = vaccine.diseaseId;
                const date = new Date(vaccine.expectedInjectionDate);
                if (!diseaseToEarliestDate[diseaseId] || date < new Date(diseaseToEarliestDate[diseaseId])) {
                  diseaseToEarliestDate[diseaseId] = vaccine.expectedInjectionDate;
                }
              });
      
              setDiseaseEarliestDate(diseaseToEarliestDate);
              console.log("🧠 Ngày tiêm dự kiến sớm nhất theo bệnh:", diseaseToEarliestDate);
            }
          } catch (error) {
            console.error("❌ Lỗi khi lấy VaccineTemplate:", error);
          }
        };
      
        fetchVaccineTemplateByChild();
      }, [selectedChild]);
      


     // Nhận dữ liệu từ VaccinationSchedule    
    useEffect(() => {
        if (location.state) {
            // 🧒 Đồng bộ ID trẻ
            if (location.state.childId) {
                setChildId(location.state.childId);
                setSelectedChild(location.state.childId);
            } else {
                console.warn("Không tìm thấy ID của đứa trẻ.");
            }
    
            // 📅 Gán ngày dự kiến (fix chỗ lỗi định dạng string)
            if (location.state.expectedInjectionDate) {
                try {
                    const dateObj = new Date(location.state.expectedInjectionDate);
                    if (!isNaN(dateObj.getTime())) {
                        setAppointmentDate(dateObj); // ✅ Gán đúng Date object
                    } else {
                        console.warn("expectedInjectionDate không hợp lệ:", location.state.expectedInjectionDate);
                    }
                } catch (error) {
                    console.error("Lỗi chuyển đổi ngày dự kiến:", error);
                }
            } else {
                console.warn("Không có ngày dự kiến, người dùng cần nhập tay.");
            }
    
            // 💉 Gán bệnh nếu có
            if (location.state.diseaseId && diseases.length > 0) {
                const foundDisease = diseases.find(d => d.id === location.state.diseaseId);
                if (foundDisease) {
                    setSelectedDisease(foundDisease.name);
                } else {
                    console.warn("Không tìm thấy thông tin bệnh.");
                }
            }
        }
    }, [location.state, diseases]);
    
    

    // Lấy danh sách bệnh từ API ✅ Mới
    useEffect(() => {
        api.get('/Disease/get-all?PageSize=30')
            .then(response => {
                setDiseases(response.data?.$values || []);
            })
            .catch(error => console.error('Lỗi khi lấy danh sách bệnh:', error));
    }, []);

    // Lấy danh sách trẻ em
    useEffect(() => {
        if (token) {
            let userId;
            try {
                const decoded = jwtDecode(token);
                userId = decoded.Id;
            } catch (err) {
                console.error("❌ Lỗi giải mã token:", err);
                return;
            }

            api.get(`/Child/get-all?FilterOn=userId&FilterQuery=${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(response => {
                setChildren(response.data?.$values || []);
            })
            .catch(error => console.error('Lỗi khi lấy danh sách trẻ em:', error));
        }
    }, [token]);
    const [childInfo, setChildInfo] = useState(null);

    useEffect(() => {
        if (selectedChild) {
            api.get(`/Child/get-by-id/${selectedChild}`)
                .then(response => {
                    setChildInfo(response.data); // Lưu thông tin của trẻ vào state
                    setContactName(response.data.fatherFullName); // Gán họ tên cha vào input
                    setContactPhone(response.data.fatherPhoneNumber); // Gán số điện thoại cha vào input
                })
                .catch(error => console.error("Lỗi khi lấy thông tin chi tiết của trẻ:", error));
        }
    }, [selectedChild]);
    
    // Lấy danh sách vaccine lẻ
    useEffect(() => {
        api.get('/Vaccine/get-all')
            .then(response => {
                setVaccines(response.data?.$values || []);
            })
            .catch(error => console.error('Lỗi khi lấy danh sách vaccine:', error));
    }, []);

    // Lấy danh sách vaccine gói
    useEffect(() => {
        api.get('/VaccinePackage/get-all')
            .then(response => {
                setVaccinePackages(response.data?.$values || []);
            })
            .catch(error => console.error('Lỗi khi lấy danh sách vaccine package:', error));
    }, []);


// Khi chọn bệnh, gọi API để lấy danh sách vaccine liên quan ✅
const [showVaccineSelect, setShowVaccineSelect] = useState(false);
useEffect(() => {
  if (selectedDisease) {
      api.get(`/Vaccine/get-vaccines-by-diasease-name/${selectedDisease}`)
          .then(response => {
              const vaccines = response.data?.$values || [];
              console.log("💉 Vaccine theo bệnh:", vaccines); // 🧠 Console ở đây
              setRelatedVaccines(vaccines);
              setShowVaccineSelect(vaccines.length > 0); 
          })
          .catch(error => {
              console.error('❌ Lỗi khi lấy vaccine theo bệnh:', error);
              setRelatedVaccines([]); 
              setShowVaccineSelect(false); 
          });
  } else {
      setRelatedVaccines([]);
      setShowVaccineSelect(false);
  }
}, [selectedDisease]);

// useEffect(() => {
//     if (selectedDisease) {
//         api.get(`/Vaccine/get-vaccines-by-diasease-name/${selectedDisease}`)
//             .then(response => {
//                 const vaccines = response.data?.$values || [];
//                 setRelatedVaccines(vaccines);
//                 setShowVaccineSelect(vaccines.length > 0); 
//             })
//             .catch(error => {
//                 console.error('Lỗi khi lấy vaccine theo bệnh:', error);
//                 setRelatedVaccines([]); 
//                 setShowVaccineSelect(false); // Ẩn ô chọn nếu lỗi xảy ra
//             });
//     } else {
//         setRelatedVaccines([]);
//         setShowVaccineSelect(false);
//     }
// }, [selectedDisease]);

    // Xử lý đặt lịch

    const openNotification = (type, message, description) => {
        if (!notificationTypes.includes(type)) return; // Đảm bảo type hợp lệ
        notification[type]({
          message,
          description,
        });
      };

      const checkIfChildHasAppointmentOnDate = async (childId, date) => {
        try {
          const res = await api.get(`/Appointment/customer-appointments`, {
            headers: { Authorization: `Bearer ${token}` }
          });
      
          const allAppointments = [
            ...(res.data?.singleVaccineAppointments?.$values || []),
            ...(res.data?.packageVaccineAppointments?.$values || []).flatMap(pkg => pkg.vaccineItems?.$values || [])
          ];
      
          // Chuyển ngày về yyyy-mm-dd để so sánh
          const formattedDate = new Date(date).toISOString().split('T')[0];
      
          return allAppointments.some(app =>
            app.childrenId === parseInt(childId) &&
            new Date(app.dateInjection).toISOString().split('T')[0] === formattedDate &&
            app.status !== "Canceled"
          );
        } catch (error) {
          console.error("Lỗi khi kiểm tra lịch tiêm:", error);
          return false; // fallback cho phép đặt nếu lỗi
        }
      };
      

      const handleSubmit = async () => {

        if (vaccineType === "Vaccine lẻ" && selectedDisease) {
  const selectedDiseaseObj = diseases.find(d => d.name === selectedDisease);
  const diseaseId = selectedDiseaseObj?.id;
  const minDate = diseaseEarliestDate[diseaseId];

  if (minDate && new Date(appointmentDate) < new Date(minDate)) {
    openNotification(
      'warning',
      'Ngày tiêm không hợp lệ',
      `⚠️ Ngày tiêm phải sau ${new Date(minDate).toLocaleDateString()} theo lịch tiêm mẫu!`
    );
    return;
  }
}


        // Check lịch trùng
const isDuplicate = await checkIfChildHasAppointmentOnDate(selectedChild, appointmentDate);
if (isDuplicate) {
  openNotification('error', 'Không thể đặt lịch', '❌ Mỗi trẻ chỉ được tiêm 1 mũi/ngày!');
  return;
}

        if (!selectedChild || !appointmentDate || !contactName || !contactPhone || (!selectedVaccine && !selectedVaccinePackage && !selectedPendingVaccine)) {
          openNotification('warning', 'Thiếu thông tin', 'Vui lòng nhập đầy đủ thông tin!');
          return;
        }
    
        const formatDate = (date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
        };
    
        if (vaccineType === 'Vắc xin đang chờ' && selectedPendingVaccine) {
          try {
            const requestData = [{
              appointmentId: parseInt(selectedPendingVaccine),
              newDate: formatDate(appointmentDate),
            }];
    
            await api.put('/Appointment/update-multiple-injection-dates', requestData, {
              headers: { Authorization: `Bearer ${token}` },
            });
    
            openNotification('success', 'Thành công', '✅ Cập nhật ngày tiêm thành công!');
            setTimeout(() => {
              window.location.reload();
            }, 1500);
            

            return;
          } catch (error) {
            openNotification('error', 'Lỗi cập nhật', `Cập nhật ngày tiêm thất bại! Lỗi: ${error.response?.data?.message || "Không xác định"}`);
            return;
          }
        }
    
        let vaccineTypeFormatted = vaccineType === "Vaccine lẻ" ? "Single" : vaccineType === "Vắc xin gói" ? "Package" : "";
        if (!vaccineTypeFormatted) {
          openNotification('warning', 'Sai loại vắc xin', "Vui lòng chọn loại vắc xin hợp lệ!");
          return;
        }
    
        // 🔥 Check nếu vaccine hết hàng
        if (vaccineTypeFormatted === "Single") {
          const vaccine = relatedVaccines.find(v => v.id === parseInt(selectedVaccine));
          if (vaccine?.inStockNumber === 0) {
            openNotification('error', 'Vắc xin đã hết hàng', 'Không thể đặt lịch vì vắc xin đã hết!');
            return;
          }
        }
    
        const requestData = {
          childFullName: children.find(child => child.id === parseInt(selectedChild))?.childrenFullname || "",
          contactFullName: contactName,
          contactPhoneNumber: contactPhone,
          vaccineType: vaccineTypeFormatted,
          diaseaseName: vaccineTypeFormatted === "Single" ? selectedDisease || "" : "",
          selectedVaccineId: vaccineTypeFormatted === "Single" ? parseInt(selectedVaccine) || null : null,
          selectedVaccinePackageId: vaccineTypeFormatted === "Package" ? parseInt(selectedVaccinePackage) || null : null,
          appointmentDate: formatDate(appointmentDate),
        };
    
        try {

          // Nếu là vắc xin gói, kiểm tra xem đã từng đặt gói này chưa
          // if (vaccineTypeFormatted === "Package" && selectedVaccinePackage) {
          //   try {
          //     const res = await api.get(`/Appointment/customer-appointments`, {
          //       headers: { Authorization: `Bearer ${token}` }
          //     });
          
          //     const existingPackages = res.data?.packageVaccineAppointments?.$values || [];
          
          //     // Check nếu gói đã được đặt và còn mũi chưa huỷ
          //     const samePackage = existingPackages.find(
          //       pkg => pkg.vaccinePackageId === parseInt(selectedVaccinePackage)
          //     );
          
          //     if (samePackage) {
          //       const stillActive = samePackage.vaccineItems?.$values.some(item => item.status !== "Canceled");
          //       if (stillActive) {
          //         openNotification(
          //           'warning',
          //           'Gói vắc xin đã được đặt',
          //           '⚠️ Gói này đã có lịch tiêm đang hoạt động. Vui lòng chọn gói khác!'
          //         );
          //         return;
          //       }
          //     }
          
          //     // Check nếu ngày đó đã có bất kỳ gói vắc xin nào đang đặt
          //     const selectedDateStr = new Date(appointmentDate).toISOString().split('T')[0];
          //     const hasOtherPackageSameDay = existingPackages.some(pkg =>
          //       pkg.vaccineItems?.$values.some(item =>
          //         new Date(item.dateInjection).toISOString().split('T')[0] === selectedDateStr &&
          //         item.status !== "Canceled"
          //       )
          //     );
          
          //     if (hasOtherPackageSameDay) {
          //       openNotification(
          //         'error',
          //         'Đã có gói vắc xin trong ngày',
          //         '❌ Một ngày chỉ được tiêm 1 gói vắc xin. Vui lòng chọn ngày khác!'
          //       );
          //       return;
          //     }
          
          //   } catch (error) {
          //     console.error("❌ Lỗi khi kiểm tra gói vắc xin:", error);
          //   }
          // }

          if (vaccineTypeFormatted === "Package" && selectedVaccinePackage) {
            try {
              const res = await api.get(`/Appointment/customer-appointments`, {
                headers: { Authorization: `Bearer ${token}` }
              });
          
              const existingPackages = res.data?.packageVaccineAppointments?.$values || [];
          
              // ❌ Không cho đặt nếu gói này đã từng được đặt cho chính đứa trẻ này
              const alreadyBooked = existingPackages.some(pkg =>
                pkg.vaccinePackageId === parseInt(selectedVaccinePackage) &&
                pkg.childrenId === parseInt(selectedChild)
              );
          
              if (alreadyBooked) {
                openNotification(
                  'error',
                  'Trùng gói vắc xin',
                  '❌ Gói vắc xin này đã từng được đặt cho bé này. Không thể đặt lại!'
                );
                return;
              }
          
              // ✅ Check nếu ngày đó đã có gói khác
              const selectedDateStr = new Date(appointmentDate).toISOString().split('T')[0];
              const hasOtherPackageSameDay = existingPackages.some(pkg =>
                pkg.vaccineItems?.$values.some(item =>
                  new Date(item.dateInjection).toISOString().split('T')[0] === selectedDateStr &&
                  item.childrenId === parseInt(selectedChild) &&
                  item.status !== "Canceled"
                )
              );
          
              if (hasOtherPackageSameDay) {
                openNotification(
                  'error',
                  'Đã có gói trong ngày',
                  '❌ Bé đã có lịch tiêm gói trong ngày này. Vui lòng chọn ngày khác!'
                );
                return;
              }
          
            } catch (error) {
              console.error("❌ Lỗi khi kiểm tra gói vắc xin:", error);
            }
          }
          

          await api.post('/Appointment/book-appointment', requestData, {
            headers: { Authorization: `Bearer ${token}` },
          });
          openNotification('success', 'Thành công', '✅ Đặt lịch thành công!');
          setTimeout(() => {
            navigate('/vaccinationScheduleStatus');
          }, 1500);
          
          

        } catch (error) {
          openNotification('error', 'Lỗi đặt lịch', `Đặt lịch thất bại! Lỗi: ${error.response?.data?.message || "Không xác định"}`);
        }
      };
   

// vaccine đang tiêm
const [pendingVaccines, setPendingVaccines] = useState([]);
const [selectedPendingVaccine, setSelectedPendingVaccine] = useState('');
   
useEffect(() => {
    if (selectedChild) {
        const fetchPendingVaccines = async () => {
            try {
                const response = await api.get(`/Appointment/get-appointments-from-buying-package/${selectedChild}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                const data = response.data;
                const pendingList = data.packageVaccineAppointments?.$values?.flatMap(pkg => 
                    pkg.vaccineItems?.$values.filter(vaccine => vaccine.status === "Pending")
                ) || [];

                setPendingVaccines(pendingList);
            } catch (error) {
                console.error('Error fetching pending vaccines:', error);
            }
        };

        fetchPendingVaccines();
    }
}, [selectedChild, token]);
    return (
        <div className='HomePage-Allcontainer'>
            <div className="HomePage-main-container">
                <div className='container'>
                    <div className='row'>
                        <div className='col-12 mt-152 BookingPage-titletitle'>
                            <div className="BookingPage-heading-protected-together">
                                Đặt lịch tiêm
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Đặt Lịch */}
            <div className='BookingPage-container'>
    <div className='container'>
        <div className='row'>
            <div className='col-6'>
                <div className='BookingPage-flex'>
                    {/* THÔNG TIN NGƯỜI TIÊM */}
                    <div className='BookingPage-tuade'>Thông tin người tiêm</div>
                    <select className='BookingPage-input'
                        value={selectedChild}
                        onChange={(e) => setSelectedChild(e.target.value)}
                    >
                        <option value="">Chọn trẻ em</option>
                        {children.map(child => (
                            <option key={child.id} value={child.id}>{child.childrenFullname}</option>
                        ))}
                    </select>

                    {/* THÔNG TIN NGƯỜI LIÊN HỆ */}

<div className='BookingPage-tuade'>Thông tin người liên hệ</div>
<div className='BookingPage-flex5'>
    <input 
        className='BookingPage-input' 
        placeholder='Họ tên' 
        value={contactName} 
        onChange={(e) => setContactName(e.target.value)} 
    />
    <input 
        className='BookingPage-input' 
        placeholder='Số điện thoại' 
        value={contactPhone} 
        onChange={(e) => setContactPhone(e.target.value)} 
    />
</div>
<div className='BookingPage-tuade'>Loại vắc xin muốn đăng ký</div>
            <div className='BookingPage-flex5'>
                <button className={`Booking-goi ${vaccineType === 'Vắc xin gói' ? 'selected' : ''}`} 
                    onClick={() => setVaccineType('Vắc xin gói')}>Vắc xin gói</button>
                <button className={`Booking-goi ${vaccineType === 'Vaccine lẻ' ? 'selected' : ''}`} 
                    onClick={() => setVaccineType('Vaccine lẻ')}>Vắc xin lẻ</button>
                <button className={`Booking-goi ${vaccineType === 'Vắc xin đang chờ' ? 'selected' : ''}`} 
                    onClick={() => setVaccineType('Vắc xin đang chờ')}>Vắc xin đang chờ</button>
            </div>

            {vaccineType === 'Vaccine lẻ' && (
                <>
                    <div className='BookingPage-tuade'>Chọn bệnh</div>
                    <select className='BookingPage-input' 
                        value={selectedDisease} 
                        onChange={(e) => setSelectedDisease(e.target.value)}
                    >
                        <option value="">Chọn bệnh</option>
                        {diseases.map(disease => (
                            <option key={disease.id} value={disease.name}>{disease.name}</option>
                        ))}
                    </select>
                    {diseaseInjectionInfo && (
  <div style={{
    backgroundColor: '#fff3cd',
    color: '#856404',
    padding: '10px 15px',
    borderRadius: '8px',
    border: '1px solid #ffeeba',
    marginTop: '10px'
  }}>
    {diseaseInjectionInfo}
  </div>
)}


                    {showVaccineSelect && relatedVaccines.length > 0 && (
                        <>
                            <div className='BookingPage-tuade'>Chọn vắc xin</div>
                            <select className='BookingPage-input' 
                                value={selectedVaccine} 
                                onChange={(e) => setSelectedVaccine(Number(e.target.value))}
                            >
                                <option value="">Chọn vắc xin</option>
                                {/* {relatedVaccines.map(vaccine => (
                                    <option key={vaccine.id} value={vaccine.id}>{vaccine.name}</option>
                                ))} */}
                                {relatedVaccines.map(vaccine => (
  <option 
    key={vaccine.id} 
    value={vaccine.id}
    disabled={vaccine.inStockNumber === 0}
  >
    {vaccine.name} {vaccine.inStockNumber === 0 ? '(Hết hàng)' : ''}
  </option>
))}

                            </select>
                        </>
                    )}
                </>
            )}

            {vaccineType === 'Vắc xin gói' && (
                <>
                    <div className='BookingPage-tuade'>Chọn gói vắc xin</div>
                    <select className='BookingPage-input'
                        value={selectedVaccinePackage}
                        onChange={(e) => setSelectedVaccinePackage(Number(e.target.value))}
                    >
                        <option value="">Chọn gói vắc xin</option>
                        {vaccinePackages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>{pkg.name}</option>
                        ))}
                    </select>
                </>
            )}

{vaccineType === 'Vắc xin đang chờ' && pendingVaccines.length > 0 && (
                <>
                    <div className='BookingPage-tuade'>Danh sách vắc xin đang chờ</div>
                    <select className='BookingPage-input' 
                        value={selectedPendingVaccine} 
                        onChange={(e) => {
                            const selectedVaccine = pendingVaccines.find(v => v.id === Number(e.target.value));
                            setSelectedPendingVaccine(e.target.value);
                            setAppointmentDate(selectedVaccine?.dateInjection.split('T')[0] || '');
                        }}
                    >
                        <option value="">Chọn vắc xin</option>
                        {pendingVaccines.map(vaccine => (
                            <option key={vaccine.id} value={vaccine.id}>{vaccine.vaccineName} - Ngày tiêm: {new Date(vaccine.dateInjection).toLocaleDateString()}</option>
                        ))}
                    </select>
                    {selectedVaccine && (() => {
  const vaccine = relatedVaccines.find(v => v.id === parseInt(selectedVaccine));
  return vaccine?.inStockNumber === 0 && (
    <div style={{ color: 'red', marginTop: '8px' }}>
      ⚠️ Vắc xin này đã hết hàng, không thể đặt lịch.
    </div>
  );
})()}

                </>
            )}
                                {/* NGÀY TIÊM DỰ KIẾN */}
            <div className='BookingPage-tuade'>Ngày mong muốn tiêm</div>
            <DatePicker
            selected={appointmentDate}
            onChange={(date) => setAppointmentDate(date)}
            minDate={new Date()}
            dateFormat="dd/MM/yyyy"
            locale={vi}
            placeholderText="Chọn ngày"
            className="BookingPage-inputdate"
        />

                    {/* NÚT HOÀN THÀNH */}
                    <button className='BookingPage-button' onClick={handleSubmit}>Hoàn thành đăng ký</button>
                </div>
            </div>
        </div>
    </div>
</div>

        </div>
    );
}

export default BookingPage;
