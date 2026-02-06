// webkit.js - Lightweight browser utility library
class Webkit {
    constructor(options = {}) {
        this.version = '1.0.0';
        this.config = {
            debug: options.debug || false,
            baseURL: options.baseURL || '',
            cache: options.cache || true
        };
        this.cache = new Map();
        this.initialized = false;
    }

    // Initialize the library
    init() {
        if (this.initialized) {
            this.log('Webkit is already initialized');
            return this;
        }

        this.initialized = true;
        this.log('Webkit initialized successfully');
        return this;
    }

    // Debug logging
    log(message, data = null) {
        if (this.config.debug) {
            console.log(`[Webkit] ${message}`, data || '');
        }
    }

    // DOM manipulation utilities
    $(selector) {
        return document.querySelector(selector);
    }

    $$(selector) {
        return document.querySelectorAll(selector);
    }

    createElement(tag, attributes = {}, content = '') {
        const element = document.createElement(tag);
        
        Object.keys(attributes).forEach(attr => {
            element.setAttribute(attr, attributes[attr]);
        });
        
        if (content) {
            element.textContent = content;
        }
        
        return element;
    }

    // Event handling
    on(element, event, handler, options = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            element.addEventListener(event, handler, options);
            return () => element.removeEventListener(event, handler, options);
        }
        
        return null;
    }

    // AJAX utilities
    async request(url, options = {}) {
        const fullURL = this.config.baseURL ? `${this.config.baseURL}${url}` : url;
        const cacheKey = `${fullURL}-${JSON.stringify(options)}`;
        
        // Check cache first
        if (this.config.cache && this.cache.has(cacheKey)) {
            this.log('Returning cached response', cacheKey);
            return this.cache.get(cacheKey);
        }

        try {
            const response = await fetch(fullURL, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            // Cache the response
            if (this.config.cache && options.method?.toUpperCase() === 'GET') {
                this.cache.set(cacheKey, data);
            }
            
            return data;
        } catch (error) {
            this.log('Request error:', error);
            throw error;
        }
    }

    get(url, options = {}) {
        return this.request(url, { ...options, method: 'GET' });
    }

    post(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    put(url, data, options = {}) {
        return this.request(url, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    delete(url, options = {}) {
        return this.request(url, { ...options, method: 'DELETE' });
    }

    // Storage utilities
    setStorage(key, value, permanent = false) {
        try {
            const storage = permanent ? localStorage : sessionStorage;
            storage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            this.log('Storage error:', error);
            return false;
        }
    }

    getStorage(key, permanent = false) {
        try {
            const storage = permanent ? localStorage : sessionStorage;
            const item = storage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            this.log('Storage retrieval error:', error);
            return null;
        }
    }

    removeStorage(key, permanent = false) {
        try {
            const storage = permanent ? localStorage : sessionStorage;
            storage.removeItem(key);
            return true;
        } catch (error) {
            this.log('Storage removal error:', error);
            return false;
        }
    }

    // Cookie utilities
    setCookie(name, value, days = 7) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        const expires = `expires=${date.toUTCString()}`;
        document.cookie = `${name}=${encodeURIComponent(value)};${expires};path=/`;
    }

    getCookie(name) {
        const nameEQ = `${name}=`;
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i];
            while (cookie.charAt(0) === ' ') {
                cookie = cookie.substring(1);
            }
            if (cookie.indexOf(nameEQ) === 0) {
                return decodeURIComponent(cookie.substring(nameEQ.length));
            }
        }
        
        return null;
    }

    deleteCookie(name) {
        this.setCookie(name, '', -1);
    }

    // Animation utilities
    animate(element, keyframes, options = {}) {
        if (typeof element === 'string') {
            element = this.$(element);
        }
        
        if (element) {
            return element.animate(keyframes, {
                duration: 300,
                easing: 'ease-in-out',
                ...options
            });
        }
        
        return null;
    }

    fadeIn(element, duration = 300) {
        return this.animate(element, [
            { opacity: 0 },
            { opacity: 1 }
        ], { duration });
    }

    fadeOut(element, duration = 300) {
        return this.animate(element, [
            { opacity: 1 },
            { opacity: 0 }
        ], { duration });
    }

    // Utility functions
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }

    // Form utilities
    serializeForm(form) {
        if (typeof form === 'string') {
            form = this.$(form);
        }
        
        if (!form || form.nodeName !== 'FORM') {
            return {};
        }
        
        const formData = new FormData(form);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return data;
    }

    // Validation utilities
    validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    validateURL(url) {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }

    // Date utilities
    formatDate(date, format = 'yyyy-mm-dd') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        switch (format) {
            case 'dd/mm/yyyy':
                return `${day}/${month}/${year}`;
            case 'mm/dd/yyyy':
                return `${month}/${day}/${year}`;
            case 'yyyy-mm-dd hh:ii:ss':
                return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            default:
                return `${year}-${month}-${day}`;
        }
    }

    // Cleanup and destruction
    clearCache() {
        this.cache.clear();
        this.log('Cache cleared');
    }

    destroy() {
        this.clearCache();
        this.initialized = false;
        this.log('Webkit destroyed');
    }
}

// Export for different environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Webkit;
} else if (typeof define === 'function' && define.amd) {
    define([], () => Webkit);
} else {
    window.Webkit = Webkit;
}

// Auto-initialize if data attribute is present
if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        const webkitElements = document.querySelectorAll('[data-webkit]');
        if (webkitElements.length > 0) {
            const options = {};
            webkitElements.forEach(el => {
                const config = el.getAttribute('data-webkit-config');
                if (config) {
                    try {
                        Object.assign(options, JSON.parse(config));
                    } catch (e) {
                        console.error('Invalid Webkit configuration', e);
                    }
                }
            });
            
            window.webkit = new Webkit(options);
            window.webkit.init();
        }
    });
}