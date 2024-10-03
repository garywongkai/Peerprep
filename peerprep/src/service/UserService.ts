import axios from 'axios';

const API_URL = 'http://localhost:3001'; // Adjust this to match your user-service URL

export interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

class UserService {
    async login(email: string, password: string): Promise<void> {
        try {
          const response = await axios.post(`${API_URL}/auth/login`, { email, password });
          console.log('Login response:', response.data); // Log the entire response
          const token = response.data.data.accessToken;
          if (!token) {
            console.error('Login response does not contain a token:', response.data);
            throw new Error('No token received from server');
          }
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(response.data.data));
        } catch (error) {
          if (axios.isAxiosError(error) && error.response) {
            console.error('Login failed. Server response:', error.response.data);
            throw new Error(`Login failed: ${error.response.data.message || 'Unknown error'}`);
          } else {
            console.error('Login failed:', error);
            throw new Error('Login failed due to a network error');
          }
        }
      }

  async verifyToken(): Promise<User> {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }
    const response = await axios.get(`${API_URL}/auth/verify-token`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data.data;
  }

  async getUser(id: string): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.get(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const token = localStorage.getItem('token');
    const response = await axios.patch(`${API_URL}/users/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }

  async deleteUser(id: string): Promise<void> {
    const token = localStorage.getItem('token');
    await axios.delete(`${API_URL}/users/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.logout();
  }

  logout() {
    localStorage.removeItem('token');
  }

  async register(username: string, email: string, password: string): Promise<void> {
    const response = await axios.post(`${API_URL}/users`, { username, email, password });
    const token = response.data.data.accessToken;
    localStorage.setItem('token', token);
  }
}

export const userService = new UserService();