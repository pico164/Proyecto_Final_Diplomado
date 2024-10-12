import React, { useEffect, useState } from "react";
import { db } from "../service/firebase";
import { collection, getDocs, query, where } from "firebase/firestore";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "../css/Home.module.css";

const Home = ({ searchTerm = "" }) => {
  const { addToCart } = useCart();
  const [categorias, setCategorias] = useState([]);
  const [productos, setProductos] = useState([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);
  const [cantidad, setCantidad] = useState({});

  const fetchCategorias = async () => {
    const categoriasCollection = collection(db, "categorias");
    const categoriasSnapshot = await getDocs(categoriasCollection);
    const categoriasList = categoriasSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategorias(categoriasList);
  };

  const fetchProductos = async (categoriaId = null) => {
    const productosCollection = collection(db, "productos");
    let productosQuery;

    if (categoriaId) {
      productosQuery = query(
        productosCollection,
        where("categoriaId", "==", categoriaId)
      );
    } else {
      productosQuery = query(
        productosCollection,
        where("destacado", "==", true)
      );
    }

    const productosSnapshot = await getDocs(productosQuery);
    const productosList = productosSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setProductos(productosList);
  };

  useEffect(() => {
    fetchCategorias();
    fetchProductos();
  }, []);

  const handleCategoriaClick = (categoriaId) => {
    setCategoriaSeleccionada(categoriaId);
    fetchProductos(categoriaId);
  };

  const filteredProductos = productos.filter((producto) =>
    producto.nombre.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCantidad = (productoId, action) => {
    setCantidad((prevCantidad) => {
      const nuevaCantidad = { ...prevCantidad };
      if (action === "increment") {
        nuevaCantidad[productoId] = (nuevaCantidad[productoId] || 0) + 1;
      } else if (action === "decrement" && nuevaCantidad[productoId] > 0) {
        nuevaCantidad[productoId] -= 1;
      }
      return nuevaCantidad;
    });
  };

  const showToast = (producto) => {
    toast.success(`${producto.nombre} agregado al carrito`, {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const handleComprar = (producto) => {
    const cantidadSeleccionada = cantidad[producto.id] || 1;
    addToCart(producto, cantidadSeleccionada);
    setCantidad((prevCantidad) => ({
      ...prevCantidad,
      [producto.id]: 0,
    }));
    showToast(producto);
  };

  return (
    <div>
      <div className="jumbotron text-center bg-primary text-white py-5">
        <h1>Bienvenido a nuestra tienda</h1>
        <p>Explora nuestras ofertas y productos populares</p>
      </div>

      <section className="container my-5">
        <h2 className="text-center mb-4">Categorías</h2>
        <div className="row">
          {categorias.length > 0 ? (
            categorias.map((categoria) => (
              <div
                className="col-md-3"
                key={categoria.id}
                onClick={() => handleCategoriaClick(categoria.id)}
                style={{ cursor: "pointer" }}
              >
                <div className={styles.card}>
                  <img
                    src={categoria.imagen || "https://via.placeholder.com/150"}
                    alt={categoria.nombre}
                    className={styles.cardImgTop}
                  />
                  <div className="card-body">
                    <h5 className={styles.cardTitle}>{categoria.nombre}</h5>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">Cargando categorías...</p>
          )}
        </div>
      </section>

      <section className="container my-5">
        <h2 className="text-center mb-4">
          {categoriaSeleccionada
            ? `Productos en la categoría seleccionada`
            : "Productos Destacados"}
        </h2>
        <div className="row">
          {filteredProductos.length > 0 ? (
            filteredProductos.map((producto) => (
              <div className="col-md-4" key={producto.id}>
                <div className={styles.card}>
                  <img
                    src={producto.imagen || "https://via.placeholder.com/300"}
                    alt={producto.nombre}
                    className={styles.cardImgTop}
                  />
                  <div className={styles.cardSeparator}></div>
                  <div className={styles.cardBody}>
                    <h5 className={styles.cardTitle}>{producto.nombre}</h5>
                    <p className={styles.cardText}>
                      ${producto.precio.toLocaleString("es-CO")}
                    </p>
                    <p className={styles.cardDescription}>
                      {producto.descripcion}
                    </p>

                    <div
                      className={`${styles.quantityControl} d-flex flex-column align-items-start`}
                    >
                      <button
                        className="btn btn-primary rounded-circle mb-2"
                        style={{ width: "40px", height: "40px" }}
                        onClick={() => handleCantidad(producto.id, "increment")}
                      >
                        +
                      </button>
                      <span className={styles.quantityValue}>
                        {cantidad[producto.id] || 0}
                      </span>
                      <button
                        className="btn btn-danger rounded-circle mt-2"
                        style={{ width: "40px", height: "40px" }}
                        onClick={() => handleCantidad(producto.id, "decrement")}
                      >
                        -
                      </button>
                    </div>

                    <div className="d-flex justify-content-center mb-3 mt-2">
                      <button
                        className="btn btn-primary"
                        onClick={() => handleComprar(producto)}
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="text-center">No hay productos para mostrar...</p>
          )}
        </div>
      </section>

      <ToastContainer />
    </div>
  );
};

export default Home;
