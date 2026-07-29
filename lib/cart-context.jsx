'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [orders, setOrders] = useState([]);
  const [toast, setToast] = useState(null);
  const [mongoStatus, setMongoStatus] = useState({ connected: false, checking: true });

  // Load saved state from localStorage
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem('assignment_cart');
      if (savedCart) setCart(JSON.parse(savedCart));

      const savedWishlist = localStorage.getItem('assignment_wishlist');
      if (savedWishlist) setWishlist(JSON.parse(savedWishlist));

      const savedOrders = localStorage.getItem('assignment_orders');
      if (savedOrders) setOrders(JSON.parse(savedOrders));
    } catch (e) {
      console.warn('Failed to parse localStorage:', e);
    }

    // Check MongoDB Connection Status from backend route
    checkMongoStatus();
  }, []);

  const checkMongoStatus = async () => {
    try {
      const res = await fetch('/api/mongodb-status');
      if (res.ok) {
        const data = await res.json();
        setMongoStatus({ connected: data.connected, message: data.message, checking: false });
      } else {
        setMongoStatus({ connected: false, message: 'Server check failed', checking: false });
      }
    } catch (err) {
      setMongoStatus({ connected: false, message: 'Local Fallback Active', checking: false });
    }
  };

  // Save cart to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('assignment_cart', JSON.stringify(cart));
    } catch (e) {}
  }, [cart]);

  // Save wishlist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('assignment_wishlist', JSON.stringify(wishlist));
    } catch (e) {}
  }, [wishlist]);

  // Save orders to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('assignment_orders', JSON.stringify(orders));
    } catch (e) {}
  }, [orders]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const addToCart = (product, quantity = 1) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id || item._id === product._id);
      if (existing) {
        return prevCart.map((item) =>
          (item.id === product.id || item._id === product._id)
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
    showToast(`Added "${product.title}" to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId && item._id !== productId));
    showToast('Item removed from cart', 'info');
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        (item.id === productId || item._id === productId)
          ? { ...item, quantity: newQty }
          : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
  };

  const toggleWishlist = (product) => {
    setWishlist((prev) => {
      const exists = prev.some((item) => item.id === product.id || item._id === product._id);
      if (exists) {
        showToast(`Removed "${product.title}" from wishlist`, 'info');
        return prev.filter((item) => item.id !== product.id && item._id !== product._id);
      } else {
        showToast(`Added "${product.title}" to wishlist!`);
        return [...prev, product];
      }
    });
  };

  const addOrder = (newOrder) => {
    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    showToast('Payment successful! Order confirmed 🎉', 'success');
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        wishlist,
        orders,
        toast,
        mongoStatus,
        cartTotal,
        cartCount,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        clearCart,
        toggleWishlist,
        addOrder,
        showToast,
        checkMongoStatus,
      }}
    >
      {children}

      {/* Global Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl backdrop-blur-md bg-slate-900/95 text-white border border-slate-800 animate-slide-up">
          <span
            className={`w-3 h-3 rounded-full ${
              toast.type === 'success'
                ? 'bg-emerald-400 shadow-sm shadow-emerald-400'
                : toast.type === 'error'
                ? 'bg-rose-400 shadow-sm shadow-rose-400'
                : 'bg-indigo-400'
            }`}
          />
          <p className="text-sm font-medium">{toast.message}</p>
        </div>
      )}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
