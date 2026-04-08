/* eslint-disable react-refresh/only-export-components */

import { createContext, useReducer, useContext, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
};

function authReducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };

    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };

    case "SET_LOADING":
      return {
        ...state,
        loading: action.payload,
      };

    default:
      return state;
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // ✅ LOGIN FUNCTION
  const login = (token, user) => {
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    dispatch({
      type: "LOGIN",
      payload: { token, user },
    });
  };

  // ✅ LOGOUT FUNCTION
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    dispatch({ type: "LOGOUT" });
  };

  // ✅ RESTORE AUTH STATE
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (!token) {
      dispatch({ type: "SET_LOADING", payload: false });
      return;
    }

    try {
      const decoded = jwtDecode(token);

      if (decoded.exp * 1000 < Date.now()) {
        logout();
      } else {
        dispatch({
          type: "LOGIN",
          payload: {
            token,
            user: storedUser ? JSON.parse(storedUser) : decoded,
          },
        });
      }
    } catch (error) {
      console.error("JWT decode failed:", error);
      logout();
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        loading: state.loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
