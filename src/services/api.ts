// Dummy API service since the backend is being migrated
const api = {
    get: async (url: string) => {
        return { data: null as any };
    },
    post: async (url: string, data: any) => {
        return { data: { success: true } };
    }
};

export default api;
