
export interface Trip {
  id: string;
  userId: string; // Adicionar campo userId
  date: string;
  earnings: number;
  startTime: string;
  endTime: string;
  tripCount: number;
  tripsByPlatform?: { [platform: string]: number };
  earningsByPlatform?: { [platform: string]: number };
  kmDriven: number;
  carAutonomy: number;
  fuelConsumed: number;
  fuelCost: number;
  netProfit: number;
  earningsPerHour: number;
  observations?: string;
}

export interface Refuel {
  id: string;
  userId: string; // Adicionar campo userId
  date: string;
  totalValue: number;
  liters: number;
  pricePerLiter: number;
  type?: 'work' | 'personal';
}

export interface Transaction {
  id: string;
  userId: string; // Adicionar campo userId
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category?: string;
}

export interface Settings {
  userId: string; // Adicionar campo userId
  fuelPricePerLiter: number;
  platforms?: string[];
  incomeCategories?: string[];
  expenseCategories?: string[];
  weeklyGoal?: number;
}

export interface Summary {
  totalEarnings: number;
  totalTrips: number;
  totalHours: number;
  totalDays: number;
  totalKm: number;
  totalFuelLiters: number;
  totalFuelCost: number;
  averageConsumption: number;
  averageEarningsPerHour: number;
  tripsByPlatform?: { [platform: string]: number };
}

export interface CrudActions<T> {
  onEdit: (item: T) => void;
  onDelete: (id: string) => void;
}
