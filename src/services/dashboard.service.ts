import { Request } from 'express';
import {
  saleRepository,
  purchaseRepository,
  expenseRepository,
  productRepository,
  customerRepository
} from '../repositories/index.repository';
import { startOfDay, endOfDay, subDays, startOfMonth, endOfMonth } from 'date-fns';

export class DashboardService {
  async getDashboardData(branchId?: string) {
    const todayStart = startOfDay(new Date());
    const todayEnd = endOfDay(new Date());
    const monthStart = startOfMonth(new Date());
    const monthEnd = endOfMonth(new Date());

    // ─── Today Sales ───
    const todaySalesAgg = await saleRepository.model.aggregate([
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
    const monthSalesAgg = await saleRepository.model.aggregate([
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
    const monthExpensesAgg = await expenseRepository.model.aggregate([
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
    const lowStockCount = await productRepository.count({
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
    const chartData = await saleRepository.getDailySales(7, branchId);

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

  async getReports(type: string, query: Request['query']) {
    const startDate = query.startDate ? new Date(query.startDate as string) : subDays(new Date(), 30);
    const endDate = query.endDate ? new Date(query.endDate as string) : new Date();

    switch (type) {
      case 'sales':
        return saleRepository.getSalesSummary(startDate, endDate);
      case 'top-products':
        return saleRepository.getTopProducts(startDate, endDate, 10);
      case 'expenses':
        return expenseRepository.getExpenseSummary(startDate, endDate);
      default:
        throw new Error('Invalid report type specified');
    }
  }
}

export const dashboardService = new DashboardService();
export default dashboardService;
