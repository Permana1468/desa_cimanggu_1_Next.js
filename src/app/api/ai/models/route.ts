import { NextResponse } from 'next/server';
import { getAiIntegration } from '@/actions/ai';

export async function GET() {
    try {
        const aiConfig = await getAiIntegration();
        if (!aiConfig.isConnected || !aiConfig.apiKey) {
            return NextResponse.json({ error: "No API key" });
        }
        
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${aiConfig.apiKey}`);
        const data = await res.json();
        
        return NextResponse.json({ models: data.models?.map((m: any) => m.name) || data });
    } catch (e: any) {
        return NextResponse.json({ error: e.message });
    }
}
