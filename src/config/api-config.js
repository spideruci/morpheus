const prod = {
    backendHost: 'http://api.kajdreef.com'
}

const dev = {
    backendHost: 'http://localhost:8000'
}

export const API_ROOT = process.env.REACT_APP_STAGE === 'prod'
    ? prod.backendHost
    : dev.backendHost;