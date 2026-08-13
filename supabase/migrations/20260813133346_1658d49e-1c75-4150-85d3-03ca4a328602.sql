-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own profile" ON public.profiles
    FOR ALL TO authenticated USING (auth.uid() = id);

-- Create trips table
CREATE TABLE public.trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    earnings DECIMAL(12, 2) NOT NULL DEFAULT 0,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    trip_count INTEGER NOT NULL DEFAULT 0,
    trips_by_platform JSONB DEFAULT '{}'::jsonb,
    earnings_by_platform JSONB DEFAULT '{}'::jsonb,
    km_driven DECIMAL(12, 2) NOT NULL DEFAULT 0,
    car_autonomy DECIMAL(12, 2) NOT NULL DEFAULT 0,
    fuel_consumed DECIMAL(12, 2) NOT NULL DEFAULT 0,
    fuel_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    net_profit DECIMAL(12, 2) NOT NULL DEFAULT 0,
    earnings_per_hour DECIMAL(12, 2) NOT NULL DEFAULT 0,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.trips TO authenticated;
GRANT ALL ON public.trips TO service_role;

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own trips" ON public.trips
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create refuels table
CREATE TABLE public.refuels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    total_value DECIMAL(12, 2) NOT NULL DEFAULT 0,
    liters DECIMAL(12, 2) NOT NULL DEFAULT 0,
    price_per_liter DECIMAL(12, 2) NOT NULL DEFAULT 0,
    type TEXT CHECK (type IN ('work', 'personal')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.refuels TO authenticated;
GRANT ALL ON public.refuels TO service_role;

ALTER TABLE public.refuels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own refuels" ON public.refuels
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create transactions table
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
    amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;

ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own transactions" ON public.transactions
    FOR ALL TO authenticated USING (auth.uid() = user_id);

-- Create user_settings table
CREATE TABLE public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    fuel_price_per_liter DECIMAL(12, 2) NOT NULL DEFAULT 5.50,
    platforms TEXT[] DEFAULT ARRAY['Uber', '99', 'Particular'],
    income_categories TEXT[] DEFAULT ARRAY['Particular', 'Serviço', 'Extras', 'Gorjetas', 'Bônus'],
    expense_categories TEXT[] DEFAULT ARRAY['Combustível', 'Manutenção', 'IPVA', 'Seguro', 'Lavagem', 'Estacionamento', 'Pedágio', 'Supermercado', 'Lanche', 'Outros'],
    weekly_goal DECIMAL(12, 2) DEFAULT 1000,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_settings TO authenticated;
GRANT ALL ON public.user_settings TO service_role;

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only access their own settings" ON public.user_settings
    FOR ALL TO authenticated USING (auth.uid() = user_id);
