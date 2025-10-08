axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.baseURL = "http://localhost:3000";

// Request interceptor
axios.interceptors.request.use(request => {
    document.body.style.cursor = "progress";
    return request;
});

// Response interceptor
axios.interceptors.response.use(function onFullfilled(response) {
    document.body.style.removeProperty("cursor");
    return response;
});

export async function signUp(body) {
    const response = await axios.post("/users", body);
    return response;
}