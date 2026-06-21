
-- Supprimer temporairement les contraintes FK pour permettre les tests
-- ATTENTION : Ceci est uniquement pour le développement/test

-- Supprimer la contrainte FK sur messages.user_id
ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_user_id_fkey;

-- Supprimer la contrainte FK sur profiles.id
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Ajouter des profils fictifs pour les tests
INSERT INTO public.profiles (id, username, status) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Sophie_Paris', 'online'),
  ('22222222-2222-2222-2222-222222222222', 'Kenji_Tokyo', 'online'),
  ('33333333-3333-3333-3333-333333333333', 'Maria_Madrid', 'idle'),
  ('44444444-4444-4444-4444-444444444444', 'Ahmed_Dubai', 'online'),
  ('55555555-5555-5555-5555-555555555555', 'Emma_London', 'offline'),
  ('66666666-6666-6666-6666-666666666666', 'Carlos_BA', 'online'),
  ('77777777-7777-7777-7777-777777777777', 'Yuki_Seoul', 'idle'),
  ('88888888-8888-8888-8888-888888888888', 'Lucas_Berlin', 'online')
ON CONFLICT (id) DO NOTHING;
