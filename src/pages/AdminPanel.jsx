import React, { useEffect, useState } from "react";
import { db, storage } from "../service/firebase";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  setDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const AdminPanel = () => {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState(0);
  const [descripcion, setDescripcion] = useState("");
  const [imagen, setImagen] = useState(null);
  const [categoriaId, setCategoriaId] = useState("");
  const [productoEnEdicion, setProductoEnEdicion] = useState(null);
  const [destacado, setDestacado] = useState(false);

  useEffect(() => {
    fetchProducts();
    fetchCategorias();
  }, []);

  const fetchProducts = async (destacados = false) => {
    const productsCollection = collection(db, "productos");
    let productsQuery;

    if (destacados) {
      productsQuery = query(productsCollection, where("destacado", "==", true));
    } else {
      productsQuery = productsCollection;
    }

    const productSnapshot = await getDocs(productsQuery);
    const productList = productSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProductos(productList);
  };

  const fetchCategorias = async () => {
    const categoriasCollection = collection(db, "categorias");
    const categoriasSnapshot = await getDocs(categoriasCollection);
    const categoriasList = categoriasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategorias(categoriasList);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let imageUrl = productoEnEdicion?.imagen;

    if (imagen) {
      const imageRef = ref(storage, `productos/${imagen.name}`);
      await uploadBytes(imageRef, imagen);
      imageUrl = await getDownloadURL(imageRef);
    }

    const newProductData = {
      nombre,
      precio: parseFloat(precio),
      descripcion,
      imagen: imageUrl,
      categoriaId,
      destacado,
    };

    try {
      if (productoEnEdicion) {
        const productRef = doc(db, "productos", productoEnEdicion.id);
        await setDoc(productRef, newProductData);
        toast.success("Producto actualizado con éxito");
        setProductoEnEdicion(null);
      } else {
        await addDoc(collection(db, "productos"), newProductData);
        toast.success("Producto agregado con éxito");
      }
      fetchProducts();
      resetForm();
    } catch (error) {
      toast.error("Error al agregar o actualizar el producto");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este producto?")) {
      try {
        await deleteDoc(doc(db, "productos", id));
        toast.success("Producto eliminado con éxito");
        fetchProducts();
      } catch (error) {
        toast.error("Error al eliminar el producto");
      }
    }
  };

  const handleEdit = (producto) => {
    setProductoEnEdicion(producto);
    setNombre(producto.nombre);
    setPrecio(producto.precio);
    setDescripcion(producto.descripcion);
    setCategoriaId(producto.categoriaId);
    setDestacado(producto.destacado || false);
  };

  const resetForm = () => {
    setNombre("");
    setPrecio(0);
    setDescripcion("");
    setImagen(null);
    setCategoriaId("");
    setProductoEnEdicion(null);
  };

  return (
    <div className="container mt-5">
      <h2 className="text-center">Panel Administrativo</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <strong>
            {" "}
            <label className="font-weight-bold">Nombre</label>
          </strong>{" "}
          <input
            type="text"
            className="form-control"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <strong>
            <label className="font-weight-bold">Precio</label>
          </strong>{" "}
          <input
            type="number"
            className="form-control"
            value={precio}
            onChange={(e) => setPrecio(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <strong>
            <label className="font-weight-bold">Descripción</label>
          </strong>{" "}
          <textarea
            className="form-control"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
          ></textarea>
        </div>
        <div className="form-group">
          <strong>
            <label className="font-weight-bold">Imagen</label>
          </strong>{" "}
          <input
            type="file"
            className="form-control"
            onChange={(e) => setImagen(e.target.files[0])}
          />
        </div>
        <div className="form-group row mb-2 mt-3">
          <div className="col-2">
            <strong>
              <label className="font-weight-bold">Producto Destacado</label>
            </strong>
          </div>
          <div className="col-2 text-right">
            <input
              type="checkbox"
              checked={destacado}
              onChange={(e) => setDestacado(e.target.checked)}
            />
          </div>
        </div>
        <div className="form-group">
          <strong>
            <label className="font-weight-bold">Categoría</label>
          </strong>{" "}
          <select
            className="form-control"
            value={categoriaId}
            onChange={(e) => setCategoriaId(e.target.value)}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn-primary mt-3">
          {productoEnEdicion ? "Actualizar Producto" : "Agregar Producto"}
        </button>
      </form>
      <div className="row">
        {productos.map((producto) => (
          <div key={producto.id} className="col-md-4 mb-4">
            <div className="card h-100">
              <img
                src={producto.imagen}
                alt={producto.nombre}
                className="card-img-top"
              />
              <div className="card-body">
                <h5 className="card-title">{producto.nombre}</h5>
                <p className="card-text">
                  ${producto.precio.toLocaleString("es-CO")}
                </p>
                <p className="card-text">{producto.descripcion}</p>
                <p className="card-text">Categoría: {producto.categoriaId}</p>
                <p className="card-text">
                  {producto.destacado ? "Destacado" : "No destacado"}
                </p>
                <button
                  className="btn btn-warning me-2"
                  onClick={() => handleEdit(producto)}
                >
                  Editar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(producto.id)}
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

export default AdminPanel;
