const API_BASE_URL = 'http://localhost:3001/api';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${API_BASE_URL}${endpoint}`;

    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    name: string;
    email: string;
    password: string;
    city?: string;
    country?: string;
    latitude?: number;
    longitude?: number;
    languages?: string[];
  }) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getMe() {
    return this.request('/auth/me');
  }

  // Prayer Requests endpoints
  async getPrayerRequests(params?: {
    page?: number;
    limit?: number;
    category?: string;
    urgent?: boolean;
    status?: string;
    language?: string;
    latitude?: number;
    longitude?: number;
    maxDistance?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-requests${queryParams.toString() ? `?${queryParams}` : ''}`;

    return this.request(endpoint);
  }

  async getTrendingPrayerRequests(params?: {
    page?: number;
    limit?: number;
    language?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-requests/trending${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getPrayerRequest(id: string) {
    return this.request(`/prayer-requests/${id}`);
  }

  createPrayerRequest = async (data: {
    content: string;
    urgent?: boolean;
    privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
    categoryId: string;
    languageId: string;
    images?: string[];
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
  }) => {
    return this.request('/prayer-requests', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePrayerRequest = async (id: string, data: {
    title?: string;
    content?: string;
    urgent?: boolean;
    privacy?: 'PUBLIC' | 'PRIVATE' | 'FRIENDS';
    status?: 'ACTIVE' | 'ANSWERED' | 'ARCHIVED';
    categoryId?: string;
    languageId?: string;
  }) => {
    return this.request(`/prayer-requests/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePrayerRequest(id: string) {
    return this.request(`/prayer-requests/${id}`, {
      method: 'DELETE',
    });
  }

  // Intercessions endpoints
  createIntercession = async (data: {
    prayerRequestId: string;
    comment?: string;
  }) => {
    return this.request('/intercessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getIntercessions(prayerRequestId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/intercessions/prayer-request/${prayerRequestId}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getUserIntercessions(params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/intercessions/user${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Comments endpoints
  createComment = async (data: {
    prayerRequestId: string;
    content: string;
  }) => {
    return this.request('/comments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getComments(prayerRequestId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/comments/prayer-request/${prayerRequestId}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Prayer Logs endpoints
  createPrayerLog = async (data: {
    prayerRequestId: string;
    date?: string;
  }) => {
    return this.request('/prayer-logs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getPrayerLogs(prayerRequestId: string, params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-logs/prayer-request/${prayerRequestId}${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getUserPrayerLogs(params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-logs/user${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  async getUserCommittedPrayers(params?: {
    page?: number;
    limit?: number;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-logs/user/committed${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Word of Day endpoints
  async getTodayWordOfDay(language?: string) {
    const queryParams = language ? `?language=${language}` : '';
    return this.request(`/word-of-day/today${queryParams}`);
  }

  async getWordOfDayByDate(date: string, language?: string) {
    const queryParams = language ? `?language=${language}` : '';
    return this.request(`/word-of-day/${date}${queryParams}`);
  }

  // Categories endpoints
  getCategories = async () => {
    try {
      const url = `${API_BASE_URL}/categories`;
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      };

      const response = await fetch(url, { headers });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  // Languages endpoints
  getLanguages = async () => {
    return this.request('/languages');
  }

  getUserLanguages = async () => {
    return this.request('/languages/user');
  }

  updateUserLanguages = async (languages: Array<{
    languageId: string;
    isPrimary?: boolean;
  }>) => {
    return this.request('/languages/user', {
      method: 'PUT',
      body: JSON.stringify({ languages }),
    });
  }

  // User endpoints
  getUserProfile = async () => {
    return this.request('/users/profile');
  }

  getPublicProfile = async (userId: string) => {
    return this.request(`/users/public/${userId}`);
  }

  updateUserProfile = async (data: {
    name?: string;
    avatar?: string;
    latitude?: number;
    longitude?: number;
    city?: string;
    country?: string;
    timezone?: string;
  }) => {
    return this.request('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  getUserStats = async () => {
    return this.request('/users/stats');
  }

  async getUserPrayerRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
  }) {
    const queryParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const endpoint = `/users/prayer-requests${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  // Prayer Reminders
  getUserPrayerReminders = async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }

    const endpoint = `/prayer-reminders/user${queryParams.toString() ? `?${queryParams}` : ''}`;
    return this.request(endpoint);
  }

  createPrayerReminder = async (data: {
    title: string;
    content?: string;
  }) => {
    return this.request('/prayer-reminders', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  updatePrayerReminder = async (id: string, data: {
    title?: string;
    content?: string;
  }) => {
    return this.request(`/prayer-reminders/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  deletePrayerReminder = async (id: string) => {
    return this.request(`/prayer-reminders/${id}`, {
      method: 'DELETE',
    });
  }

  // Share methods
  createShare = async (data: {
    contentType: 'WORD_OF_DAY' | 'PRAYER_REQUEST';
    contentId: string;
    expiresAt?: string;
  }) => {
    return this.request('/share', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  getSharedContent = async (shareId: string) => {
    return this.request(`/share/${shareId}`);
  }

  getUserSharedContent = async (params?: {
    page?: number;
    limit?: number;
  }) => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());

    const queryString = searchParams.toString();
    return this.request(`/share/user/content${queryString ? `?${queryString}` : ''}`);
  }

  deleteShare = async (shareId: string) => {
    return this.request(`/share/${shareId}`, {
      method: 'DELETE',
    });
  }
}

export const apiService = new ApiService();
