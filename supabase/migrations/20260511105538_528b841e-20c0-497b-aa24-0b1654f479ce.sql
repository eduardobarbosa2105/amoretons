-- DEV MODE: liberar CRUD público nas tabelas principais enquanto não há auth
-- Reverter antes de publicar restaurando policies "is_band_member(auth.uid())"

DROP POLICY IF EXISTS "songs dev anon all" ON public.songs;
CREATE POLICY "songs dev anon all" ON public.songs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "events dev anon all" ON public.events;
CREATE POLICY "events dev anon all" ON public.events
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "event_songs dev anon all" ON public.event_songs;
CREATE POLICY "event_songs dev anon all" ON public.event_songs
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "song_suggestions dev anon all" ON public.song_suggestions;
CREATE POLICY "song_suggestions dev anon all" ON public.song_suggestions
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "rehearsals dev anon all" ON public.rehearsals;
CREATE POLICY "rehearsals dev anon all" ON public.rehearsals
  FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

-- Storage bucket para arquivos de áudio/partituras
INSERT INTO storage.buckets (id, name, public)
VALUES ('song-files', 'song-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "song-files dev read" ON storage.objects;
CREATE POLICY "song-files dev read" ON storage.objects
  FOR SELECT USING (bucket_id = 'song-files');

DROP POLICY IF EXISTS "song-files dev write" ON storage.objects;
CREATE POLICY "song-files dev write" ON storage.objects
  FOR INSERT TO anon, authenticated WITH CHECK (bucket_id = 'song-files');

DROP POLICY IF EXISTS "song-files dev update" ON storage.objects;
CREATE POLICY "song-files dev update" ON storage.objects
  FOR UPDATE TO anon, authenticated USING (bucket_id = 'song-files');

DROP POLICY IF EXISTS "song-files dev delete" ON storage.objects;
CREATE POLICY "song-files dev delete" ON storage.objects
  FOR DELETE TO anon, authenticated USING (bucket_id = 'song-files');
