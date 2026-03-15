import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { ShoppingCart, MapPin, Phone, Clock, User, ChefHat, DollarSign, Package, Star, Utensils, Coffee, Beef, Lock, Timer, CheckCircle, Search, Filter, Calendar, BarChart3, PieChart, TrendingUp, Menu, X } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, Pie } from 'recharts';
import { 
  saveOrder, 
  getOrders, 
  updateOrderStatus, 
  getMenuOnce, 
  getOrdersOnce,
  saveMenuItem, 
  updateMenuItem, 
  deleteMenuItem,
  getOrderStats,
  saveCustomerFeedback 
} from './services/databaseService';

// Move components outside to prevent re-definition on every render
const CustomizationModal = ({ 
  showCustomizationModal, 
  setShowCustomizationModal, 
  selectedItem, 
  selectedCategory, 
  customizationOptions, 
  setCustomizationOptions, 
  addToCart, 
  setCurrentPage, 
  setShowOrderForm,
  handleQuickOrder 
}) => {
  if (!showCustomizationModal || !selectedItem) return null;

  const getCustomizationTitle = () => {
    if (['thali', 'miniThali', 'paneer', 'veg'].includes(selectedCategory)) {
      return 'Choose your bread option:';
    }
    if (selectedCategory === 'kulcha') {
      return 'Choose your curry:';
    }
    return '';
  };

  const getCustomizationOptions = () => {
    if (['thali', 'miniThali', 'paneer', 'veg'].includes(selectedCategory)) {
      return [
        { id: 'phulka', name: 'Phulka Roti', price: 0 },
        { id: 'tandoori', name: 'Tandoori Roti', price: 0 },
        { id: 'naan', name: 'Naan', price: 0 }
      ];
    }
    if (selectedCategory === 'kulcha') {
      return [
        { id: 'dal_makhani', name: 'Dal Makhani', price: 0 },
        { id: 'chole', name: 'Chole', price: 0 }
      ];
    }
    return [];
  };

  const handleOptionSelect = (optionId) => {
    setCustomizationOptions({ selectedOption: optionId });
  };

  const handleAddToCart = () => {
    const options = getCustomizationOptions();
    const selectedOption = options.find(opt => opt.id === customizationOptions.selectedOption);
    
    const customizedItem = {
      ...selectedItem,
      price: selectedItem.price + (selectedOption?.price || 0),
      customization: selectedOption?.name || '',
      displayName: selectedOption ? `${selectedItem.name} with ${selectedOption.name}` : selectedItem.name
    };
    
    addToCart(customizedItem, selectedCategory);
    setShowCustomizationModal(false);
    setCustomizationOptions({});
  };

  const handleOrderNow = () => {
    const options = getCustomizationOptions();
    const selectedOption = options.find(opt => opt.id === customizationOptions.selectedOption);
    
    const customizations = {
      [selectedCategory === 'kulcha' ? 'curryType' : 'breadType']: selectedOption?.name || ''
    };
    
    handleQuickOrder(selectedItem, selectedCategory, customizations);
    setShowCustomizationModal(false);
    setCustomizationOptions({});
  };

  const handleClose = () => {
    setShowCustomizationModal(false);
    setCustomizationOptions({});
  };

  const options = getCustomizationOptions();
  const selectedOption = options.find(opt => opt.id === customizationOptions.selectedOption);
  const totalPrice = selectedItem.price + (selectedOption?.price || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-full overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Utensils className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">Customize Your Order</h3>
          <h4 className="text-lg font-semibold text-orange-600">{selectedItem.name}</h4>
          <p className="text-gray-600 text-sm md:text-base">{getCustomizationTitle()}</p>
        </div>

        <div className="space-y-3 mb-6">
          {options.map((option) => (
            <label 
              key={option.id}
              className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition-all ${
                customizationOptions.selectedOption === option.id 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-200 hover:border-orange-300'
              }`}
            >
              <div className="flex items-center">
                <input
                  type="radio"
                  name="customization"
                  value={option.id}
                  checked={customizationOptions.selectedOption === option.id}
                  onChange={() => handleOptionSelect(option.id)}
                  className="mr-3 text-orange-600 focus:ring-orange-500"
                />
                <span className="font-medium">{option.name}</span>
              </div>
              {option.price > 0 && (
                <span className="text-orange-600 font-semibold">+₹{option.price}</span>
              )}
            </label>
          ))}
        </div>

        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-gray-800">Total Price:</span>
            <span className="text-xl font-bold text-orange-600">₹{totalPrice}</span>
          </div>
          {selectedOption && (
            <p className="text-sm text-gray-600 mt-1">
              {selectedItem.name} with {selectedOption.name}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors touch-target"
          >
            Cancel
          </button>
          <button
            onClick={handleAddToCart}
            disabled={!customizationOptions.selectedOption}
            className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors touch-target disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Add to Cart
          </button>
          <button
            onClick={handleOrderNow}
            disabled={!customizationOptions.selectedOption}
            className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors touch-target font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Order Now
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminLogin = ({ showAdminLogin, setShowAdminLogin, adminCredentials, setAdminCredentials, setIsAdmin, setCurrentPage }) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (adminCredentials.username === 'admin' && adminCredentials.password === 'password') {
      setIsAdmin(true);
      setShowAdminLogin(false);
      setCurrentPage('admin');
      setAdminCredentials({ username: '', password: '' });
    } else {
      alert('Invalid credentials! Please try again.');
    }
  }, [adminCredentials, setIsAdmin, setShowAdminLogin, setCurrentPage, setAdminCredentials]);

  const handleClose = useCallback(() => {
    setShowAdminLogin(false);
    setAdminCredentials({ username: '', password: '' });
  }, [setShowAdminLogin, setAdminCredentials]);

  if (!showAdminLogin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-full overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Lock className="w-8 h-8 text-orange-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">Admin Login</h3>
          <p className="text-gray-600 text-sm md:text-base">Please enter your credentials</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({...prev, username: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({...prev, password: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors touch-target"
            >
              Login
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            Demo Credentials: admin / password
          </p>
        </div>
      </div>
    </div>
  );
};

const ChefLogin = ({ showChefLogin, setShowChefLogin, adminCredentials, setAdminCredentials, setIsChef, setCurrentPage }) => {
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    if (adminCredentials.username === 'chef' && adminCredentials.password === 'kitchen') {
      setIsChef(true);
      setShowChefLogin(false);
      setCurrentPage('chef');
      setAdminCredentials({ username: '', password: '' });
    } else {
      alert('Invalid credentials! Please try again.');
    }
  }, [adminCredentials, setIsChef, setShowChefLogin, setCurrentPage, setAdminCredentials]);

  const handleClose = useCallback(() => {
    setShowChefLogin(false);
    setAdminCredentials({ username: '', password: '' });
  }, [setShowChefLogin, setAdminCredentials]);

  if (!showChefLogin) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-full overflow-y-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ChefHat className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800">Chef Login</h3>
          <p className="text-gray-600 text-sm md:text-base">Kitchen Access Portal</p>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={adminCredentials.username}
                onChange={(e) => setAdminCredentials(prev => ({...prev, username: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter username"
                required
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={adminCredentials.password}
                onChange={(e) => setAdminCredentials(prev => ({...prev, password: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter password"
                required
                autoComplete="current-password"
              />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors touch-target"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors touch-target"
            >
              Enter Kitchen
            </button>
          </div>
        </form>
        
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs text-gray-500 text-center">
            Demo Credentials: chef / kitchen
          </p>
        </div>
      </div>
    </div>
  );
};

// Order Confirmation Component
const OrderConfirmation = ({ order, onClose, onTrackOrders }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatEstimatedTime = (estimatedTime) => {
    if (!estimatedTime) return '15 mins';
    const time = new Date(estimatedTime);
    return time.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600';
      case 'preparing': return 'text-blue-600';
      case 'ready': return 'text-green-600';
      case 'completed': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Received - Starting Soon';
      case 'preparing': return 'Cooking in Progress';
      case 'ready': return 'Ready for Pickup';
      case 'completed': return 'Order Completed';
      default: return 'Processing';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h2>
          <p className="text-gray-600">
            Thank you <span className="font-semibold text-orange-600">{order.customerName}</span>! 
            Your delicious meal is being prepared with love.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-orange-50 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Order ID:</span>
            <span className="font-bold text-orange-600">#{order.id.toString().slice(-6)}</span>
          </div>
          
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">Total Amount:</span>
            <span className="font-bold text-gray-800">₹{order.total}</span>
          </div>

          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`font-semibold ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
          </div>

          {/* Estimated Time */}
          <div className="text-center py-4 bg-white rounded-lg border-2 border-orange-200">
            <p className="text-sm text-gray-600 mb-1">Estimated preparation time:</p>
            <p className="text-3xl font-bold text-orange-600">
              {formatEstimatedTime(order.estimatedTime)}
            </p>
          </div>
        </div>

        {/* Items Summary */}
        <div className="mb-6">
          <h4 className="font-semibold text-gray-800 mb-2">Your Order:</h4>
          <div className="space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between items-center text-sm">
                <span className="text-gray-700">{item.displayName || item.name}</span>
                <span className="font-medium">₹{item.price}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col space-y-3">
          <button
            onClick={() => {
              onTrackOrders();
              onClose();
            }}
            className="w-full bg-orange-600 text-white py-3 px-6 rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            Track Order Status
          </button>
          
          <button
            onClick={onClose}
            className="w-full bg-gray-200 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Continue Shopping
          </button>
        </div>

        <div className="text-center mt-4 text-sm text-gray-500">
          We'll have your fresh, hot meal ready soon. Thank you for choosing Naan Stop! 🍽️
        </div>
      </div>
    </div>
  );
};

// Order Tracking Component
const OrderTracking = ({ 
  setCurrentPage, 
  setTrackingPhone, 
  trackOrdersByPhone, 
  trackingPhone, 
  customerOrders 
}) => {
  const [phoneInput, setPhoneInput] = useState('');
  const [searchPerformed, setSearchPerformed] = useState(false);

  const handleSearch = () => {
    if (phoneInput.trim()) {
      setTrackingPhone(phoneInput.trim());
      trackOrdersByPhone(phoneInput.trim());
      setSearchPerformed(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'preparing': return <ChefHat className="w-5 h-5 text-blue-500" />;
      case 'ready': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'completed': return <Package className="w-5 h-5 text-gray-500" />;
      default: return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'border-yellow-200 bg-yellow-50';
      case 'preparing': return 'border-blue-200 bg-blue-50';
      case 'ready': return 'border-green-200 bg-green-50';
      case 'completed': return 'border-gray-200 bg-gray-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  const calculateTimeElapsed = (orderTime) => {
    if (!orderTime) return '';
    const elapsed = Math.floor((new Date() - new Date(orderTime)) / (1000 * 60));
    if (elapsed < 60) return `${elapsed} min ago`;
    const hours = Math.floor(elapsed / 60);
    const minutes = elapsed % 60;
    return `${hours}h ${minutes}m ago`;
  };

  return (
    <div className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Track Your Orders</h2>
            <p className="text-gray-600">Enter your phone number to view all your order details and status</p>
          </div>

          {/* Phone Input */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Enter your phone number"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={handleSearch}
                  disabled={!phoneInput.trim()}
                  className="w-full sm:w-auto bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
                >
                  <Search className="w-5 h-5 inline mr-2" />
                  Search Orders
                </button>
              </div>
            </div>
          </div>

          {/* Results */}
          {searchPerformed && (
            <div className="bg-white rounded-lg shadow-md p-6">
              {customerOrders.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No Orders Found</h3>
                  <p className="text-gray-500">
                    {phoneInput ? `No orders found for ${phoneInput}` : 'Please enter a phone number to search'}
                  </p>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    Orders for {trackingPhone} ({customerOrders.length} {customerOrders.length === 1 ? 'order' : 'orders'})
                  </h3>
                  
                  <div className="space-y-4">
                    {customerOrders.map((order) => (
                      <div key={order.id} className={`border-2 rounded-lg p-4 ${getStatusColor(order.status)}`}>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3">
                          <div className="flex items-center mb-2 sm:mb-0">
                            {getStatusIcon(order.status)}
                            <div className="ml-3">
                              <h4 className="font-semibold text-gray-800">
                                Order #{order.id.toString().slice(-6)}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                              </p>
                            </div>
                          </div>
                          <div className="text-left sm:text-right">
                            <p className="font-bold text-gray-800">₹{order.total}</p>
                            <p className="text-sm text-gray-500">
                              {calculateTimeElapsed(order.orderTime)}
                            </p>
                          </div>
                        </div>

                        {/* Order Items */}
                        <div className="mb-3">
                          <h5 className="font-medium text-gray-700 mb-2">Items:</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {order.items.map((item, index) => (
                              <div key={index} className="flex justify-between items-center text-sm bg-white rounded px-3 py-2">
                                <span className="text-gray-700">{item.displayName || item.name}</span>
                                <span className="font-medium">₹{item.price}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Order Timeline */}
                        <div className="text-sm text-gray-600">
                          <p>Ordered: {order.timestamp}</p>
                          {order.estimatedTime && order.status === 'pending' && (
                            <p>Estimated ready time: {new Date(order.estimatedTime).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit',
                              hour12: false 
                            })}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Back Button */}
          <div className="text-center mt-6">
            <button
              onClick={() => setCurrentPage('home')}
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const CustomerDetailsForm = ({ showOrderForm, setShowOrderForm, customerDetails, setCustomerDetails, cart, placeOrderWithDetails }) => {
  const [phoneError, setPhoneError] = useState('');

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    if (!phone) {
      return 'Phone number is required';
    }
    if (!phoneRegex.test(phone)) {
      return 'Phone number must be exactly 10 digits';
    }
    return '';
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Remove non-digit characters
    if (value.length <= 10) {
      setCustomerDetails(prev => ({...prev, phone: value}));
      setPhoneError(validatePhone(value));
    }
  };

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    const phoneValidationError = validatePhone(customerDetails.phone);
    setPhoneError(phoneValidationError);
    
    if (customerDetails.name.trim() && customerDetails.phone.trim() && !phoneValidationError) {
      placeOrderWithDetails();
    }
  }, [customerDetails, placeOrderWithDetails]);

  const handleClose = useCallback(() => {
    setShowOrderForm(false);
    setCustomerDetails({ name: '', phone: '' });
    setPhoneError('');
  }, [setShowOrderForm, setCustomerDetails]);

  if (!showOrderForm) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 md:p-8 max-w-md w-full max-h-full overflow-y-auto">
        <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2 text-center">Almost Done! 🍽️</h3>
        <p className="text-gray-600 mb-6 text-center text-sm md:text-base">
          Please provide your details to confirm your delicious order
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => setCustomerDetails(prev => ({...prev, name: e.target.value}))}
                className="w-full border border-gray-300 rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder="Enter your name"
                required
                autoComplete="name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={handlePhoneChange}
                className={`w-full border rounded-lg px-3 py-3 md:py-2 text-base focus:outline-none focus:ring-2 transition-colors ${
                  phoneError 
                    ? 'border-red-500 focus:ring-red-500 bg-red-50' 
                    : 'border-gray-300 focus:ring-orange-500'
                }`}
                placeholder="Enter 10-digit phone number"
                required
                autoComplete="tel"
                maxLength="10"
                pattern="[0-9]{10}"
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">⚠️</span>
                  {phoneError}
                </p>
              )}
              {customerDetails.phone && !phoneError && customerDetails.phone.length === 10 && (
                <p className="text-green-500 text-xs mt-1 flex items-center">
                  <span className="mr-1">✅</span>
                  Valid phone number
                </p>
              )}
            </div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Order Total:</span>
              <span className="text-xl font-bold text-orange-600">
                ₹{cart.reduce((sum, item) => sum + item.price, 0)}
              </span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {cart.length} item{cart.length !== 1 ? 's' : ''} in your order
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 bg-gray-600 text-white py-3 px-4 rounded-lg hover:bg-gray-700 transition-colors touch-target"
            >
              Back to Cart
            </button>
            <button
              type="submit"
              disabled={!customerDetails.name.trim() || phoneError || customerDetails.phone.length !== 10}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold touch-target transition-colors ${
                !customerDetails.name.trim() || phoneError || customerDetails.phone.length !== 10
                  ? 'bg-gray-400 cursor-not-allowed text-white'
                  : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              Confirm Order 🚀
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Timer component for order tracking
const OrderTimer = ({ order, setCurrentOrder }) => {
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (order && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsCompleted(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [order, timeLeft]);

  const formatTime = useCallback((seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, []);

  const handleClose = useCallback(() => {
    setCurrentOrder(null);
  }, [setCurrentOrder]);

  if (!order) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        {!isCompleted ? (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Timer className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Confirmed!</h3>
            <p className="text-gray-600 mb-4">
              Thank you <span className="font-semibold text-orange-600">{order.customerName}</span>! 
              Your delicious meal is being prepared with love.
            </p>
            <div className="bg-orange-50 rounded-lg p-4 mb-4">
              <p className="text-sm text-gray-600 mb-2">Estimated preparation time:</p>
              <div className="text-3xl font-bold text-orange-600 mb-2">{formatTime(timeLeft)}</div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${((600 - timeLeft) / 600) * 100}%` }}
                ></div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-4">
              Order ID: #{order.id.toString().slice(-6)}
            </p>
            <p className="text-sm text-gray-600">
              We'll have your fresh, hot meal ready soon. Thank you for choosing Naan Stop! 🍽️
            </p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">Order Ready!</h3>
            <p className="text-gray-600 mb-4">
              <span className="font-semibold text-orange-600">{order.customerName}</span>, 
              your delicious meal is ready for pickup! 
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Please visit our counter with Order ID: #{order.id.toString().slice(-6)}
            </p>
            <p className="text-lg font-semibold text-green-600">
              Enjoy your meal! 🎉
            </p>
          </>
        )}
        <button
          onClick={handleClose}
          className="mt-6 bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};

const NaanStopWebsite = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChef, setIsChef] = useState(false);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [currentOrder, setCurrentOrder] = useState(null);
  const [adminCredentials, setAdminCredentials] = useState({ username: '', password: '' });
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [showChefLogin, setShowChefLogin] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', phone: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customizationOptions, setCustomizationOptions] = useState({});
  const [orderFormData, setOrderFormData] = useState({ name: '', phone: '' });
  const [orderStats, setOrderStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    dailyOrders: [],
    popularItems: []
  });
  const [showOrderConfirmation, setShowOrderConfirmation] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [showOrderTracking, setShowOrderTracking] = useState(false);
  const [trackingPhone, setTrackingPhone] = useState('');
  const [customerOrders, setCustomerOrders] = useState([]);

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('Starting data load...');
      
      try {
        // Load menu items using promise-based method
        console.log('Loading menu data...');
        const menuData = await getMenuOnce();
        console.log('Menu data received:', menuData);
        
        if (menuData && Object.keys(menuData).length > 0) {
          // Flatten the menu data for state
          const allMenuItems = [];
          Object.keys(menuData).forEach(category => {
            menuData[category].forEach(item => {
              allMenuItems.push({ ...item, category });
            });
          });
          console.log('Setting menu items:', allMenuItems);
          setMenuItems(allMenuItems);
        } else {
          // Initialize with default menu if no data exists
          console.log('No menu data found, initializing default menu...');
          await initializeDefaultMenuLocally();
        }

        // Load initial orders
        console.log('Loading orders...');
        const ordersData = await getOrdersOnce();
        console.log('Orders data received:', ordersData);
        setOrders(ordersData);

        // Set up real-time listener for orders after initial load
        const unsubscribeOrders = getOrders((updatedOrders) => {
          console.log('Real-time orders update:', updatedOrders);
          setOrders(updatedOrders);
        });

        // Load order statistics
        console.log('Loading order statistics...');
        const stats = await getOrderStats();
        if (stats) {
          setOrderStats(stats);
        }

        setError(null);
        setIsLoading(false);
        console.log('Data loading completed successfully');
        
        // Return cleanup function
        return () => {
          if (unsubscribeOrders) {
            unsubscribeOrders();
          }
        };
      } catch (err) {
        console.error('Error loading data:', err);
        
        // Fallback to default menu if Firebase fails
        console.log('Firebase failed, using fallback menu...');
        await initializeDefaultMenuLocally();
        
        setError('Using offline mode. Some features may be limited.');
        setIsLoading(false);
      }
    };

    let cleanup;
    loadData().then(cleanupFn => {
      cleanup = cleanupFn;
    });
    
    // Cleanup on unmount
    return () => {
      if (cleanup && typeof cleanup === 'function') {
        cleanup();
      }
    };
  }, []);

  // Fallback function to set menu locally if Firebase fails
  const initializeDefaultMenuLocally = async () => {
    const defaultMenuItems = [
      // Thali Stop items
      { id: 'paneer-thali', name: 'Paneer Thali', price: 180, category: 'thali', desc: 'Paneer bhaji, masala dal fry, rice, sweet roti, roti-2, phulka-4' },
      { id: 'veg-thali', name: 'Veg Thali', price: 140, category: 'thali', desc: 'Mix veg, dal fry, rice, sweet roti, roti-2, phulka-4' },
      { id: 'punjabi-thali', name: 'Punjabi Thali', price: 160, category: 'thali', desc: 'Kaahai paneer, chole, mix veg, sweet roti' },
      { id: 'special-thali', name: 'Special Thali', price: 170, category: 'thali', desc: 'Gopi paneer sabji, jeera rice, papad' },
      
      // Mini Thali Stop items
      { id: 'paneer-mini-thali', name: 'Paneer Mini Thali', price: 130, category: 'miniThali', desc: 'Paneer bhaji mix, khichdi rice, phulka-3' },
      { id: 'veg-mini-thali', name: 'Veg Mini Thali', price: 120, category: 'miniThali', desc: 'Mix veg, dal fry, khichdi rice, phulka-3' },
      { id: 'punjabi-mini-thali', name: 'Punjabi Mini Thali', price: 130, category: 'miniThali', desc: 'Khadhi paneer dal fry, rice, roti, phulka-3' },
      
      // Paneer Specialties
      { id: 'kadai-paneer', name: 'Kadai Paneer', price: 180, category: 'paneer' },
      { id: 'paneer-tikka-masala', name: 'Paneer Tikka Masala', price: 180, category: 'paneer' },
      { id: 'mutter-paneer', name: 'Mutter Paneer', price: 180, category: 'paneer' },
      { id: 'palak-paneer', name: 'Palak Paneer', price: 180, category: 'paneer' },
      { id: 'paneer-butter-masala', name: 'Paneer Butter Masala', price: 190, category: 'paneer' },
      
      // Vegetable Dishes
      { id: 'mix-veg', name: 'Mix Veg', price: 160, category: 'veg' },
      { id: 'aloo-gobi', name: 'Aloo Gobi', price: 160, category: 'veg' },
      { id: 'bhindi-masala', name: 'Bhindi Masala', price: 160, category: 'veg' },
      { id: 'jeera-aloo', name: 'Jeera Aloo', price: 130, category: 'veg' },
      
      // Dal Stop items
      { id: 'dal-fry', name: 'Dal Fry', price: 120, category: 'dal' },
      { id: 'dal-tadka', name: 'Dal Tadka', price: 130, category: 'dal' },
      { id: 'dal-makhani', name: 'Dal Makhani', price: 130, category: 'dal' },
      { id: 'rajma', name: 'Rajma', price: 130, category: 'dal' },
      
      // Bread items
      { id: 'tandoor-roti', name: 'Plain Tandoor Roti', price: 20, category: 'breads' },
      { id: 'butter-roti', name: 'Butter Tandoor Roti', price: 25, category: 'breads' },
      { id: 'plain-naan', name: 'Plain Naan', price: 30, category: 'breads' },
      { id: 'butter-naan', name: 'Butter Naan', price: 40, category: 'breads' },
      { id: 'garlic-naan', name: 'Garlic Naan', price: 50, category: 'breads' },
      
      // Rice & Biryani items
      { id: 'steam-rice', name: 'Steam Rice', price: 80, category: 'rice' },
      { id: 'jeera-rice', name: 'Jeera Rice', price: 100, category: 'rice' },
      { id: 'veg-pulao', name: 'Veg Pulao', price: 120, category: 'rice' },
      { id: 'veg-biryani', name: 'Veg Biryani', price: 130, category: 'rice' },
      
      // Kulcha Stop items
      { id: 'aloo-kulcha', name: 'Aloo Kulcha', price: 80, category: 'kulcha' },
      { id: 'paneer-kulcha', name: 'Paneer Kulcha', price: 100, category: 'kulcha' },
      { id: 'mix-kulcha', name: 'Mix Kulcha', price: 90, category: 'kulcha' },
      { id: 'gobi-kulcha', name: 'Gobi Kulcha', price: 90, category: 'kulcha' },
      
      // Chole Bhature
      { id: 'chole-bhature', name: 'Chole Bhature', price: 100, category: 'choleBhature' },
      { id: 'paneer-chole-bhature', name: 'Paneer Chole Bhature', price: 120, category: 'choleBhature' },
      
      // Beverages/Drinks
      { id: 'pepsi', name: 'Pepsi', price: 15, category: 'drinks' },
      { id: 'seven-up', name: '7 Up', price: 15, category: 'drinks' },
      { id: 'mirinda', name: 'Mirinda', price: 15, category: 'drinks' },
      { id: 'masala-chai', name: 'Masala Chai', price: 15, category: 'beverages' },
      { id: 'coffee', name: 'Coffee', price: 20, category: 'beverages' },
      { id: 'lassi', name: 'Lassi', price: 30, category: 'beverages' }
    ];

    console.log('Setting local fallback menu items:', defaultMenuItems);
    setMenuItems(defaultMenuItems);
  };

  // Load data from Firebase on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      console.log('Starting data load...');
      
      try {
        // For now, let's use the fallback menu directly
        console.log('Using fallback menu...');
        await initializeDefaultMenuLocally();
        
        setError(null);
        setIsLoading(false);
        console.log('Data loading completed successfully');
      } catch (err) {
        console.error('Error loading data:', err);
        setError('Failed to load menu items.');
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  // Sample data for charts
  const generateChartData = useCallback(() => {
    const today = new Date();
    const chartData = [];
    
    if (!orders || !Array.isArray(orders)) {
      // Return empty chart data if orders is not available
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        chartData.push({
          date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          orders: 0,
          revenue: 0
        });
      }
      return chartData;
    }
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOrders = (orders || []).filter(order => {
        if (!order || !order.timestamp) return false;
        const orderDate = new Date(order.timestamp);
        return orderDate.toDateString() === date.toDateString();
      });
      chartData.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        orders: dayOrders.length,
        revenue: dayOrders.reduce((sum, order) => sum + (order.total || 0), 0)
      });
    }
    return chartData;
  }, [orders]);

  const categoryData = useCallback(() => {
    const categories = {};
    if (orders && Array.isArray(orders)) {
      orders.forEach(order => {
        if (order && order.items && Array.isArray(order.items)) {
          order.items.forEach(item => {
            if (item && item.category) {
              categories[item.category] = (categories[item.category] || 0) + 1;
            }
          });
        }
      });
    }
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  }, [orders]);

  const COLORS = ['#ea580c', '#dc2626', '#d97706', '#ca8a04', '#65a30d', '#059669', '#0891b2', '#0284c7'];

  // Group menu items by category
  const menuData = useMemo(() => {
    const groupedMenu = {
      thali: [],
      miniThali: [],
      paneer: [],
      veg: [],
      dal: [],
      breads: [],
      rice: [],
      kulcha: [],
      choleBhature: [],
      drinks: [],
      beverages: []
    };
    
    menuItems.forEach(item => {
      if (item.category && groupedMenu[item.category]) {
        groupedMenu[item.category].push(item);
      }
    });
    
    return groupedMenu;
  }, [menuItems]);
  const addToCart = useCallback((item, category) => {
    const cartItem = { ...item, category, id: Date.now() + Math.random() };
    setCart(prev => [...prev, cartItem]);
  }, []);

  const handleItemClick = useCallback((item, category) => {
    // Check if item needs customization
    const needsCustomization = ['thali', 'miniThali', 'paneer', 'veg', 'kulcha'].includes(category);
    
    if (needsCustomization) {
      setSelectedItem(item);
      setSelectedCategory(category);
      setShowCustomizationModal(true);
    } else {
      // Add directly to cart for items that don't need customization
      addToCart(item, category);
    }
  }, [addToCart]);

  const removeFromCart = useCallback((id) => {
    setCart(prev => prev.filter(item => item.id !== id));
  }, []);

  const placeOrder = useCallback(() => {
    if (cart.length === 0) return;
    setShowOrderForm(true);
  }, [cart.length]);

  const placeOrderWithDetails = useCallback(async () => {
    try {
      const order = {
        id: Date.now(),
        items: [...cart],
        total: cart.reduce((sum, item) => sum + item.price, 0),
        status: 'pending',
        timestamp: new Date().toLocaleString(),
        orderTime: new Date(),
        customerName: customerDetails.name,
        customerPhone: customerDetails.phone,
        estimatedTime: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now
      };
      
      // Save order to Firebase
      await saveOrder(order);
      
      // Update local state
      setOrders(prev => [...prev, order]);
      setCart([]);
      setShowOrderForm(false);
      setCurrentOrder(order);
      setCustomerDetails({ name: '', phone: '' });
      
      // Show order confirmation
      setConfirmedOrder(order);
      setShowOrderConfirmation(true);
      
      // Refresh order statistics
      const stats = await getOrderStats();
      if (stats) {
        setOrderStats(stats);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    }
  }, [cart, customerDetails]);

  const updateOrderStatusHandler = useCallback(async (orderId, status) => {
    try {
      await updateOrderStatus(orderId, status);
      setOrders(prev => prev.map(order => 
        order.id === orderId ? { ...order, status } : order
      ));
    } catch (error) {
      console.error('Error updating order status:', error);
      setError('Failed to update order status.');
    }
  }, []);

  // Handle feedback submission
  const submitFeedback = useCallback(async (orderId, rating, comment) => {
    try {
      const feedback = {
        orderId,
        rating,
        comment,
        timestamp: new Date().toISOString(),
        customerName: orders.find(order => order.id === orderId)?.customerName || 'Anonymous'
      };
      
      await saveCustomerFeedback(feedback);
      setError(null);
      return { success: true, message: 'Thank you for your feedback!' };
    } catch (error) {
      console.error('Error submitting feedback:', error);
      setError('Failed to submit feedback. Please try again.');
      return { success: false, message: 'Failed to submit feedback.' };
    }
  }, [orders]);

  // Handle quick order (direct order without cart)
  const handleQuickOrder = useCallback((item, category, customizations = {}) => {
    const orderItem = { 
      ...item, 
      category, 
      id: Date.now() + Math.random(),
      customizations 
    };
    
    // If item has customizations, add them to the display name
    if (customizations.breadType) {
      orderItem.displayName = `${item.name} with ${customizations.breadType}`;
    } else if (customizations.curryType) {
      orderItem.displayName = `${item.name} with ${customizations.curryType}`;
    } else {
      orderItem.displayName = item.name;
    }
    
    setCart([orderItem]); // Set cart with just this item
    setShowOrderForm(true); // Show order form directly
  }, []);

  // Track customer orders by phone number
  const trackOrdersByPhone = useCallback((phone) => {
    if (!phone.trim()) {
      setCustomerOrders([]);
      return;
    }
    
    const userOrders = (orders || []).filter(order => 
      order && order.customerPhone === phone.trim()
    ).sort((a, b) => new Date(b.orderTime) - new Date(a.orderTime));
    
    setCustomerOrders(userOrders);
  }, [orders]);

  // Filter orders based on search and filters
  const filteredOrders = (orders || []).filter(order => {
    if (!order) return false;
    
    const matchesSearch = searchTerm === '' || 
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.includes(searchTerm)) ||
      (order.id && order.id.toString().includes(searchTerm));
    
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    
    const matchesDate = dateFilter === 'all' || (() => {
      if (!order.timestamp) return false;
      const orderDate = new Date(order.timestamp);
      const today = new Date();
      switch(dateFilter) {
        case 'today':
          return orderDate.toDateString() === today.toDateString();
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          return orderDate.toDateString() === yesterday.toDateString();
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          return orderDate >= weekAgo;
        default:
          return true;
      }
    })();
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  const MenuSection = ({ title, items = [], category, icon: Icon }) => {
    // Categories that need customization
    const needsCustomization = ['thali', 'miniThali', 'paneer', 'veg', 'kulcha'].includes(category);
    
    // Categories that get both Add to Cart and Order Now options
    const hasBothOptions = ['dal', 'choleBhature', 'rice', 'breads'].includes(category);
    
    return (
      <div className="mb-6 md:mb-8">
        <div className="flex items-center mb-3 md:mb-4">
          <Icon className="w-5 h-5 md:w-6 md:h-6 mr-2 text-orange-600" />
          <h3 className="text-lg md:text-2xl font-bold text-gray-800">{title}</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {items && items.length > 0 ? items.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-gray-800 text-sm md:text-base">{item.name}</h4>
                <span className="text-lg font-bold text-orange-600 ml-2 flex-shrink-0">₹{item.price}</span>
              </div>
              {item.desc && (
                <p className="text-xs md:text-sm text-gray-600 mb-3">{item.desc}</p>
              )}
              
              {needsCustomization ? (
                <button
                  onClick={() => handleItemClick(item, category)}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors touch-target text-sm md:text-base"
                >
                  Customize & Add
                </button>
              ) : hasBothOptions ? (
                <div className="flex space-x-2">
                  <button
                    onClick={() => addToCart(item, category)}
                    className="flex-1 bg-orange-600 text-white py-2 px-3 rounded-lg hover:bg-orange-700 transition-colors touch-target text-xs md:text-sm"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={() => handleQuickOrder(item, category)}
                    className="flex-1 bg-green-600 text-white py-2 px-3 rounded-lg hover:bg-green-700 transition-colors touch-target text-xs md:text-sm font-semibold"
                  >
                    Order Now
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => addToCart(item, category)}
                  className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors touch-target text-sm md:text-base"
                >
                  Add to Cart
                </button>
              )}
            </div>
          )) : (
            <div className="col-span-full text-center py-8">
              <p className="text-gray-500">No items available in this category yet.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  const HomePage = () => (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">NAAN STOP</h1>
          <p className="text-lg md:text-xl mb-2">PURE VEG</p>
          <p className="text-base md:text-lg mb-8">"Taste the Rich Heritage of North Indian Flavors"</p>
          
          {/* Hero CTA Button */}
          <div className="mb-6 flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setCurrentPage('menu')}
              className="bg-white text-orange-600 hover:bg-orange-50 font-bold py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 shadow-lg touch-target"
            >
              View Menu
            </button>
            <button
              onClick={() => setCurrentPage('cart')}
              className="bg-orange-800 hover:bg-orange-900 text-white font-bold py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 shadow-lg touch-target"
            >
              Quick Order
            </button>
            <button
              onClick={() => setCurrentPage('tracking')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 md:px-8 rounded-lg text-base md:text-lg transition-all transform hover:scale-105 shadow-lg touch-target"
            >
              Track Orders
            </button>
          </div>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
            <div className="flex items-center text-center md:text-left">
              <MapPin className="w-4 h-4 mr-2 flex-shrink-0" />
              <span className="break-words">Balaji food court, near shree in hotel Hinjewadi phase-1</span>
            </div>
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2" />
              <span>7507687563 / 8788619308</span>
            </div>
          </div>
        </div>
      </div>

      {/* Call to Action Section */}
      <div className="py-8 md:py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">Ready to Experience Authentic Flavors?</h2>
          <p className="text-gray-600 text-base md:text-lg mb-6 max-w-2xl mx-auto">
            Discover our delicious North Indian cuisine made with love and traditional recipes. 
            From hearty thalis to flavorful paneer dishes, we have something special for everyone.
          </p>
          <button
            onClick={() => setCurrentPage('menu')}
            className="cta-button pulse-animation text-white font-bold py-4 px-8 md:px-12 rounded-lg text-lg md:text-xl transition-all transform hover:scale-105 touch-target"
          >
            🍽️ Order Now
          </button>
          <div className="mt-4 text-sm text-gray-500">
            Browse our full menu and place your order in minutes!
          </div>
        </div>
      </div>

      {/* Special Offers Section */}
      <div className="py-8 md:py-12 bg-gradient-to-r from-orange-50 to-red-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center text-gray-800 mb-8">Today's Special Offers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                  <Utensils className="w-6 h-6 text-orange-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Thali Special</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">Get any Paneer Thali with complimentary sweet and papad</p>
              <div className="flex justify-between items-center">
                <span className="text-orange-600 font-bold">Starting ₹180</span>
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-orange-700 transition-colors touch-target"
                >
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                  <Clock className="w-6 h-6 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Quick Lunch</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">Mini Thali combo - Perfect for a quick, satisfying meal</p>
              <div className="flex justify-between items-center">
                <span className="text-green-600 font-bold">From ₹120</span>
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700 transition-colors touch-target"
                >
                  Order Now
                </button>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500 hover:shadow-lg transition-shadow">
              <div className="flex items-center mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                  <Star className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Chef's Choice</h3>
              </div>
              <p className="text-gray-600 text-sm mb-3">Try our signature Paneer Butter Masala with fresh naan</p>
              <div className="flex justify-between items-center">
                <span className="text-purple-600 font-bold">₹220 Combo</span>
                <button 
                  onClick={() => setCurrentPage('menu')}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-purple-700 transition-colors touch-target"
                >
                  Order Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Utensils className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Pure Vegetarian</h3>
              <p className="text-gray-600 text-sm md:text-base">100% vegetarian dishes prepared with fresh ingredients</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Quick Service</h3>
              <p className="text-gray-600 text-sm md:text-base">Fast and efficient service for your convenience</p>
            </div>
            <div className="text-center">
              <div className="bg-orange-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Authentic Taste</h3>
              <p className="text-gray-600 text-sm md:text-base">Traditional North Indian flavors and recipes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const MenuPage = () => (
    <div className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-4xl font-bold text-center mb-6 md:mb-8 text-gray-800">Our Menu</h2>
        
        <MenuSection title="Thali Stop" items={menuData.thali} category="thali" icon={Utensils} />
        <MenuSection title="Mini Thali Stop" items={menuData.miniThali} category="miniThali" icon={Coffee} />
        <MenuSection title="Paneer Specialties" items={menuData.paneer} category="paneer" icon={Beef} />
        <MenuSection title="Vegetable Dishes" items={menuData.veg} category="veg" icon={Utensils} />
        <MenuSection title="Dal Stop" items={menuData.dal} category="dal" icon={Coffee} />
        <MenuSection title="Breads" items={menuData.breads} category="breads" icon={Beef} />
        <MenuSection title="Rice & Biryani" items={menuData.rice} category="rice" icon={Utensils} />
        <MenuSection title="Kulcha Stop" items={menuData.kulcha} category="kulcha" icon={Coffee} />
        <MenuSection title="Chole Bhature" items={menuData.choleBhature} category="choleBhature" icon={Beef} />
        <MenuSection title="Cold Drinks" items={menuData.drinks} category="drinks" icon={Coffee} />
      </div>
    </div>
  );

  const CartPage = () => (
    <div className="py-6 md:py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-2xl md:text-3xl font-bold mb-4 md:mb-6">Your Cart</h2>
        {cart.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <p className="text-gray-600 text-lg">Your cart is empty</p>
            <p className="text-gray-500 mb-6">Add some delicious items from our menu!</p>
            <button
              onClick={() => setCurrentPage('menu')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors touch-target"
            >
              Browse Menu
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-white rounded-lg shadow-md p-6">
              {cart.map((item) => (
                <div key={item.id} className="flex justify-between items-center py-3 border-b">
                  <div className="flex-grow min-w-0 mr-4">
                    <h4 className="font-semibold text-sm md:text-base truncate">{item.name}</h4>
                    <p className="text-xs md:text-sm text-gray-600 capitalize">{item.category}</p>
                  </div>
                  <div className="flex items-center space-x-2 md:space-x-4 flex-shrink-0">
                    <span className="font-bold text-sm md:text-base">₹{item.price}</span>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-800 text-xs md:text-sm touch-target px-2 py-1"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              <div className="mt-6 pt-4 border-t">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                  <span className="text-lg md:text-xl font-bold">Total: ₹{cart.reduce((sum, item) => sum + item.price, 0)}</span>
                </div>
                <button
                  onClick={placeOrder}
                  className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 transition-colors text-base md:text-lg font-semibold touch-target"
                >
                  Place Order 🚀
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Chef Dashboard with Order Queue and Timers
  const ChefDashboard = () => {
    const pendingOrders = (orders || []).filter(order => 
      order && 
      order.status && 
      (order.status === 'pending' || order.status === 'preparing')
    );
    
    const OrderCard = ({ order }) => {
      const [timeElapsed, setTimeElapsed] = useState(0);
      
      // Safety check for invalid orders
      if (!order) {
        return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <strong>Error:</strong> Invalid order data
          </div>
        );
      }
      
      useEffect(() => {
        if (!order.orderTime) return;
        
        const timer = setInterval(() => {
          const elapsed = Math.floor((new Date() - new Date(order.orderTime)) / 1000);
          setTimeElapsed(elapsed);
        }, 1000);
        
        return () => clearInterval(timer);
      }, [order.orderTime]);
      
      const formatElapsedTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };
      
      const isUrgent = timeElapsed > 300; // 5 minutes
      
      return (
        <div className={`bg-white rounded-lg shadow-md p-3 md:p-4 border-l-4 ${isUrgent ? 'border-red-500' : 'border-blue-500'}`}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 space-y-2 sm:space-y-0">
            <div className="flex-grow min-w-0">
              <h4 className="font-bold text-base md:text-lg">Order #{order.id ? order.id.toString().slice(-6) : 'N/A'}</h4>
              <p className="text-xs md:text-sm text-gray-600 break-words">{order.customerName || 'Anonymous'} - {order.customerPhone || 'N/A'}</p>
            </div>
            <div className="text-left sm:text-right flex-shrink-0">
              <div className={`text-xl md:text-2xl font-bold ${isUrgent ? 'text-red-600' : 'text-blue-600'}`}>
                {formatElapsedTime(timeElapsed)}
              </div>
              <p className="text-xs text-gray-500">elapsed</p>
            </div>
          </div>
          
          <div className="mb-4">
            <h5 className="font-semibold mb-2">Items to prepare:</h5>
            <ul className="space-y-1">
              {order.items && order.items.length > 0 ? order.items.map((item, idx) => (
                <li key={idx} className="text-sm bg-gray-50 px-2 py-1 rounded">
                  {item.name || 'Unknown Item'} - ₹{item.price || 0}
                </li>
              )) : (
                <li className="text-sm text-gray-500">No items found</li>
              )}
            </ul>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            {order.status === 'pending' && order.id && (
              <button
                onClick={() => updateOrderStatusHandler(order.id, 'preparing')}
                className="flex-1 bg-blue-600 text-white py-3 px-3 rounded text-sm hover:bg-blue-700 touch-target"
              >
                Start Cooking
              </button>
            )}
            {order.status === 'preparing' && order.id && (
              <button
                onClick={() => updateOrderStatusHandler(order.id, 'ready')}
                className="flex-1 bg-green-600 text-white py-3 px-3 rounded text-sm hover:bg-green-700 touch-target"
              >
                Mark Ready
              </button>
            )}
          </div>
        </div>
      );
    };
    
    return (
      <div className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-2xl md:text-3xl font-bold">Kitchen Dashboard</h2>
            <button
              onClick={() => {
                setIsChef(false);
                setCurrentPage('home');
              }}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 touch-target self-start sm:self-auto"
            >
              Exit Kitchen
            </button>
          </div>

          {/* Kitchen Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-yellow-500 text-white p-4 md:p-6 rounded-lg">
              <div className="flex items-center">
                <Timer className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Pending Orders</p>
                  <p className="text-xl md:text-2xl font-bold">{orders ? orders.filter(o => o && o.status === 'pending').length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-blue-500 text-white p-4 md:p-6 rounded-lg">
              <div className="flex items-center">
                <ChefHat className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Preparing</p>
                  <p className="text-xl md:text-2xl font-bold">{orders ? orders.filter(o => o && o.status === 'preparing').length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-500 text-white p-4 md:p-6 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-6 h-6 md:w-8 md:h-8 mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Ready Today</p>
                  <p className="text-xl md:text-2xl font-bold">{orders ? orders.filter(o => o && (o.status === 'ready' || o.status === 'completed')).length : 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Queue */}
          <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
            <h3 className="text-lg md:text-xl font-semibold mb-4">Order Queue</h3>
            {pendingOrders.length === 0 ? (
              <div className="text-center py-8">
                <ChefHat className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No pending orders. Kitchen is caught up! 🎉</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingOrders.map((order, index) => (
                  <OrderCard key={order.id || `order-${index}`} order={order} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  // Enhanced Admin Dashboard with Visualizations
  const AdminDashboard = () => {
    const chartData = generateChartData();
    const categoryChartData = categoryData();
    
    return (
      <div className="py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 space-y-4 sm:space-y-0">
            <h2 className="text-2xl md:text-3xl font-bold">Admin Dashboard</h2>
            <button
              onClick={() => {
                setIsAdmin(false);
                setCurrentPage('home');
              }}
              className="bg-gray-600 text-white px-4 py-3 rounded-lg hover:bg-gray-700 touch-target self-start sm:self-auto"
            >
              Logout
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            <div className="bg-blue-500 text-white p-3 md:p-6 rounded-lg">
              <div className="flex items-center">
                <Package className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Total Orders</p>
                  <p className="text-lg md:text-2xl font-bold">{orders ? orders.length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-green-500 text-white p-3 md:p-6 rounded-lg">
              <div className="flex items-center">
                <DollarSign className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Total Revenue</p>
                  <p className="text-lg md:text-2xl font-bold">₹{orders ? orders.reduce((sum, order) => sum + (order.total || 0), 0) : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-yellow-500 text-white p-3 md:p-6 rounded-lg">
              <div className="flex items-center">
                <Clock className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Pending Orders</p>
                  <p className="text-lg md:text-2xl font-bold">{orders ? orders.filter(o => o && o.status === 'pending').length : 0}</p>
                </div>
              </div>
            </div>
            <div className="bg-purple-500 text-white p-3 md:p-6 rounded-lg">
              <div className="flex items-center">
                <Star className="w-6 h-6 md:w-8 md:h-8 mr-2 md:mr-3" />
                <div>
                  <p className="text-xs md:text-sm opacity-80">Completed</p>
                  <p className="text-lg md:text-2xl font-bold">{orders ? orders.filter(o => o && o.status === 'completed').length : 0}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Orders & Revenue Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="orders" fill="#ea580c" name="Orders" />
                  <Bar dataKey="revenue" fill="#dc2626" name="Revenue (₹)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <PieChart className="w-5 h-5 mr-2" />
                Popular Categories
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <RechartsPieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search orders, customer, phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 w-64 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="preparing">Preparing</option>
                  <option value="ready">Ready</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-500" />
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="week">Last 7 Days</option>
                </select>
              </div>
              
              <div className="text-sm text-gray-500">
                Showing {filteredOrders.length} of {orders.length} orders
              </div>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6 border-b">
              <h3 className="text-xl font-semibold">Orders Management</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredOrders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id.toString().slice(-6)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.customerPhone || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {order.items.map(item => item.name).join(', ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{order.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          order.status === 'preparing' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'ready' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.timestamp}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatusHandler(order.id, e.target.value)}
                          className="text-sm border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                          <option value="pending">Pending</option>
                          <option value="preparing">Preparing</option>
                          <option value="ready">Ready</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No orders found matching your criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Loading State */}
      {isLoading && (
        <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Loading Naan Stop...</p>
          </div>
        </div>
      )}
      
      {/* Error State */}
      {error && (
        <div className="fixed top-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg z-50">
          <div className="flex items-center">
            <span className="mr-2">⚠️</span>
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-4 text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="bg-white shadow-md sticky top-0 z-40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <div 
              className="text-2xl font-bold text-orange-600 cursor-pointer"
              onClick={() => setCurrentPage('home')}
            >
              NAAN STOP
            </div>
            
            {/* Desktop Navigation */}
            <div className="desktop-nav hidden md:flex items-center space-x-6">
              <button
                onClick={() => setCurrentPage('home')}
                className={`hover:text-orange-600 transition-colors ${currentPage === 'home' ? 'text-orange-600' : 'text-gray-700'}`}
              >
                Home
              </button>
              <button
                onClick={() => setCurrentPage('menu')}
                className={`hover:text-orange-600 transition-colors ${currentPage === 'menu' ? 'text-orange-600' : 'text-gray-700'}`}
              >
                Menu
              </button>
              <button
                onClick={() => setCurrentPage('tracking')}
                className={`hover:text-orange-600 transition-colors ${currentPage === 'tracking' ? 'text-orange-600' : 'text-gray-700'}`}
              >
                Track Orders
              </button>
              <button
                onClick={() => setCurrentPage('cart')}
                className={`hover:text-orange-600 flex items-center transition-colors ${currentPage === 'cart' ? 'text-orange-600' : 'text-gray-700'}`}
              >
                <ShoppingCart className="w-5 h-5 mr-1" />
                Cart ({cart.length})
              </button>
              {!isAdmin && !isChef && (
                <>
                  <button
                    onClick={() => setShowChefLogin(true)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center transition-colors"
                  >
                    <ChefHat className="w-4 h-4 mr-2" />
                    Chef
                  </button>
                  <button
                    onClick={() => setShowAdminLogin(true)}
                    className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center transition-colors"
                  >
                    <User className="w-4 h-4 mr-2" />
                    Admin
                  </button>
                </>
              )}
              {isAdmin && (
                <button
                  onClick={() => setCurrentPage('admin')}
                  className={`hover:text-orange-600 flex items-center transition-colors ${currentPage === 'admin' ? 'text-orange-600' : 'text-gray-700'}`}
                >
                  <User className="w-5 h-5 mr-1" />
                  Dashboard
                </button>
              )}
              {isChef && (
                <button
                  onClick={() => setCurrentPage('chef')}
                  className={`hover:text-blue-600 flex items-center transition-colors ${currentPage === 'chef' ? 'text-blue-600' : 'text-gray-700'}`}
                >
                  <ChefHat className="w-5 h-5 mr-1" />
                  Kitchen
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6 text-gray-700" />
              ) : (
                <Menu className="w-6 h-6 text-gray-700" />
              )}
            </button>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 py-4 space-y-2">
              <button
                onClick={() => {
                  setCurrentPage('home');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'home' ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Home
              </button>
              <button
                onClick={() => {
                  setCurrentPage('menu');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'menu' ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Menu
              </button>
              <button
                onClick={() => {
                  setCurrentPage('tracking');
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'tracking' ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                Track Orders
              </button>
              <button
                onClick={() => {
                  setCurrentPage('cart');
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  currentPage === 'cart' ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Cart ({cart.length})
              </button>
              
              {!isAdmin && !isChef && (
                <>
                  <button
                    onClick={() => {
                      setShowChefLogin(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <ChefHat className="w-5 h-5 mr-2" />
                    Chef Login
                  </button>
                  <button
                    onClick={() => {
                      setShowAdminLogin(true);
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center w-full text-left px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                  >
                    <User className="w-5 h-5 mr-2" />
                    Admin Login
                  </button>
                </>
              )}
              
              {isAdmin && (
                <button
                  onClick={() => {
                    setCurrentPage('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentPage === 'admin' ? 'text-orange-600 bg-orange-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <User className="w-5 h-5 mr-2" />
                  Dashboard
                </button>
              )}
              
              {isChef && (
                <button
                  onClick={() => {
                    setCurrentPage('chef');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-colors ${
                    currentPage === 'chef' ? 'text-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChefHat className="w-5 h-5 mr-2" />
                  Kitchen
                </button>
              )}
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      {isAdmin && currentPage === 'admin' ? (
        <AdminDashboard />
      ) : isChef && currentPage === 'chef' ? (
        <ChefDashboard />
      ) : (
        <>
          {currentPage === 'home' && <HomePage />}
          {currentPage === 'menu' && <MenuPage />}
          {currentPage === 'cart' && <CartPage />}
          {currentPage === 'tracking' && (
            <OrderTracking 
              setCurrentPage={setCurrentPage}
              setTrackingPhone={setTrackingPhone}
              trackOrdersByPhone={trackOrdersByPhone}
              trackingPhone={trackingPhone}
              customerOrders={customerOrders}
            />
          )}
        </>
      )}

      {/* Order Confirmation Modal */}
      {showOrderConfirmation && confirmedOrder && (
        <OrderConfirmation
          order={confirmedOrder}
          onClose={() => {
            setShowOrderConfirmation(false);
            setConfirmedOrder(null);
          }}
          onTrackOrders={() => {
            setCurrentPage('tracking');
            setTrackingPhone(confirmedOrder.customerPhone);
            trackOrdersByPhone(confirmedOrder.customerPhone);
          }}
        />
      )}

      {/* Modals */}
      <AdminLogin
        showAdminLogin={showAdminLogin}
        setShowAdminLogin={setShowAdminLogin}
        adminCredentials={adminCredentials}
        setAdminCredentials={setAdminCredentials}
        setIsAdmin={setIsAdmin}
        setCurrentPage={setCurrentPage}
      />
      <ChefLogin
        showChefLogin={showChefLogin}
        setShowChefLogin={setShowChefLogin}
        adminCredentials={adminCredentials}
        setAdminCredentials={setAdminCredentials}
        setIsChef={setIsChef}
        setCurrentPage={setCurrentPage}
      />
      <CustomerDetailsForm
        showOrderForm={showOrderForm}
        setShowOrderForm={setShowOrderForm}
        customerDetails={customerDetails}
        setCustomerDetails={setCustomerDetails}
        cart={cart}
        placeOrderWithDetails={placeOrderWithDetails}
      />
      <CustomizationModal
        showCustomizationModal={showCustomizationModal}
        setShowCustomizationModal={setShowCustomizationModal}
        selectedItem={selectedItem}
        selectedCategory={selectedCategory}
        customizationOptions={customizationOptions}
        setCustomizationOptions={setCustomizationOptions}
        addToCart={addToCart}
        setCurrentPage={setCurrentPage}
        setShowOrderForm={setShowOrderForm}
        handleQuickOrder={handleQuickOrder}
      />
      <OrderTimer
        order={currentOrder}
        setCurrentOrder={setCurrentOrder}
      />
    </div>
  );
};

export default NaanStopWebsite;
