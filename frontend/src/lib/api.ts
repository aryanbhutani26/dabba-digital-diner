const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('auth_token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('auth_token');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(error.error || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error: any) {
      // Check if it's a network error
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        throw new Error('Cannot connect to server. Make sure the backend is running on http://localhost:5000');
      }
      throw error;
    }
  }

  // Auth
  async signUp(email: string, password: string, name: string) {
    const data = await this.request('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(data.token);
    return data;
  }

  async signIn(email: string, password: string) {
    const data = await this.request('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(data.token);
    return data;
  }

  async googleSignIn(credential: string) {
    const data = await this.request('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ credential }),
    });
    this.setToken(data.token);
    return data;
  }

  async getMe() {
    return this.request('/auth/me');
  }

  signOut() {
    this.clearToken();
  }

  // Coupons
  async getCoupons() {
    return this.request('/coupons');
  }

  async getAllCoupons() {
    return this.request('/coupons/all');
  }

  async createCoupon(coupon: any) {
    return this.request('/coupons', {
      method: 'POST',
      body: JSON.stringify(coupon),
    });
  }

  async updateCoupon(id: string, coupon: any) {
    return this.request(`/coupons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(coupon),
    });
  }

  async deleteCoupon(id: string) {
    return this.request(`/coupons/${id}`, {
      method: 'DELETE',
    });
  }

  // Navbar
  async getNavbarItems() {
    return this.request('/navbar');
  }

  async getAllNavbarItems() {
    return this.request('/navbar/all');
  }

  async createNavbarItem(item: any) {
    return this.request('/navbar', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateNavbarItem(id: string, item: any) {
    return this.request(`/navbar/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteNavbarItem(id: string) {
    return this.request(`/navbar/${id}`, {
      method: 'DELETE',
    });
  }

  // Menu
  async getMenuItems() {
    return this.request('/menu');
  }

  async getAllMenuItems() {
    return this.request('/menu/all');
  }

  async createMenuItem(item: any) {
    return this.request('/menu', {
      method: 'POST',
      body: JSON.stringify(item),
    });
  }

  async updateMenuItem(id: string, item: any) {
    return this.request(`/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item),
    });
  }

  async deleteMenuItem(id: string) {
    return this.request(`/menu/${id}`, {
      method: 'DELETE',
    });
  }

  // Settings
  async getSetting(key: string) {
    return this.request(`/settings/${key}`);
  }

  async getAllSettings() {
    return this.request('/settings');
  }

  async updateSetting(key: string, value: any) {
    return this.request(`/settings/${key}`, {
      method: 'PUT',
      body: JSON.stringify({ value }),
    });
  }

  // Orders
  async getMyDeliveries() {
    return this.request('/orders/my-deliveries');
  }

  async getDeliveryStats() {
    return this.request('/orders/delivery-stats');
  }

  async updateOrderStatus(orderId: string, status: string, location?: any) {
    return this.request(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, location }),
    });
  }

  async updateOrderLocation(orderId: string, latitude: number, longitude: number) {
    return this.request(`/orders/${orderId}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async getAllOrders() {
    return this.request('/orders/all');
  }

  async createOrder(order: any) {
    return this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // Users Management
  async getAllUsers() {
    return this.request('/users');
  }

  async getDeliveryBoys() {
    return this.request('/users/delivery-boys');
  }

  async updateUserRole(userId: string, role: string) {
    return this.request(`/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
  }

  async deleteUser(userId: string) {
    return this.request(`/users/${userId}`, {
      method: 'DELETE',
    });
  }

  async createDeliveryBoy(data: any) {
    return this.request('/users/delivery-boy', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async assignDeliveryBoy(orderId: string, deliveryBoyId: string) {
    return this.request(`/orders/${orderId}/assign`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryBoyId }),
    });
  }

  // Promotions
  async getAllPromotions() {
    return this.request('/promotions/all');
  }

  async getActivePromotions() {
    return this.request('/promotions/active');
  }

  // Analytics
  async getTopDishes(period: string = 'week') {
    return this.request(`/analytics/top-dishes?period=${period}`);
  }

  async getRevenue(period: string = 'week') {
    return this.request(`/analytics/revenue?period=${period}`);
  }

  async getDeliveryPerformance() {
    return this.request('/analytics/delivery-performance');
  }

  // Vouchers
  async getAllVouchers() {
    return this.request('/vouchers/all');
  }

  async createVoucher(data: any) {
    return this.request('/vouchers', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async deleteVoucher(id: string) {
    return this.request(`/vouchers/${id}`, {
      method: 'DELETE',
    });
  }

  async validateVoucher(code: string) {
    return this.request('/vouchers/validate', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  }

  async useVoucher(code: string, orderId: string) {
    return this.request('/vouchers/use', {
      method: 'POST',
      body: JSON.stringify({ code, orderId }),
    });
  }

  // Reservations
  async getAllReservations() {
    return this.request('/reservations/all');
  }

  async updateReservationStatus(id: string, status: string) {
    return this.request(`/reservations/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // User Profile
  async getUserProfile() {
    return this.request('/users/profile');
  }

  async updateUserProfile(data: any) {
    return this.request('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async getUserOrders() {
    return this.request('/users/orders');
  }

  async getOrder(orderId: string) {
    return this.request(`/orders/${orderId}`);
  }

  // Dabba Services
  async getDabbaServices() {
    return this.request('/dabba-services');
  }

  async getDabbaServicesAdmin() {
    return this.request('/dabba-services/admin');
  }

  async getServicesVisibility() {
    return this.request('/dabba-services/visibility');
  }

  async createDabbaService(data: any) {
    return this.request('/dabba-services', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDabbaService(id: string, data: any) {
    return this.request(`/dabba-services/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDabbaService(id: string) {
    return this.request(`/dabba-services/${id}`, {
      method: 'DELETE',
    });
  }

  async toggleServicesVisibility(enabled: boolean) {
    return this.request('/dabba-services/toggle-visibility', {
      method: 'POST',
      body: JSON.stringify({ enabled }),
    });
  }

  // Dabba Subscriptions
  async createDabbaSubscription(data: any) {
    return this.request('/dabba-subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyDabbaSubscriptions() {
    return this.request('/dabba-subscriptions/my-subscriptions');
  }

  async updateSubscriptionPaymentStatus(id: string, paymentStatus: string, paymentIntentId?: string) {
    return this.request(`/dabba-subscriptions/${id}/payment-status`, {
      method: 'PUT',
      body: JSON.stringify({ paymentStatus, paymentIntentId }),
    });
  }

  async cancelDabbaSubscription(id: string) {
    return this.request(`/dabba-subscriptions/${id}/cancel`, {
      method: 'PUT',
    });
  }

  async getAllDabbaSubscriptions() {
    return this.request('/dabba-subscriptions/admin/all');
  }

  async getDabbaSubscriptionDetails(id: string) {
    return this.request(`/dabba-subscriptions/admin/${id}`);
  }

  async updateDabbaSubscriptionStatus(id: string, status: string) {
    return this.request(`/dabba-subscriptions/admin/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  }

  // Image Upload
  async getImageKitAuth() {
    return this.request('/upload/auth');
  }

  async uploadImage(file: string, fileName: string, folder?: string) {
    return this.request('/upload/image', {
      method: 'POST',
      body: JSON.stringify({ file, fileName, folder }),
    });
  }

  async deleteImage(fileId: string) {
    return this.request(`/upload/image/${fileId}`, {
      method: 'DELETE',
    });
  }

  // Thermal Printers
  async getThermalPrinterStatus() {
    return this.request('/thermal-printers/status');
  }

  async testThermalPrint(printerId: string) {
    return this.request(`/thermal-printers/test/${printerId}`, {
      method: 'POST',
    });
  }

  async toggleThermalPrinter(printerId: string, enabled: boolean) {
    return this.request(`/thermal-printers/config/${printerId}`, {
      method: 'PUT',
      body: JSON.stringify({ enabled }),
    });
  }

  async processThermalPrintQueue() {
    return this.request('/thermal-printers/queue/process', {
      method: 'POST',
    });
  }

  async clearThermalPrintQueue() {
    return this.request('/thermal-printers/queue', {
      method: 'DELETE',
    });
  }

  // Invoices
  async getInvoiceData(orderId: string) {
    return this.request(`/invoices/${orderId}/data`);
  }

  async getOrdersWithInvoices(limit = 50, offset = 0, status = 'all') {
    return this.request(`/invoices/list?limit=${limit}&offset=${offset}&status=${status}`);
  }

  async reprintOrder(orderId: string, printerType = 'both') {
    return this.request(`/invoices/${orderId}/reprint`, {
      method: 'POST',
      body: JSON.stringify({ printerType }),
    });
  }

  // Get invoice HTML with authentication
  async getInvoiceHtml(orderId: string, type = 'bill') {
    const endpoint = `/invoices/${orderId}/html${type === 'kitchen' ? '?type=kitchen' : ''}`;
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get invoice HTML: ${response.status}`);
    }
    
    return response.text();
  }

  // Download invoice with authentication
  async downloadInvoice(orderId: string, type = 'bill') {
    const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/invoices/${orderId}/download?type=${type}`, {
      headers: {
        'Authorization': `Bearer ${this.token}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to download invoice: ${response.status}`);
    }
    
    return response.blob();
  }

  // Gallery Management
  async getGalleryItems() {
    return this.request('/gallery');
  }

  async getGalleryItemsAdmin() {
    return this.request('/gallery/admin/all');
  }

  async createGalleryItem(data: any) {
    return this.request('/gallery', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateGalleryItem(id: string, data: any) {
    return this.request(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGalleryItem(id: string) {
    return this.request(`/gallery/${id}`, {
      method: 'DELETE',
    });
  }

  async reorderGalleryItems(items: { id: string; order: number }[]) {
    return this.request('/gallery/admin/reorder', {
      method: 'PUT',
      body: JSON.stringify({ items }),
    });
  }

  // Birthday Coupons Management
  async generateBirthdayCoupons(data: { discountPercentage: number; validDays?: number; message?: string }) {
    return this.request('/birthday-coupons/generate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyBirthdayCoupons() {
    return this.request('/birthday-coupons/my-coupons');
  }

  async getAllBirthdayCoupons() {
    return this.request('/birthday-coupons/admin/all');
  }

  async getUpcomingBirthdays(days = 7) {
    return this.request(`/birthday-coupons/upcoming-birthdays?days=${days}`);
  }

  async autoGenerateBirthdayCoupons() {
    return this.request('/birthday-coupons/auto-generate', {
      method: 'POST',
    });
  }

  async generateBirthdayCouponsRange(data: { discountPercentage: number; validDays: number; message?: string; maxDaysAhead: number }) {
    return this.request('/birthday-coupons/generate-range', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
