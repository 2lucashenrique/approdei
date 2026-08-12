
import { DateFilterOptions } from '@/components/filters/DateFilter';

export const filterByDate = <T extends { date: string }>(
  items: T[],
  dateFilter: DateFilterOptions
): T[] => {
  if (dateFilter.type === 'all') {
    return items;
  }

  return items.filter(item => {
    const itemDate = new Date(item.date + 'T12:00:00');
    
    switch (dateFilter.type) {
      case 'specific-date':
        if (!dateFilter.specificDate) return true;
        const specificDate = new Date(dateFilter.specificDate + 'T12:00:00');
        return (
          itemDate.getDate() === specificDate.getDate() &&
          itemDate.getMonth() === specificDate.getMonth() &&
          itemDate.getFullYear() === specificDate.getFullYear()
        );
      
      case 'date-range':
        if (!dateFilter.startDate && !dateFilter.endDate) return true;
        const start = dateFilter.startDate ? new Date(dateFilter.startDate + 'T00:00:00') : null;
        const end = dateFilter.endDate ? new Date(dateFilter.endDate + 'T23:59:59') : null;
        
        if (start && end) {
          return itemDate >= start && itemDate <= end;
        } else if (start) {
          return itemDate >= start;
        } else if (end) {
          return itemDate <= end;
        }
        return true;
      
      case 'month':
        if (!dateFilter.month || !dateFilter.year) return true;
        return (
          itemDate.getMonth() === parseInt(dateFilter.month) - 1 &&
          itemDate.getFullYear() === dateFilter.year
        );
      
      default:
        return true;
    }
  });
};
