axios.defaults.headers.common["Content-Type"] = "application/json";
axios.defaults.baseURL = "http://localhost:3000/api/v1";

// Request interceptor
axios.interceptors.request.use(request => {
    document.body.classList.add("cursor-loading");
    return request;
});

// Response interceptor
axios.interceptors.response.use(
    (response) => {
        document.body.classList.remove("cursor-loading");
        return response;
    },
    (error) => {
        document.body.classList.remove("cursor-loading");
        return Promise.reject(error);
    }
);

export async function signUp(body) {
    const response = await axios.post("/users", body);
    return response;
}