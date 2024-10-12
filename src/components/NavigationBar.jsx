import React, { useEffect, useState, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getFirestore, doc, getDoc } from "firebase/firestore";

const NavigationBar = ({ onSearch }) => {
  const location = useLocation();
  const { currentUser, logout } = useAuth();
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const db = getFirestore();
  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const checkAdminRole = async () => {
      if (currentUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", currentUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setIsAdmin(userData.role === "admin");
          } else {
            console.log("El documento del usuario no existe.");
            setIsAdmin(false);
          }
        } catch (error) {
          console.error("Error al obtener el documento del usuario:", error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
      }
    };

    checkAdminRole();
  }, [currentUser, db]);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    navigate("/login");
  };

  const toggleDropdown = () => {
    setDropdownOpen((prev) => !prev);
  };

  const handleSearch = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    } else {
      console.error("onSearch no está definido");
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectOption = () => {
    setDropdownOpen(false);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white">
      <div className="container">
        <Link className="navbar-brand" to="/">
          <img
            src="https://img.freepik.com/vector-premium/diseno-vectorial-logotipo-tienda-fondo-blanco_1277164-15209.jpg"
            alt="Logo"
            style={{ height: "60px" }}
          />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                Inicio
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/shop">
                Tienda
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/cart">
                Carrito
              </Link>
            </li>
          </ul>
          <div className="d-flex justify-content-center w-100">
            <input
              type="text"
              className="form-control"
              placeholder="Buscar productos..."
              onChange={handleSearch}
              style={{ width: "530px" }}
            />
          </div>
          <ul className="navbar-nav ms-auto">
            {location.pathname !== "/login" && !currentUser ? (
              <li className="nav-item">
                <Link className="nav-link btn btn-outline-primary" to="/login">
                  Iniciar Sesión
                </Link>
              </li>
            ) : currentUser ? (
              <div className="nav-item dropdown" ref={dropdownRef}>
                <button
                  className="nav-link btn btn-outline-secondary dropdown-toggle"
                  onClick={toggleDropdown}
                  aria-expanded={isDropdownOpen}
                >
                  {currentUser.email}
                </button>
                <ul className={`dropdown-menu ${isDropdownOpen ? "show" : ""}`}>
                  {isAdmin && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/admin"
                        onClick={handleSelectOption}
                      >
                        Panel Administrativo
                      </Link>
                    </li>
                  )}
                  {isAdmin && (
                    <li>
                      <Link
                        className="dropdown-item"
                        to="/categories"
                        onClick={handleSelectOption}
                      >
                        Gestionar Categorías
                      </Link>
                    </li>
                  )}
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Cerrar Sesión
                    </button>
                  </li>
                </ul>
              </div>
            ) : null}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default NavigationBar;
