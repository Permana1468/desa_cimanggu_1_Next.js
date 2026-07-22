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

    const userIds = users.map((u) => u.id);

    if (userIds.length === 0) return [];

    // Batch query 1: Fetch unread counts per sender in a single query
    const unreadCountsGroup = await prisma.chatMessage.groupBy({
        by: ["senderId"],
        where: {
            receiverId: currentUserId,
            isRead: false,
            senderId: { in: userIds }
        },
        _count: {
            _all: true
        }
    });

    const unreadMap = new Map<string, number>();
    for (const item of unreadCountsGroup) {
        unreadMap.set(item.senderId, item._count._all);
    }

    // Batch query 2: Fetch recent messages involving current user and these contacts
    const allRecentMessages = await prisma.chatMessage.findMany({
        where: {
            OR: [
                { senderId: currentUserId, receiverId: { in: userIds } },
                { senderId: { in: userIds }, receiverId: currentUserId }
            ]
        },
        orderBy: {
            createdAt: "desc"
        },
        select: {
            message: true,
            createdAt: true,
            senderId: true,
            receiverId: true
        }
    });

    const lastMessageMap = new Map<string, { message: string; createdAt: Date; senderId: string }>();
    for (const msg of allRecentMessages) {
        const otherId = msg.senderId === currentUserId ? msg.receiverId : msg.senderId;
        if (!lastMessageMap.has(otherId)) {
            lastMessageMap.set(otherId, {
                message: msg.message,
                createdAt: msg.createdAt,
                senderId: msg.senderId
            });
        }
    }

    const now = new Date();
    const contacts = users.map((u) => {
        const isOnline = u.lastActiveAt 
            ? (now.getTime() - new Date(u.lastActiveAt).getTime()) < 30000 // 30 seconds threshold
            : false;

        return {
            ...u,
            isOnline,
            unreadCount: unreadMap.get(u.id) || 0,
            lastMessage: lastMessageMap.get(u.id) || null
        };
    });

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
