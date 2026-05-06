import { prisma } from "../../lib/prisma";

const getStats = async () => {
    // 1. Core Metrics
    const totalRevenueResult = await prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: "CANCELLED" } },
    });
    
    const totalRevenue = totalRevenueResult._sum.total || 0;
    const totalUsers = await prisma.user.count();
    const totalCustomers = await prisma.user.count({ where: { role: "CUSTOMER" } });
    const totalSellers = await prisma.user.count({ where: { role: "SELLER" } });
    const bannedUsers = await prisma.user.count({ where: { status: "BAN" } });

    const totalOrders = await prisma.order.count();
    const pendingOrders = await prisma.order.count({ where: { status: "PLACED" } });
    const deliveredOrders = await prisma.order.count({ where: { status: "DELIVERED" } });
    const cancelledOrders = await prisma.order.count({ where: { status: "CANCELLED" } });

    const totalMedicines = await prisma.medicine.count();
    const activeMedicines = await prisma.medicine.count({ where: { isActive: true } });
    const featuredMedicines = await prisma.medicine.count({ where: { isFeatured: true } });

    // 2. Orders by Status (For Pie Chart)
    const ordersByStatusRaw = await prisma.order.groupBy({
        by: ['status'],
        _count: { status: true }
    });
    const ordersByStatus = ordersByStatusRaw.map((item: any) => ({
        status: item.status,
        count: item._count.status
    }));

    // 3. Revenue over last 6 months (For Bar/Line Chart)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const recentOrders = await prisma.order.findMany({
        where: {
            status: { not: "CANCELLED" },
            createdAt: { gte: sixMonthsAgo }
        },
        select: {
            total: true,
            createdAt: true
        }
    });

    // Group recent orders by month
    const revenueByMonthMap: Record<string, number> = {};
    recentOrders.forEach((order: any) => {
        const monthYear = order.createdAt.toLocaleString('default', { month: 'short', year: 'numeric' });
        revenueByMonthMap[monthYear] = (revenueByMonthMap[monthYear] || 0) + Number(order.total);
    });

    const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({
        month,
        revenue
    })).reverse();

    // 4. Recent Transactions
    const recentTransactions = await prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { name: true, email: true } }
        }
    });

    return {
        totalRevenue,
        totalOrders,
        totalUsers,
        totalCustomers,
        totalSellers,
        bannedUsers,
        pendingOrders,
        deliveredOrders,
        cancelledOrders,
        totalMedicines,
        activeMedicines,
        featuredMedicines,
        charts: {
            ordersByStatus,
            revenueByMonth
        },
        recentTransactions
    };
};

export const AdminService = {
    getStats,
};
