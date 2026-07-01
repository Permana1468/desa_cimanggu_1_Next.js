"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function updateUserHeartbeat() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const userId = (session.user as any).id;
    await prisma.user.update({
        where: { id: userId },
        data: { lastActiveAt: new Date() }
    });
    return { success: true };
}

export async function getChatContacts() {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const currentUserId = (session.user as any).id;
    const tenantId = (session.user as any).tenantId;

    const users = await prisma.user.findMany({
        where: {
            tenantId,
            role: { not: "WARGA" },
            id: { not: currentUserId },
            isActive: true
        },
        select: {
            id: true,
            fullName: true,
            role: true,
            email: true,
            lastActiveAt: true
        },
        orderBy: {
            fullName: "asc"
        }
    });

    const now = new Date();
    const contacts = await Promise.all(users.map(async (u) => {
        const isOnline = u.lastActiveAt 
            ? (now.getTime() - new Date(u.lastActiveAt).getTime()) < 30000 // 30 seconds threshold
            : false;
        
        const unreadCount = await prisma.chatMessage.count({
            where: {
                senderId: u.id,
                receiverId: currentUserId,
                isRead: false
            }
        });

        const lastMessage = await prisma.chatMessage.findFirst({
            where: {
                OR: [
                    { senderId: currentUserId, receiverId: u.id },
                    { senderId: u.id, receiverId: currentUserId }
                ]
            },
            orderBy: {
                createdAt: "desc"
            },
            select: {
                message: true,
                createdAt: true,
                senderId: true
            }
        });

        return {
            ...u,
            isOnline,
            unreadCount,
            lastMessage
        };
    }));

    // Sort contacts: latest message first, then alphabetical
    contacts.sort((a, b) => {
        const timeA = a.lastMessage ? new Date(a.lastMessage.createdAt).getTime() : 0;
        const timeB = b.lastMessage ? new Date(b.lastMessage.createdAt).getTime() : 0;
        
        if (timeA !== timeB) {
            return timeB - timeA;
        }
        
        return a.fullName.localeCompare(b.fullName);
    });

    return contacts;
}

export async function getChatHistory(contactId: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return [];
    const currentUserId = (session.user as any).id;

    await prisma.chatMessage.updateMany({
        where: {
            senderId: contactId,
            receiverId: currentUserId,
            isRead: false
        },
        data: {
            isRead: true
        }
    });

    const messages = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: currentUserId, receiverId: contactId },
                { senderId: contactId, receiverId: currentUserId }
            ]
        },
        orderBy: {
            createdAt: "asc"
        }
    });

    return messages;
}

export async function sendChatMessage(receiverId: string, message: string) {
    const session = await getServerSession(authOptions);
    if (!session?.user) return { error: "Unauthorized" };
    const currentUserId = (session.user as any).id;

    if (!message.trim()) return { error: "Message cannot be empty" };

    const newMessage = await prisma.chatMessage.create({
        data: {
            senderId: currentUserId,
            receiverId,
            message: message.trim()
        }
    });

    return { success: true, message: newMessage };
}
