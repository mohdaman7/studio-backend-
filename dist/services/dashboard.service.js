"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dashboardService = exports.DashboardService = void 0;
const index_repository_1 = require("../repositories/index.repository");
const date_fns_1 = require("date-fns");
class DashboardService {
    async getDashboardData(branchId) {
        const todayStart = (0, date_fns_1.startOfDay)(new Date());
        const todayEnd = (0, date_fns_1.endOfDay)(new Date());
        const monthStart = (0, date_fns_1.startOfMonth)(new Date());
        const monthEnd = (0, date_fns_1.endOfMonth)(new Date());
        // ─── Today Sales ───
        const todaySalesAgg = await index_repository_1.saleRepository.model.aggregate([
            {
                $match: {
                    saleDate: { $gte: todayStart, $lte: todayEnd },
                    status: 'completed',
                    ...(branchId && { branchId: new Object(branchId) })
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$grandTotal' },
                    count: { $sum: 1 }
                }
            }
        ]);
        // ─── Month Sales ───
        const monthSalesAgg = await index_repository_1.saleRepository.model.aggregate([
            {
                $match: {
                    saleDate: { $gte: monthStart, $lte: monthEnd },
                    status: 'completed',
                    ...(branchId && { branchId: new Object(branchId) })
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$grandTotal' },
                    count: { $sum: 1 }
                }
            }
        ]);
        // ─── Month Expenses ───
        const monthExpensesAgg = await index_repository_1.expenseRepository.model.aggregate([
            {
                $match: {
                    date: { $gte: monthStart, $lte: monthEnd },
                    ...(branchId && { branchId: new Object(branchId) })
                }
            },
            {
                $group: {
                    _id: null,
                    totalAmount: { $sum: '$amount' }
                }
            }
        ]);
        // ─── Low Stock Count ───
        const lowStockCount = await index_repository_1.productRepository.count({
            isActive: true,
            $or: [
                { hasVariants: false, stock: { $lte: 5 } }
            ]
        });
        const todaySales = todaySalesAgg[0]?.totalAmount || 0;
        const todayCount = todaySalesAgg[0]?.count || 0;
        const monthSales = monthSalesAgg[0]?.totalAmount || 0;
        const monthExpenses = monthExpensesAgg[0]?.totalAmount || 0;
        const netProfit = monthSales - monthExpenses;
        // Daily Sales Chart (Last 7 Days)
        const chartData = await index_repository_1.saleRepository.getDailySales(7, branchId);
        return {
            stats: {
                todaySales,
                todayCount,
                monthSales,
                monthExpenses,
                netProfit,
                lowStockCount,
            },
            chartData
        };
    }
    async getReports(type, query) {
        const startDate = query.startDate ? new Date(query.startDate) : (0, date_fns_1.subDays)(new Date(), 30);
        const endDate = query.endDate ? new Date(query.endDate) : new Date();
        switch (type) {
            case 'sales':
                return index_repository_1.saleRepository.getSalesSummary(startDate, endDate);
            case 'top-products':
                return index_repository_1.saleRepository.getTopProducts(startDate, endDate, 10);
            case 'expenses':
                return index_repository_1.expenseRepository.getExpenseSummary(startDate, endDate);
            default:
                throw new Error('Invalid report type specified');
        }
    }
}
exports.DashboardService = DashboardService;
exports.dashboardService = new DashboardService();
exports.default = exports.dashboardService;
