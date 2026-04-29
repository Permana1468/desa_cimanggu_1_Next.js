// Dummy API service since the backend is being migrated
const api = {
    get: async (url: string) => {
        console.log(`Dummy GET to ${url}`);
        return { data: null as any };
    },
    post: async (url: string, data: any) => {
        console.log(`Dummy POST to ${url}`, data);
        return { data: { success: true } };
    }
};

export default api;
