import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import MasterAdminUmkmClient from "./MasterAdminUmkmClient";
import { redirect } from "next/navigation";

export default async function UmkmVerificationPage() {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN_MASTER") {
        redirect("/login");
    }

    const umkmList = await prisma.umkmStore.findMany({
        include: {
            user: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    return <MasterAdminUmkmClient umkmList={umkmList} />;
}
