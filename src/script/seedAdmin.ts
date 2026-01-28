import { UserRole } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

const seedAdmin = async () => {
    try {
        const adminData = {
            name: "Admin",
            email: "admin@medistore.com",
            role: UserRole.ADMIN,
            password: "11223344"
        };

        const existingUser = await prisma.user.findUnique({
            where: { email: adminData.email },
        });

        if (existingUser) {
            console.log("Admin already exists");
            return;
        }

        const newAdmin = await fetch("http://localhost:5000/api/auth/sign-up/email", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Origin": "http://localhost:3000"
            },
            body: JSON.stringify(adminData),
        });
        console.log(newAdmin);

        if (newAdmin.ok) {
            await prisma.user.update({
                where: {
                    email: adminData.email
                },
                data: {
                    emailVerified: true
                }
            })
        }
    } catch (err) {
        console.error(err);
    }
};

seedAdmin();