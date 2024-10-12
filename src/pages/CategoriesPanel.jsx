import React, { useEffect, useState } from "react";
import { db } from "../service/firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
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

  // Cargar las categorías desde Firestore
  const fetchCategorias = async () => {
    const categoriasCollection = collection(db, "categorias");
    const categoriasSnapshot = await getDocs(categoriasCollection);
    const categoriasList = categoriasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategorias(categoriasList);
  };

  const checkProductsForCategory = async (categoryId) => {
    try {
      const productosCollection = collection(db, "productos"); // Asegúrate que sea la colección correcta
      const q = query(
        productosCollection,
        where("categoriaId", "==", categoryId)
      );
      const productosSnapshot = await getDocs(q);

      console.log(
        "Datos del snapshot de productos:",
        productosSnapshot.docs.map((doc) => doc.data())
      );

      if (productosSnapshot.size > 0) {
        console.log(`La categoría ${categoryId} tiene productos asociados`);
        return true;
      } else {
        console.log(`La categoría ${categoryId} no tiene productos asociados`);
        return false;
      }
    } catch (error) {
      console.error("Error al verificar productos asociados:", error);
      toast.error("Error al verificar productos asociados.");
      return false;
    }
  };

  const handleAgregarCategoria = async (e) => {
    e.preventDefault();
    if (nombreCategoria.trim() === "") return;

    let url = "";
    if (categoriaEnEdicion && !imagenCategoria) {
      url = categoriaEnEdicion.imagen;
    } else if (imagenCategoria) {
      const imagenRef = ref(storage, `categorias/${imagenCategoria.name}`);
      await uploadBytes(imagenRef, imagenCategoria);
      url = await getDownloadURL(imagenRef);
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

      restablecerFormulario();
      fetchCategorias();
    } catch (error) {
      toast.error("Error al agregar o actualizar la categoría.");
    }
  };

  const handleEliminarCategoria = async (id) => {
    const confirmDelete = window.confirm(
      "¿Estás seguro de que deseas eliminar esta categoría?"
    );
    if (!confirmDelete) return;

    try {
      const hasAssociatedProducts = await checkProductsForCategory(id);
      if (hasAssociatedProducts) {
        toast.error(
          "No puedes eliminar la categoría, tiene productos asociados."
        );
        return; // Cancela la eliminación si tiene productos
      }

      await deleteDoc(doc(db, "categorias", id)); // Elimina la categoría
      toast.success("Categoría eliminada con éxito.");
      fetchCategorias(); // Refresca la lista de categorías
    } catch (error) {
      console.error("Error al eliminar la categoría:", error);
      toast.error("Error al eliminar la categoría.");
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
    setImagenCategoria(null); // Resetea la imagen en caso de estar editando
  };

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
      <h2 className="text-center mb-4">Gestión de Categorías</h2>
      <form onSubmit={handleAgregarCategoria} className="mb-4">
        <div className="mb-3">
          <input
            type="text"
            placeholder="Nombre de la categoría"
            value={nombreCategoria}
            onChange={(e) => setNombreCategoria(e.target.value)}
            required
            className="form-control"
          />
        </div>
        <div className="mb-3">
          <input
            type="file"
            accept="image/*"
            onChange={handleImagenChange}
            required={!categoriaEnEdicion}
            className="form-control"
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
