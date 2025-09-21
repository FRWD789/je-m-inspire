// services/authService.js
const API_URL = 'http://localhost:8000/api';

class AuthService {
    
    /**
     * Inscription d'un nouvel utilisateur
     */
    async register(userData) {
        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important pour les cookies
                body: JSON.stringify(userData),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Stockage de l'access token et des données utilisateur
                localStorage.setItem('access_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token_expires_in', data.expires_in);
                return data;
            } else {
                throw new Error(data.errors || data.error || 'Registration failed');
            }
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Connexion utilisateur
     */
    async login(email, password) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Pour recevoir le cookie refresh_token
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            
            if (response.ok) {
                // Stockage des données côté client
                localStorage.setItem('access_token', data.token);
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token_expires_in', data.expires_in);
                
                // Le refresh token est automatiquement stocké en cookie httpOnly
                return data;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    }

    /**
     * Déconnexion
     */
    async logout() {
        try {
            await fetch(`${API_URL}/logout`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.getAccessToken()}`,
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Pour envoyer le cookie refresh_token
            });
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            // Nettoyage côté client dans tous les cas
            this.clearStorage();
        }
    }

    /**
     * Rafraîchir le token d'accès
     */
    async refreshToken() {
        try {
            const response = await fetch(`${API_URL}/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Pour envoyer le cookie refresh_token
            });

            const data = await response.json();
            
            if (response.ok) {
                // Mise à jour de l'access token
                localStorage.setItem('access_token', data.access_token);
                localStorage.setItem('token_expires_in', data.expires_in);
                return data.access_token;
            } else {
                // Si le refresh échoue, déconnecter l'utilisateur
                this.clearStorage();
                throw new Error(data.error || 'Token refresh failed');
            }
        } catch (error) {
            this.clearStorage();
            throw error;
        }
    }

    /**
     * Requête authentifiée avec gestion automatique du refresh
     */
    async authenticatedRequest(url, options = {}) {
        let token = this.getAccessToken();
        
        if (!token) {
            throw new Error('No access token available');
        }

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            ...options.headers,
        };

        try {
            const response = await fetch(`${API_URL}${url}`, {
                ...options,
                headers,
                credentials: 'include',
            });

            // Si le token est expiré, essayer de le rafraîchir
            if (response.status === 401) {
                try {
                    token = await this.refreshToken();
                    
                    // Refaire la requête avec le nouveau token
                    const retryResponse = await fetch(`${API_URL}${url}`, {
                        ...options,
                        headers: {
                            ...headers,
                            'Authorization': `Bearer ${token}`,
                        },
                        credentials: 'include',
                    });
                    
                    return retryResponse;
                } catch (refreshError) {
                    // Si le refresh échoue, rediriger vers la connexion
                    window.location.href = '/login';
                    throw refreshError;
                }
            }

            return response;
        } catch (error) {
            console.error('Authenticated request error:', error);
            throw error;
        }
    }

    /**
     * Récupérer les informations de l'utilisateur actuel
     */
    async getCurrentUserFromApi() {
        try {
            const response = await this.authenticatedRequest('/me');
            const user = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', JSON.stringify(user));
                return user;
            }
            
            throw new Error('Failed to fetch user data');
        } catch (error) {
            console.error('Get current user error:', error);
            throw error;
        }
    }

    // Méthodes utilitaires
    getAccessToken() {
        return localStorage.getItem('access_token');
    }

    getCurrentUser() {
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    isAuthenticated() {
        return !!this.getAccessToken();
    }

    hasRole(role) {
        const user = this.getCurrentUser();
        return user && user.roles && user.roles.some(r => r.role === role);
    }

    clearStorage() {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user');
        localStorage.removeItem('token_expires_in');
    }

    /**
     * Vérifier si le token va bientôt expirer (dans les 5 prochaines minutes)
     */
    shouldRefreshToken() {
        const expiresIn = localStorage.getItem('token_expires_in');
        if (!expiresIn) return false;
        
        const expirationTime = Date.now() + (parseInt(expiresIn) * 1000);
        const fiveMinutesFromNow = Date.now() + (5 * 60 * 1000);
        
        return expirationTime < fiveMinutesFromNow;
    }
}

export default new AuthService();