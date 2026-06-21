-- Create channels table
CREATE TABLE public.channels (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add channel_id to messages table
ALTER TABLE public.messages 
ADD COLUMN channel_id uuid REFERENCES public.channels(id) ON DELETE CASCADE;

-- Create index for better performance
CREATE INDEX messages_channel_id_idx ON public.messages(channel_id);

-- Enable RLS on channels
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;

-- Channels policies
CREATE POLICY "Anyone can view channels"
  ON public.channels FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create channels"
  ON public.channels FOR INSERT
  WITH CHECK (auth.uid() = created_by);

-- Update messages policy to consider channels
DROP POLICY IF EXISTS "Authenticated users can insert messages" ON public.messages;
CREATE POLICY "Authenticated users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = user_id AND channel_id IS NOT NULL);

-- Update trigger for channels
CREATE OR REPLACE FUNCTION public.update_channel_timestamp()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_channels_updated_at
  BEFORE UPDATE ON public.channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_channel_timestamp();

-- Create a default general channel
INSERT INTO public.channels (name, description)
VALUES ('General', 'Welcome to the general chat!');

-- Add realtime for channels
ALTER PUBLICATION supabase_realtime ADD TABLE public.channels;