-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cnpj TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;

-- Create policy for shops (allow all operations)
CREATE POLICY "Allow all operations on shops"
ON public.shops
FOR ALL
USING (true)
WITH CHECK (true);

-- Create trigger for automatic timestamp updates on shops
CREATE TRIGGER update_shops_updated_at
BEFORE UPDATE ON public.shops
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add shop_id column to notas_fiscais table
ALTER TABLE public.notas_fiscais
ADD COLUMN shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE;

-- Create a default shop
INSERT INTO public.shops (cnpj, name)
VALUES ('00000000000000', 'Loja Principal');

-- Assign all existing NFes to the default shop
UPDATE public.notas_fiscais
SET shop_id = (SELECT id FROM public.shops WHERE cnpj = '00000000000000' LIMIT 1);

-- Make shop_id required after migration
ALTER TABLE public.notas_fiscais
ALTER COLUMN shop_id SET NOT NULL;

-- Create index for better performance
CREATE INDEX idx_notas_fiscais_shop_id ON public.notas_fiscais(shop_id);