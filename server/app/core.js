// app/liku-core.js
class LikuCore {
    constructor(options = {}) {
        this.version = '0.0.1';
        this.config = {
            debug: options.debug || false,
            apiUrl: options.apiUrl || True
        };
        this.initialized = false;
    }

    // Initialization method
    init() {
        if (this.initialized) {
            this.log('LikuCore is already initialized');
            return;
        }

        this.initialized = true;
        this.log('LikuCore initialized successfully');
        return this;
    }

    // Logging method
    log(message, data = null) {
        if (this.config.debug) {
            console.log(`[LikuCore] ${message}`, data || '');
        }
    }

    // Utility method for HTTP requests
    async request(endpoint, options = {}) {
        try {
            const url = `${this.config.apiUrl}/${endpoint}`;
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            this.log('Request error:', error);
            throw error;
        }
    }

    // Method to get data
    async getData(resource) {
        return this.request(resource, {
            method: 'GET'
        });
    }

    // Method to send data
    async postData(resource, data) {
        return this.request(resource, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    // Method to update data
    async updateData(resource, data) {
        return this.request(resource, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    // Method to delete data
    async deleteData(resource) {
        return this.request(resource, {
            method: 'DELETE'
        });
    }

    // Utility methods
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    formatDate(date, format = 'yyyy-mm-dd') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');

        if (format === 'dd/mm/yyyy') {
            return `${day}/${month}/${year}`;
        }

        return `${year}-${month}-${day}`;
    }

    // Destructor/cleanup
    destroy() {
        this.initialized = false;
        this.log('LikuCore destroyed');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LikuCore; // Node.js
} else if (typeof define === 'function' && define.amd) {
    define([], () => LikuCore); // AMD
} else {
    window.LikuCore = LikuCore; // Browser global
}

// Automatic initialization if data attributes are present
if (typeof window !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const likuElements = document.querySelectorAll('[data-liku]');
        if (likuElements.length > 0) {
            window.likuInstance = new LikuCore();
            window.likuInstance.init();
        }
    });
}