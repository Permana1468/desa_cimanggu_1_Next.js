export default function Loading() {
    return (
        <div className="flex h-[80vh] w-full items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <div className="absolute inset-0 animate-ping rounded-full bg-blue-500/20"></div>
                    <div className="absolute inset-2 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                    <div className="h-4 w-4 rounded-full bg-blue-500"></div>
                </div>
                <div className="animate-pulse text-sm font-bold tracking-widest text-slate-400">
                    MEMUAT DATA...
                </div>
            </div>
        </div>
    );
}
