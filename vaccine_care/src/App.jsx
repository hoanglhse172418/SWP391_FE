import { Routes, Route } from "react-router-dom";
import { PATH_NAME } from "./constant/pathname";
import LoginPage from "./pages/guest/loginPage/LoginPage";
import LayoutCustomer from "./components/customer/LayoutCustomer/LayoutCustomer";
import HomePage from "./pages/guest/HomePage/HomePage";
import VaccineListPage from "./pages/guest/VaccineListPage/VaccineListPage";
import DetailPage from "./pages/guest/DetailPage/DetailPage";
import RegisterPage from "./pages/guest/RegisterPage/RegisterPage";
import BookingPage from "./pages/cutomer/BookingPage/BookingPage";
import BillPage from "./pages/cutomer/BillPage/BillPage";
import ProfileChildPage from "./pages/cutomer/ProfileChildPage/ProfileChildPage";
import VaccinationSchedule from "./pages/cutomer/VaccinationSchedule/VaccinationSchedule";
import AboutPage from "./pages/guest/AboutPage/AboutPage";
import VaccinePrice from "./pages/guest/VaccinePrice/VaccinePrice";
import CamNangPage from "./pages/guest/CamNangPage/CamNangPage";
import CusPaymentPage from "./pages/cutomer/CusPaymentPage/CusPaymentPage";
import VaccineTransactionPage from "./pages/cutomer/VaccineTransactionPage/VaccineTransactionPage";
import VaccinationScheduleStatus from "./pages/cutomer/VaccinationScheduleStatus/VaccinationScheduleStatus";
import CreatechildPage from "./pages/cutomer/Success/CreatechildPage/CreatechildPage";
import SuccessRegis from "./pages/cutomer/Success/SuccessRegis/SuccessRegis";
import SuccesCreateprofile from "./pages/cutomer/Success/SuccesCreateprofile/SuccesCreateprofile";
import SuccesBooking from "./pages/cutomer/Success/SuccesBooking/SuccesBooking";
import Injection from "./pages/staff/injection_infor/Injectin";
import Layout_Staff from "./layouts/staff/Layout";
import Inject_infor from "./pages/doctor/inject_infor/Inject_infor";
import Layout_Doctor from "./layouts/doctor/Layout";
import Vaccine1 from "./pages/doctor/vaccine/Vaccine";
import PrivateRoute from "./routes/PrivateRoute";
import ForgotPasswordPage from "./pages/guest/ForgotPasswordPage/ForgotPasswordPage";
import ResetPasswordPage from "./pages/guest/ResetPasswordPage/ResetPasswordPage";
import ProfilePage from "./pages/cutomer/ProfilePage/ProfilePage";
import NewsList from "./pages/guest/NewsList/NewsList";
import NewsDetail from "./pages/guest/NewsDetail/NewsDetail";
import AdminDashboard from "./components/admin/admin";
import Dashboard from "./components/admin/dashboard/dashboard";
import Staff from "./components/admin/staff/staff";
import Vaccine from "./components/admin/vaccine/Vaccine";
import PaymentHistory from "./components/admin/payment_history/payment";
import AccInfo from "./components/admin/profile/acc_info";
import Child from "./components/admin/child/Child";
import Disease from "./components/admin/disease/disease";
import DetailAppointment from "./pages/cutomer/DetailAppointment/DetailAppointment";
import PaymentSuccess from "./pages/cutomer/PaymentSuccess/PaymentSuccess";
import PaymentFailed from "./pages/cutomer/PaymentFailed/PaymentFailed";
import NoConnectPage from "./context/NoconectPage";
import Profile from "./pages/doctor/profile/Profile";

const App = () => {
  return (
    <Routes>
      {/* Routes có Header & Footer */}
      <Route element={<LayoutCustomer />}>
        <Route path="/" element={<HomePage />} />
        <Route path={PATH_NAME.LISTVACCINE} element={<VaccineListPage />} />
        <Route path={PATH_NAME.DETAILVACCINE} element={<DetailPage />} />
        <Route path={PATH_NAME.NEWLIST} element={<NewsList />} />
        <Route path={PATH_NAME.NEWLDETAIL} element={<NewsDetail />} />
        <Route path={PATH_NAME.REGISTER} element={<RegisterPage />} />
        <Route path={PATH_NAME.LOGIN} element={<LoginPage />} />
        <Route path={PATH_NAME.FORGOTPASSWORD} element={<ForgotPasswordPage />}/>
        <Route path={PATH_NAME.REPASSWORD} element={<ResetPasswordPage />} />
        <Route path={PATH_NAME.ABOUT_US} element={<AboutPage />} />
        <Route path={PATH_NAME.VACCINE_PRICE} element={<VaccinePrice />} />
        <Route path={PATH_NAME.CAM_NANG} element={<CamNangPage />} />
        <Route path={PATH_NAME.IN4} element={<PrivateRoute element={<ProfilePage />} allowedRoles={["user"]} />}/>
        <Route
          path={PATH_NAME.BOOKING}
          element={
            <PrivateRoute element={<BookingPage />} allowedRoles={["user"]} />
          }
        />
        <Route
          path={PATH_NAME.BILL}
          element={
            <PrivateRoute element={<BillPage />} allowedRoles={["user"]} />
          }
        />
        <Route
          path={PATH_NAME.PROFILE_CHILD}
          element={
            <PrivateRoute
              element={<ProfileChildPage />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path={PATH_NAME.VACCINATION_SCHEDULE}
          element={
            <PrivateRoute
              element={<VaccinationSchedule />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path="/billpayment/:paymentId"
          element={
            <PrivateRoute
              element={<CusPaymentPage />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path={PATH_NAME.TRANSACTION}
          element={
            <PrivateRoute
              element={<VaccineTransactionPage />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path={PATH_NAME.VACCINATION_SCHEDULE_STATUS}
          element={
            <PrivateRoute
              element={<VaccinationScheduleStatus />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path={PATH_NAME.DETAILAPPOIMENT}
          element={
            <PrivateRoute
              element={<DetailAppointment />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path="/paymentss"
          element={
            <PrivateRoute
              element={<PaymentSuccess />}
              allowedRoles={["user"]}
            />
          }
        />
        <Route
          path="/paymentFaild"
          element={
            <PrivateRoute element={<PaymentFailed />} allowedRoles={["user"]} />
          }
        />
      </Route>
      

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <PrivateRoute element={<AdminDashboard />} allowedRoles={["admin"]} />
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="staff" element={<Staff />} />
        <Route path="vaccine" element={<Vaccine />} />
        <Route path="child" element={<Child />} />
        <Route path="disease" element={<Disease />} />
        <Route path="payment-history" element={<PaymentHistory />} />
        <Route path="profile" element={<AccInfo />} />
      </Route>

      {/*staff*/}
      <Route
        element={
          <PrivateRoute element={<Layout_Staff />} allowedRoles={["staff"]} />
        }
      >
        <Route path={PATH_NAME.INJECTION} element={<Injection />} />
        <Route path={PATH_NAME.VACCINE1} element={<Vaccine1 />} />
      </Route>

      {/* doctor */}
      <Route
        element={
          <PrivateRoute element={<Layout_Doctor />} allowedRoles={["doctor"]} />
        }
      >
        <Route
          path={PATH_NAME.INJECTION_INFORMATION}
          element={<Inject_infor />}
        />
        <Route path={PATH_NAME.VACCINE_DOCTOR} element={<Vaccine1 />} />
        <Route path={PATH_NAME.PROFILE_DOCTOR} element={<Profile />} />
      </Route>

      {/* Routes không có Header & Footer */}
      <Route path={PATH_NAME.CREATE_CHILD} element={<CreatechildPage />} />
      <Route path={PATH_NAME.SUCCESS_REGIS} element={<SuccessRegis />} />
      <Route
        path={PATH_NAME.SUCCESS_CREATE_PROFILE}
        element={<SuccesCreateprofile />}
      />
      <Route path={PATH_NAME.SUCCESS_BOOKING} element={<SuccesBooking />} />

      {/* Nếu truy cập trái phép */}
      <Route path="/unauthorized" element={<NoConnectPage />} />
    </Routes>
  );
};

export default App;
