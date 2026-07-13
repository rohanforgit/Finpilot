export const mockUser = {
  id: "user-1",
  name: "Elena K.",
  email: "elena@example.com",
  avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d",
};

export const mockMonthlyPlan = {
  month: "July",
  year: 2026,
  income: 120000,
  allocated: {
    essentials: 40000,
    investments: 30000,
    savings: 20000,
    lifestyle: 30000,
  },
  spent: {
    essentials: 25000,
    investments: 30000,
    savings: 20000,
    lifestyle: 12500,
  },
};

export const mockTransactions = [
  { id: "tx-1", date: "Today, 2:30 PM", merchant: "Amazon", amount: 1200, category: "Lifestyle", status: "Auto-categorized" },
  { id: "tx-2", date: "Today, 9:00 AM", merchant: "Starbucks", amount: 350, category: "Lifestyle", status: "Auto-categorized" },
  { id: "tx-3", date: "Yesterday", merchant: "Shell Fuel", amount: 2500, category: "Essentials", status: "Manual" },
  { id: "tx-4", date: "July 4", merchant: "Netflix", amount: 649, category: "Lifestyle", status: "Subscription" },
  { id: "tx-5", date: "July 1", merchant: "Rent", amount: 28000, category: "Essentials", status: "Recurring" },
];

export const mockBuckets = [
  { id: "b1", name: "Emergency Fund", target: 500000, current: 350000, color: "bg-emerald-500" },
  { id: "b2", name: "Vacation", target: 80000, current: 45000, color: "bg-purple-500" },
  { id: "b3", name: "New Laptop", target: 120000, current: 20000, color: "bg-blue-500" },
  { id: "b4", name: "Car Insurance", target: 15000, current: 15000, color: "bg-amber-500" },
];

export const mockRecommendations = [
  { id: "r1", title: "High Surplus Detected", description: "You have ₹17,500 remaining in Lifestyle this month. Consider moving ₹10,000 to your Vacation Bucket.", type: "insight", action: "Move Funds" },
  { id: "r2", title: "Unusual Spending", description: "You've spent ₹4,500 on dining this week, which is 40% higher than your average.", type: "warning", action: "Review Dining" },
  { id: "r3", title: "Subscription Price Increase", description: "Your Netflix subscription increased by ₹150 this month.", type: "alert", action: "View Subscriptions" },
];
