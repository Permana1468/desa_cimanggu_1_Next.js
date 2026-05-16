import { getAllUsers, getAllTenantsMinimal } from "@/actions/master";
import UserManagementClient from "@/components/master/UserManagementClient";

export default async function UserManagementPage() {
    const [users, tenants] = await Promise.all([
        getAllUsers(),
        getAllTenantsMinimal()
    ]);

    return (
        <UserManagementClient 
            initialUsers={users} 
            tenants={tenants} 
        />
    );
}
