import React, { createContext, useState, useEffect } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("access_token"));
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);

  useEffect(() => {
    const storedToken = localStorage.getItem("access_token");
    if (storedToken) {
      setToken(storedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (newToken) => {
    localStorage.setItem("access_token", newToken);
    setToken(newToken);
    setIsLoggedIn(true);
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    setToken(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ token, isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};



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
