import React, { useEffect, useState } from "react";
import { db } from "../service/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
} from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CategoriesPanel = () => {
  const [categorias, setCategorias] = useState([]);
  const [nombreCategoria, setNombreCategoria] = useState("");
  const [imagenCategoria, setImagenCategoria] = useState(null);
  const [imagenPreview, setImagenPreview] = useState("");
  const [categoriaEnEdicion, setCategoriaEnEdicion] = useState(null);

  const storage = getStorage();

  const fetchCategorias = async () => {
    const categoriasCollection = collection(db, "categorias");
    const categoriasSnapshot = await getDocs(categoriasCollection);
    const categoriasList = categoriasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategorias(categoriasList);
  };

  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    if (nombreCategoria.trim() === "") return; // Validar solo el nombre

    let url = "";
    // Si estamos editando y no hay nueva imagen
    if (categoriaEnEdicion && !imagenCategoria) {
      url = categoriaEnEdicion.imagen; // Mantener la imagen actual
    } else if (imagenCategoria) {
      const imagenRef = ref(storage, `categorias/${imagenCategoria.name}`);
      await uploadBytes(imagenRef, imagenCategoria);
      url = await getDownloadURL(imagenRef); // Obtener URL de la nueva imagen
    }

    try {
      if (categoriaEnEdicion) {
        const categoriaRef = doc(db, "categorias", categoriaEnEdicion.id);
        await setDoc(categoriaRef, { nombre: nombreCategoria, imagen: url });
        toast.success("Categoría actualizada con éxito");
      } else {
        await addDoc(collection(db, "categorias"), {
          nombre: nombreCategoria,
          imagen: url,
        });
        toast.success("Categoría agregada con éxito");
      }

      // Restablecer el formulario
      restablecerFormulario();
      fetchCategorias();
    } catch (error) {
      toast.error("Error al agregar o actualizar la categoría");
    }
  };

  const handleEliminarCategoria = async (id) => {
    if (
      window.confirm("¿Estás seguro de que deseas eliminar esta categoría?")
    ) {
      try {
        await deleteDoc(doc(db, "categorias", id));
        toast.success("Categoría eliminada con éxito");
        fetchCategorias();
      } catch (error) {
        toast.error("Error al eliminar la categoría");
      }
    }
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    setImagenCategoria(file);
    setImagenPreview(URL.createObjectURL(file));
  };

  const handleEdit = (categoria) => {
    setCategoriaEnEdicion(categoria);
    setNombreCategoria(categoria.nombre);
    setImagenPreview(categoria.imagen);
    setImagenCategoria(null); // Resetear imagen al editar
  };

  // Función para restablecer el formulario
  const restablecerFormulario = () => {
    setNombreCategoria("");
    setImagenCategoria(null);
    setImagenPreview("");
    setCategoriaEnEdicion(null);
  };

  useEffect(() => {
    fetchCategorias();
  }, []);

  return (
    <div className="container mt-5">
      <h2 className="text-center mb-4">Gestión de Categorías</h2>{" "}
      {/* Separación del título */}
      <form onSubmit={handleAgregarCategoria} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            required
            className="form-control" // Estilo de Bootstrap
          />
        </div>
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            required={!categoriaEnEdicion} // Requiere imagen solo si no está editando
            className="form-control" // Estilo de Bootstrap
          />
        </div>
        {imagenPreview && (
          <img
            src={imagenPreview}
            alt="Vista previa"
            style={{ width: "100px", marginTop: "10px" }}
          />
        )}
        <div className="d-flex justify-content-between mt-2">
          <button type="submit" className="btn btn-primary me-2">
            {categoriaEnEdicion ? "Actualizar Categoría" : "Agregar Categoría"}
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={restablecerFormulario}
          >
            Limpiar
          </button>
        </div>
      </form>
      <div className="row">
        {categorias.map((categoria) => (
          <div key={categoria.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={categoria.imagen}
                alt={categoria.nombre}
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">{categoria.nombre}</h5>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(categoria)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleEliminarCategoria(categoria.id)}
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
      <ToastContainer />
    </div>
  );
};

export default CategoriesPanel;
