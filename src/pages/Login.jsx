import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../service/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [role, setRole] = useState("user");
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { login } = useAuth();
  const db = getFirestore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        const user = userCredential.user;
        await setDoc(doc(db, "users", user.uid), {
          email: email,
          role: role,
        });
        toast.success("Cuenta creada exitosamente");
        navigate("/");
      } else {
        await login(email, password);
        toast.success("Inicio de sesión exitoso");
        navigate("/");
      }
    } catch (err) {
      handleAuthErrors(err.code);
    }
  };

  const handleAuthErrors = (errorCode) => {
    switch (errorCode) {
      case "auth/invalid-email":
        setError(
          "El formato del correo electrónico no es válido. Por favor, revisa e inténtalo de nuevo."
        );
        toast.error("Error: formato de correo no válido.");
        break;
      case "auth/user-not-found":
        setError(
          "No se encontró ninguna cuenta asociada a este correo. Asegúrate de que el correo esté correcto o regístrate."
        );
        toast.error("Error: usuario no encontrado.");
        break;
      case "auth/wrong-password":
        setError(
          "La contraseña que ingresaste no es correcta. Verifica tu contraseña e inténtalo de nuevo."
        );
        toast.error("Error: contraseña incorrecta.");
        break;
      case "auth/email-already-in-use":
        setError(
          "Este correo electrónico ya está en uso por otra cuenta. Prueba con uno diferente o intenta iniciar sesión."
        );
        toast.error("Error: correo ya en uso.");
        break;
      case "auth/weak-password":
        setError(
          "La contraseña es demasiado débil. Debe tener al menos 6 caracteres."
        );
        toast.error("Error: contraseña débil.");
        break;
      case "auth/api-key-not-valid.-please-pass-a-valid-api-key":
        setError(
          "La clave API no es válida. Por favor verifica la configuración de tu proyecto."
        );
        toast.error("Error: clave API no válida.");
        break;
      default:
        setError(
          "Ha ocurrido un error inesperado. Por favor, intenta de nuevo más tarde."
        );
        toast.error("Error: ocurrió un error inesperado.");
    }
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">
        {isRegister ? "Registrarse" : "Iniciar Sesión"}
      </h2>
      {error && <p className="text-danger text-center">{error}</p>}
      <form
        onSubmit={handleSubmit}
        className="mx-auto"
        style={{ maxWidth: "400px" }}
      >
        <div className="form-group mb-3">
          <label htmlFor="email">Correo Electrónico</label>
          <input
            type="email"
            id="email"
            className="form-control"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="form-group mb-3">
          <label htmlFor="password">Contraseña</label>
          <input
            type="password"
            id="password"
            className="form-control"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {isRegister && (
          <div className="form-group mb-3">
            <label htmlFor="role">Selecciona un Rol</label>
            <select
              id="role"
              className="form-control"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="user">Usuario</option>
              <option value="admin">Administrador</option>
            </select>
          </div>
        )}
        <button type="submit" className="btn btn-primary btn-block">
          {isRegister ? "Registrarse" : "Iniciar Sesión"}
        </button>
      </form>
      <div className="text-center mt-4">
        <button
          className="btn btn-link"
          onClick={() => setIsRegister(!isRegister)}
        >
          {isRegister
            ? "¿Ya tienes una cuenta? Inicia sesión"
            : "¿No tienes cuenta? Regístrate"}
        </button>
      </div>
      <ToastContainer />
    </div>
  );
};

export default Login;
