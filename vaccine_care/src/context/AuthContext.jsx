// import React, { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(localStorage.getItem("access_token"));
//   const [isLoggedIn, setIsLoggedIn] = useState(!!token);

//   useEffect(() => {
//     const storedToken = localStorage.getItem("access_token");
//     if (storedToken) {
//       setToken(storedToken);
//       setIsLoggedIn(true);
//     }
//   }, []);

//   const login = (newToken) => {
//     localStorage.setItem("access_token", newToken);
//     setToken(newToken);
//     setIsLoggedIn(true);
//   };

//   const logout = () => {
//     localStorage.removeItem("access_token");
//     setToken(null);
//     setIsLoggedIn(false);
//   };

//   return (
//     <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };



// import React, { createContext, useState, useEffect } from "react";

// export const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [token, setToken] = useState(sessionStorage.getItem("access_token"));
//   const [isLoggedIn, setIsLoggedIn] = useState(!!token);

//   useEffect(() => {
//     const storedToken = sessionStorage.getItem("access_token");
//     if (storedToken) {
//       setToken(storedToken);
//       setIsLoggedIn(true);
//     }
//   }, []);

//   const login = (newToken) => {
//     sessionStorage.setItem("access_token", newToken);
//     setToken(newToken);
//     setIsLoggedIn(true);
//   };

//   const logout = () => {
//     sessionStorage.removeItem("access_token");
//     setToken(null);
//     setIsLoggedIn(false);
//   };

//   return (
//     <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
//       {children}
//     </AuthContext.Provider>
//   );
// };
import React, { createContext, useState, useEffect } from "react";
import jwtDecode from "jwt-decode";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
      try {
        const decodedToken = jwtDecode(storedToken);
        // console.log("🔍 Token decoded:", decodedToken);

        setUser({
          role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
        });

        // console.log("✅ User role from token:", decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
      } catch (error) {
        // console.error("❌ Lỗi khi giải mã token:", error);
        setUser(null);
      }
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setIsLoggedIn(true);
    try {
      const decodedToken = jwtDecode(newToken);
      // console.log("🔍 Token decoded sau đăng nhập:", decodedToken);

      setUser({
        role: decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      });

      // console.log("✅ User role sau đăng nhập:", decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]);
    } catch (error) {
      // console.error("❌ Lỗi khi giải mã token sau đăng nhập:", error);
      setUser(null);
    }
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setIsLoggedIn(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
