import { User, Category, MonthlyPayment } from '../types';

const LOTTERY_TICKET_PRICE = 0.5; // € por papeleta

export function calculateMonthlyPayment(
  user: User,
  category: Category,
  lotteryTickets: number = 0
): MonthlyPayment {
  const totalAmount = category.quotaAmount;
  const lotteryAmount = lotteryTickets * LOTTERY_TICKET_PRICE;
  const moneyAmount = totalAmount - lotteryAmount;

  return {
    totalAmount,
    lotteryAmount,
    moneyAmount,
    lotteryTickets
  };
}

export function calculateFamilyMonthlyPayment(
  users: User[],
  categories: Category[]
): MonthlyPayment {
  const familyUsers = users.filter(user => user.monthlyPayment);
  
  return familyUsers.reduce((total, user) => {
    const payment = user.monthlyPayment;
    if (payment) {
      total.totalAmount += payment.totalAmount;
      total.lotteryAmount += payment.lotteryAmount;
      total.moneyAmount += payment.moneyAmount;
      total.lotteryTickets += payment.lotteryTickets;
    }
    return total;
  }, {
    totalAmount: 0,
    lotteryAmount: 0,
    moneyAmount: 0,
    lotteryTickets: 0
  });
}

export function updateUserMonthlyPayment(
  user: User,
  category: Category,
  lotteryTickets: number
): User {
  const monthlyPayment = calculateMonthlyPayment(user, category, lotteryTickets);
  
  return {
    ...user,
    monthlyPayment
  };
}
