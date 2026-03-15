import { database } from '../firebase';
import { ref, push, set, get, onValue, update, remove, query, orderByChild, equalTo } from 'firebase/database';

// Orders operations
export const saveOrder = async (orderData) => {
  try {
    const ordersRef = ref(database, 'orders');
    const newOrderRef = push(ordersRef);
    await set(newOrderRef, {
      ...orderData,
      firebaseId: newOrderRef.key,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return newOrderRef.key;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

export const getOrders = (callback) => {
  const ordersRef = ref(database, 'orders');
  return onValue(ordersRef, (snapshot) => {
    const data = snapshot.val();
    const orders = data ? Object.keys(data).map(key => ({
      firebaseId: key,
      ...data[key]
    })) : [];
    callback(orders);
  });
};

export const updateOrderStatus = async (firebaseId, status) => {
  try {
    const orderRef = ref(database, `orders/${firebaseId}`);
    await update(orderRef, {
      status,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const deleteOrder = async (firebaseId) => {
  try {
    const orderRef = ref(database, `orders/${firebaseId}`);
    await remove(orderRef);
  } catch (error) {
    console.error('Error deleting order:', error);
    throw error;
  }
};

// Menu operations
export const saveMenuItem = async (category, itemData) => {
  try {
    const menuRef = ref(database, `menu/${category}`);
    const newItemRef = push(menuRef);
    await set(newItemRef, {
      ...itemData,
      firebaseId: newItemRef.key,
      category,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });
    return newItemRef.key;
  } catch (error) {
    console.error('Error saving menu item:', error);
    throw error;
  }
};

export const getMenu = (callback) => {
  const menuRef = ref(database, 'menu');
  return onValue(menuRef, (snapshot) => {
    const data = snapshot.val();
    const menu = {};
    
    if (data) {
      Object.keys(data).forEach(category => {
        menu[category] = Object.keys(data[category]).map(key => ({
          firebaseId: key,
          ...data[category][key]
        }));
      });
    }
    
    callback(menu);
  });
};

// Promise-based version for initial loading
export const getMenuOnce = async () => {
  try {
    const menuRef = ref(database, 'menu');
    const snapshot = await get(menuRef);
    const data = snapshot.val();
    const menu = {};
    
    if (data) {
      Object.keys(data).forEach(category => {
        menu[category] = Object.keys(data[category]).map(key => ({
          firebaseId: key,
          ...data[category][key]
        }));
      });
    }
    
    return menu;
  } catch (error) {
    console.error('Error getting menu:', error);
    throw error;
  }
};

export const getOrdersOnce = async () => {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    const data = snapshot.val();
    const orders = data ? Object.keys(data).map(key => ({
      firebaseId: key,
      ...data[key]
    })) : [];
    return orders;
  } catch (error) {
    console.error('Error getting orders:', error);
    throw error;
  }
};

export const updateMenuItem = async (category, firebaseId, itemData) => {
  try {
    const itemRef = ref(database, `menu/${category}/${firebaseId}`);
    await update(itemRef, {
      ...itemData,
      updatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error updating menu item:', error);
    throw error;
  }
};

export const deleteMenuItem = async (category, firebaseId) => {
  try {
    const itemRef = ref(database, `menu/${category}/${firebaseId}`);
    await remove(itemRef);
  } catch (error) {
    console.error('Error deleting menu item:', error);
    throw error;
  }
};

// Analytics and stats
export const getOrdersByDateRange = async (startDate, endDate) => {
  try {
    const ordersRef = ref(database, 'orders');
    const ordersQuery = query(
      ordersRef,
      orderByChild('createdAt')
    );
    
    const snapshot = await get(ordersQuery);
    const data = snapshot.val();
    
    if (!data) return [];
    
    const orders = Object.keys(data).map(key => ({
      firebaseId: key,
      ...data[key]
    }));
    
    // Filter by date range on the client side
    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      return orderDate >= startDate && orderDate <= endDate;
    });
  } catch (error) {
    console.error('Error getting orders by date range:', error);
    throw error;
  }
};

export const getOrderStats = async () => {
  try {
    const ordersRef = ref(database, 'orders');
    const snapshot = await get(ordersRef);
    const data = snapshot.val();
    
    if (!data) {
      return {
        totalOrders: 0,
        totalRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0
      };
    }
    
    const orders = Object.values(data);
    
    return {
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum, order) => sum + (order.total || 0), 0),
      pendingOrders: orders.filter(order => order.status === 'pending').length,
      completedOrders: orders.filter(order => order.status === 'completed').length
    };
  } catch (error) {
    console.error('Error getting order stats:', error);
    throw error;
  }
};

// Customer data
export const saveCustomerFeedback = async (feedbackData) => {
  try {
    const feedbackRef = ref(database, 'feedback');
    const newFeedbackRef = push(feedbackRef);
    await set(newFeedbackRef, {
      ...feedbackData,
      firebaseId: newFeedbackRef.key,
      createdAt: new Date().toISOString()
    });
    return newFeedbackRef.key;
  } catch (error) {
    console.error('Error saving feedback:', error);
    throw error;
  }
};

export const getFeedback = (callback) => {
  const feedbackRef = ref(database, 'feedback');
  return onValue(feedbackRef, (snapshot) => {
    const data = snapshot.val();
    const feedback = data ? Object.keys(data).map(key => ({
      firebaseId: key,
      ...data[key]
    })) : [];
    callback(feedback);
  });
};
