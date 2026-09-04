const API_VERSION = "v1";
const BASE_URL = 'https://nyaya-ai-backend-tyy5.onrender.com'; // simulated missing /api/v1

function buildUrl(endpoint) {
    let finalPath = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    
    let base = BASE_URL.endsWith("/") ? BASE_URL.slice(0, -1) : BASE_URL;
    
    // Ensure base always ends with /api/v1 if it's a backend URL
    if (!base.endsWith("/api/v1")) {
      base = `${base}/api/v1`;
    }

    // Prevent duplicate /api/v1 if finalPath also has it
    if (finalPath.startsWith("/api/v1")) {
      finalPath = finalPath.slice(7); // Remove leading /api/v1
    }

    let fullUrlString = "";
    if (base.startsWith("http://") || base.startsWith("https://")) {
      fullUrlString = `${base}${finalPath}`;
    } else {
      fullUrlString = `http://localhost:3000${base}${finalPath}`;
    }
    return fullUrlString;
}

console.log("Endpoint '/chat/message' =>", buildUrl('/chat/message'));
console.log("Endpoint '/location/search-pincode' =>", buildUrl('/location/search-pincode'));
console.log("Endpoint '/api/v1/user/login' =>", buildUrl('/api/v1/user/login'));
