let backendHost;

const hostname = window && window.location && window.location.hostname;

if (hostname === 'spidertest.org') {
    backendHost = 'http://api.kajdreef.com';
} else {
    backendHost = process.env.REACT_APP_BACKEND_HOST || 'http://localhost:8000';
}

export const API_ROOT = `${backendHost}`;

