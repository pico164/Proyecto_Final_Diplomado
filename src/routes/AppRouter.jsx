import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import React, { useState } from "react";
import Home from "../pages/Home";
import Shop from "../pages/Shop";
import Cart from "../pages/Cart";
import AdminPanel from "../pages/AdminPanel";
import Login from "../pages/Login";
import PrivateRoute from "../components/PrivateRoute";
import NavigationBar from "../components/NavigationBar";
import AdminRoute from "../components/AdminRoute";
import CategoriesPanel from "../pages/CategoriesPanel";

const AppRouter = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (term) => {
    setSearchTerm(term);
  };
  return (
    <Router>
      <NavigationBar onSearch={handleSearch} />
      <Routes>
        <Route path="/" element={<Home searchTerm={searchTerm} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/shop" element={<Shop searchTerm={searchTerm} />} />
        <Route
          path="/cart"
          element={
            <PrivateRoute>
              <Cart />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPanel />
            </AdminRoute>
          }
        />
        <Route
          path="/categories"
          element={
            <AdminRoute>
              <CategoriesPanel />
            </AdminRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRouter;
