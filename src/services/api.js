// Dummy API service since the backend is being migrated
const api = {
    get: async (url) => {
        console.log(`Dummy GET to ${url}`);
        return { data: null };
    },
    post: async (url, data) => {
        console.log(`Dummy POST to ${url}`, data);
        return { data: { success: true } };
    }
};

export default api;
