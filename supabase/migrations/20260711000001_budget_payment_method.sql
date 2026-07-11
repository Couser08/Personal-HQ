-- Add payment_method column to budget_transactions
ALTER TABLE public.budget_transactions 
ADD COLUMN IF NOT EXISTS payment_method text NOT NULL DEFAULT 'online' CHECK (payment_method IN ('cash', 'online'));
