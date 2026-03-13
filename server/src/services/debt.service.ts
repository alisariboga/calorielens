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

    const start = startDate ? new Date(startDate) : (() => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      return tomorrow;
    })();
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
   * Recalculate debt remaining by looking at actual meal consumption for each past day.
   * For each day since debt started (up to yesterday), computes:
   *   actual_payback = max(0, baseTarget - consumed_that_day)
   * Then updates remainingCalories and dailyPaybackCalories in the DB.
   */
  static async processActualPaybacks(userId: string, baseTarget: number): Promise<void> {
    const activeDebts = await prisma.debt.findMany({
      where: { userId, status: 'active' },
      orderBy: { startDate: 'asc' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const debt of activeDebts) {
      const startDate = new Date(debt.startDate);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(debt.endDate);
      endDate.setHours(0, 0, 0, 0);

      // Recalculate from scratch using totalCalories (idempotent)
      let remaining = debt.totalCalories;
      const current = new Date(startDate);

      while (current <= yesterday && remaining > 0) {
        const dayStart = new Date(current);
        const dayEnd = new Date(current);
        dayEnd.setHours(23, 59, 59, 999);

        const meals = await prisma.meal.findMany({
          where: {
            userId,
            dateTime: { gte: dayStart, lte: dayEnd }
          },
          include: { items: true }
        });

        const consumed = meals.reduce(
          (sum, meal) => sum + meal.items.reduce((s, item) => s + item.calories, 0),
          0
        );

        // How much under base target the user ate — that's the actual debt payback
        const actualPayback = Math.max(0, baseTarget - consumed);
        remaining = Math.max(0, remaining - actualPayback);

        current.setDate(current.getDate() + 1);
      }

      if (remaining <= 0) {
        await prisma.debt.update({
          where: { id: debt.id },
          data: {
            remainingCalories: 0,
            dailyPaybackCalories: 0,
            status: 'completed'
          }
        });
        continue;
      }

      // Recalculate daily rate for remaining days
      const daysRemaining = Math.max(
        1,
        Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
      );
      const newDailyPayback = Math.round(remaining / daysRemaining);

      await prisma.debt.update({
        where: { id: debt.id },
        data: {
          remainingCalories: Math.round(remaining),
          dailyPaybackCalories: newDailyPayback,
          status: endDate <= today ? 'completed' : 'active'
        }
      });
    }
  }

  /**
   * Get current debt status for a user.
   * First processes actual paybacks from meal history, then returns updated status.
   */
  static async getDebtStatus(userId: string): Promise<DebtStatus> {
    const profile = await prisma.profile.findUnique({ where: { userId } });
    if (profile) {
      await DebtService.processActualPaybacks(userId, profile.baseTargetCalories);
    }

    const activeDebts = await prisma.debt.findMany({
      where: { userId, status: 'active' },
      orderBy: { startDate: 'asc' }
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let todayPayback = 0;
    let totalRemaining = 0;

    for (const debt of activeDebts) {
      const startDate = new Date(debt.startDate);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(debt.endDate);
      endDate.setHours(0, 0, 0, 0);

      if (startDate <= today && endDate > today) {
        todayPayback += debt.dailyPaybackCalories;
        totalRemaining += debt.remainingCalories;
      }
    }

    return {
      activeDebts: activeDebts as unknown as Debt[],
      totalRemaining: Math.round(totalRemaining),
      todayPayback: Math.round(todayPayback)
    };
  }

  /**
   * Get effective calorie target for a specific date.
   * Reads updated dailyPaybackCalories from DB (after processActualPaybacks has run).
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
