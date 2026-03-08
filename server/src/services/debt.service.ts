import prisma from '../prisma';
import { CreateDebtRequest, Debt, DebtStatus } from '../shared-types';

type DebtRecord = {
  id: string;
  userId: string;
  createdDate: Date;
  totalCalories: number;
  remainingCalories: number;
  startDate: Date;
  endDate: Date;
  dailyPaybackCalories: number;
  status: string;
};

export class DebtService {
  /**
   * Create a new calorie debt with payback schedule
   */
  static async createDebt(
    userId: string,
    request: CreateDebtRequest,
    userSex: string,
    baseTarget: number
  ): Promise<Debt> {
    const { overageCalories, paybackDays, startDate } = request;
    
    const minCalories = userSex === 'female' ? 1200 : 1500;
    let dailyPayback = Math.round(overageCalories / paybackDays);
    let effectiveDays = paybackDays;
    
    // Safety check: ensure we don't drop below minimum safe calories
    if (baseTarget - dailyPayback < minCalories) {
      dailyPayback = baseTarget - minCalories;
      effectiveDays = Math.ceil(overageCalories / dailyPayback);
    }
    
    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);
    
    const end = new Date(start);
    end.setDate(end.getDate() + effectiveDays);
    
    const debt = await prisma.debt.create({
      data: {
        userId,
        totalCalories: overageCalories,
        remainingCalories: overageCalories,
        startDate: start,
        endDate: end,
        dailyPaybackCalories: dailyPayback,
        status: 'active'
      }
    });
    
    return debt as unknown as Debt;
  }

  /**
   * Get current debt status for a user
   */
  static async getDebtStatus(userId: string): Promise<DebtStatus> {
    const activeDebts = await prisma.debt.findMany({
      where: {
        userId,
        status: 'active'
      },
      orderBy: {
        startDate: 'asc'
      }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayPayback = 0;
    let totalRemaining = 0;
    const debtsToComplete: string[] = [];

    for (const debt of activeDebts) {
      const startDate = new Date(debt.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(debt.endDate);
      endDate.setHours(0, 0, 0, 0);

      // Calculate actual remaining based on elapsed days
      const daysElapsed = Math.max(
        0,
        Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const paidAmount = Math.min(daysElapsed * debt.dailyPaybackCalories, debt.totalCalories);
      const actualRemaining = Math.max(0, debt.totalCalories - paidAmount);

      if (actualRemaining <= 0 || endDate <= today) {
        debtsToComplete.push(debt.id);
        continue;
      }

      totalRemaining += actualRemaining;

      // Check if debt is active today
      if (startDate <= today && endDate > today) {
        todayPayback += debt.dailyPaybackCalories;
      }
    }

    // Mark fully paid debts as completed
    if (debtsToComplete.length > 0) {
      await prisma.debt.updateMany({
        where: { id: { in: debtsToComplete } },
        data: { status: 'completed', remainingCalories: 0 }
      });
    }

    const currentDebts = activeDebts.filter((d: DebtRecord) => !debtsToComplete.includes(d.id));

    // Attach computed remaining to each debt object for display
    const debtsWithActualRemaining = currentDebts.map((debt: DebtRecord) => {
      const startDate = new Date(debt.startDate);
      startDate.setHours(0, 0, 0, 0);
      const daysElapsed = Math.max(
        0,
        Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
      );
      const paidAmount = Math.min(daysElapsed * debt.dailyPaybackCalories, debt.totalCalories);
      return {
        ...debt,
        remainingCalories: Math.max(0, debt.totalCalories - paidAmount)
      };
    });

    return {
      activeDebts: debtsWithActualRemaining as unknown as Debt[],
      totalRemaining: Math.round(totalRemaining),
      todayPayback: Math.round(todayPayback)
    };
  }

  /**
   * Process daily debt payback
   * Called when calculating daily targets
   */
  static async processDailyPayback(userId: string, date: Date): Promise<number> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const activeDebts = await prisma.debt.findMany({
      where: {
        userId,
        status: 'active',
        startDate: { lte: dateOnly },
        endDate: { gt: dateOnly }
      }
    });
    
    let totalPayback = 0;
    
    for (const debt of activeDebts) {
      totalPayback += debt.dailyPaybackCalories;
      
      // Update remaining calories
      const newRemaining = Math.max(0, debt.remainingCalories - debt.dailyPaybackCalories);
      
      await prisma.debt.update({
        where: { id: debt.id },
        data: {
          remainingCalories: newRemaining,
          status: newRemaining <= 0 ? 'completed' : 'active'
        }
      });
    }
    
    return Math.round(totalPayback);
  }

  /**
   * Get effective target for a specific date
   */
  static async getEffectiveTarget(
    userId: string,
    date: Date,
    baseTarget: number
  ): Promise<number> {
    const dateOnly = new Date(date);
    dateOnly.setHours(0, 0, 0, 0);
    
    const activeDebts = await prisma.debt.findMany({
      where: {
        userId,
        status: 'active',
        startDate: { lte: dateOnly },
        endDate: { gt: dateOnly }
      }
    });
    
    const totalPayback = activeDebts.reduce(
      (sum: number, debt: DebtRecord) => sum + debt.dailyPaybackCalories,
      0
    );
    
    return Math.round(baseTarget - totalPayback);
  }
}
