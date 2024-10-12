import React from "react";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Cart = () => {
  const { cart, removeFromCart, clearCart, getTotalPrice } = useCart();

  const notify = (message) => toast(message);

  const handleRemove = (id) => {
    removeFromCart(id);
    notify("Producto eliminado del carrito");
  };

  const handleClearCart = () => {
    clearCart();
    notify("Carrito limpiado");
  };

  const handlePurchase = () => {
    const totalPrice = getTotalPrice();
    const itemsList = cart
      .map(
        (item) =>
          `- ${item.nombre} \n  Cantidad: ${item.cantidad} \n  Precio: $${(
            item.precio * item.cantidad
          ).toLocaleString("es-CO")}`
      )
      .join("\n\n");

    const message = `Hola, tengo interés en los siguientes productos:\n\n${itemsList}\n\nValor Total: $${totalPrice.toLocaleString(
      "es-CO"
    )}`;

    const whatsappUrl = `https://api.whatsapp.com/send?phone=3015982857&text=${encodeURIComponent(
      message
    )}`;

    // Redirigir a WhatsApp
    window.open(whatsappUrl, "_blank");
    notify("Redirigiendo a WhatsApp para confirmar la compra");
  };

  return (
    <div className="container">
      <h2 className="text-center mb-4">Carrito de Compras</h2>
      {cart.length > 0 ? (
        <div>
          <div className="row text-center font-weight-bold">
            <div className="col-md-4">
              <strong>Producto</strong>
            </div>
            <div className="col-md-2">
              <strong>Cantidad</strong>
            </div>
            <div className="col-md-2">
              <strong>Precio</strong>
            </div>
            <div className="col-md-2">
              <strong>Subtotal</strong>
            </div>
            <div className="col-md-2">
              <strong>Acción</strong>
            </div>
          </div>

          {cart.map((item) => (
            <div
              className="row text-center align-items-center py-2 border-bottom"
              key={item.id}
            >
              <div className="col-md-4">
                <h5>{item.nombre}</h5>
              </div>
              <div className="col-md-2">
                <p>{item.cantidad}</p>
              </div>
              <div className="col-md-2">
                <p>${item.precio.toLocaleString("es-CO")}</p>
              </div>
              <div className="col-md-2">
                <p>${(item.precio * item.cantidad).toLocaleString("es-CO")}</p>
              </div>
              <div className="col-md-2">
                <button
                  onClick={() => handleRemove(item.id)}
                  className="btn btn-danger"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}

          <div className="row mt-4">
            <div className="col-md-8 offset-md-2 text-center">
              <h3>Valor Total: ${getTotalPrice().toLocaleString("es-CO")}</h3>
            </div>
          </div>

          <div className="row text-center mt-3">
            <div className="col-md-12">
              <button
                onClick={handleClearCart}
                className="btn btn-warning"
                style={{ marginRight: "20px" }}
              >
                Limpiar Carrito
              </button>
              <button onClick={handlePurchase} className="btn btn-primary">
                Comprar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center">No hay productos en el carrito.</p>
      )}
      <ToastContainer />
    </div>
  );
};

export default Cart;
