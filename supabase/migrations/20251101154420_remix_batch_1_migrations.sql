
-- Migration: 20251101150338
-- Create table for tracking Notas Fiscais Eletrônica
CREATE TABLE public.notas_fiscais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nfe_number TEXT NOT NULL,
  supplier TEXT NOT NULL,
  value DECIMAL(10, 2) NOT NULL,
  issue_date DATE NOT NULL,
  month_year TEXT NOT NULL,
  sent_to_accounting BOOLEAN NOT NULL DEFAULT false,
  is_paid BOOLEAN NOT NULL DEFAULT false,
  added_to_stock BOOLEAN NOT NULL DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for faster filtering by month
CREATE INDEX idx_notas_fiscais_month_year ON public.notas_fiscais(month_year);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_notas_fiscais_updated_at
BEFORE UPDATE ON public.notas_fiscais
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security (for internal tool, allowing all operations)
ALTER TABLE public.notas_fiscais ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (internal tool)
CREATE POLICY "Allow all operations on notas_fiscais" 
ON public.notas_fiscais 
FOR ALL 
USING (true)
WITH CHECK (true);
