
export const calculateFuelConsumed = (kmDriven: number, carAutonomy: number): number => {
  return kmDriven / carAutonomy;
};

export const calculateFuelCost = (fuelConsumed: number, pricePerLiter: number): number => {
  return fuelConsumed * pricePerLiter;
};

export const calculateNetProfit = (earnings: number, fuelCost: number): number => {
  return earnings - fuelCost;
};

export const calculateEarningsPerHour = (netProfit: number, hoursWorked: number): number => {
  return hoursWorked > 0 ? netProfit / hoursWorked : 0;
};

export const calculateHoursWorked = (startTime: string, endTime: string): number => {
  const start = new Date(`2000-01-01T${startTime}`);
  const end = new Date(`2000-01-01T${endTime}`);
  
  if (end < start) {
    end.setDate(end.getDate() + 1);
  }
  
  return (end.getTime() - start.getTime()) / (1000 * 60 * 60);
};

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
};

export const formatNumber = (value: number, decimals: number = 2): string => {
  return Number(value.toFixed(decimals)).toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  });
};
