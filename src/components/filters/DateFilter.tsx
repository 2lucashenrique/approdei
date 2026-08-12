
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface DateFilterOptions {
  type: 'all' | 'specific-date' | 'date-range' | 'month';
  specificDate?: Date;
  startDate?: Date;
  endDate?: Date;
  month?: string;
  year?: number;
}

interface DateFilterProps {
  onFilterChange: (filters: DateFilterOptions) => void;
  initialFilters?: DateFilterOptions;
}

const DateFilter: React.FC<DateFilterProps> = ({ onFilterChange, initialFilters }) => {
  const [filters, setFilters] = useState<DateFilterOptions>(
    initialFilters || { type: 'all' }
  );
  const [isOpen, setIsOpen] = useState(false);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '01', label: 'Janeiro' },
    { value: '02', label: 'Fevereiro' },
    { value: '03', label: 'Março' },
    { value: '04', label: 'Abril' },
    { value: '05', label: 'Maio' },
    { value: '06', label: 'Junho' },
    { value: '07', label: 'Julho' },
    { value: '08', label: 'Agosto' },
    { value: '09', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' },
  ];

  const handleFilterTypeChange = (type: DateFilterOptions['type']) => {
    const newFilters: DateFilterOptions = { type };
    if (type === 'month') {
      newFilters.month = '01';
      newFilters.year = currentYear;
    }
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleSpecificDateChange = (date: Date | undefined) => {
    const newFilters = { ...filters, specificDate: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleDateRangeChange = (field: 'startDate' | 'endDate', date: Date | undefined) => {
    const newFilters = { ...filters, [field]: date };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleMonthChange = (month: string) => {
    const newFilters = { ...filters, month };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleYearChange = (year: number) => {
    const newFilters = { ...filters, year };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    const newFilters: DateFilterOptions = { type: 'all' };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const hasActiveFilters = filters.type !== 'all';

  return (
    <div className="relative">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "gap-2",
              hasActiveFilters && "border-blue-500 bg-blue-50"
            )}
          >
            <Filter size={16} />
            Filtrar por Data
            {hasActiveFilters && (
              <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                1
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent 
          className="w-80 p-0" 
          align="end"
          side="bottom"
          sideOffset={8}
        >
          <Card className="border-0 shadow-none">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Filtros de Data</CardTitle>
                <div className="flex gap-1">
                  {hasActiveFilters && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearFilters}
                      className="h-6 px-2 text-xs"
                    >
                      Limpar
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X size={12} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Tipo de Filtro</Label>
                <Select value={filters.type} onValueChange={handleFilterTypeChange}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os registros</SelectItem>
                    <SelectItem value="specific-date">Data específica</SelectItem>
                    <SelectItem value="month">Mês específico</SelectItem>
                    <SelectItem value="date-range">Período de datas</SelectItem>

                  </SelectContent>
                </Select>
              </div>

              {filters.type === 'specific-date' && (
                <div>
                  <Label>Data</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal mt-1",
                          !filters.specificDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {filters.specificDate
                          ? format(filters.specificDate, "dd/MM/yyyy")
                          : "Selecione uma data"
                        }
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={filters.specificDate}
                        onSelect={handleSpecificDateChange}
                        initialFocus
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              )}

              {filters.type === 'date-range' && (
                <div className="space-y-3">
                  <div>
                    <Label>Data Inicial</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !filters.startDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.startDate
                            ? format(filters.startDate, "dd/MM/yyyy")
                            : "Selecione data inicial"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.startDate}
                          onSelect={(date) => handleDateRangeChange('startDate', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label>Data Final</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal mt-1",
                            !filters.endDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {filters.endDate
                            ? format(filters.endDate, "dd/MM/yyyy")
                            : "Selecione data final"
                          }
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.endDate}
                          onSelect={(date) => handleDateRangeChange('endDate', date)}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              )}

              {filters.type === 'month' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Mês</Label>
                    <Select value={filters.month} onValueChange={handleMonthChange}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Ano</Label>
                    <Select value={filters.year?.toString()} onValueChange={(value) => handleYearChange(parseInt(value))}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DateFilter;
