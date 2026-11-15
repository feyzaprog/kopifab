-- Jalankan di Supabase: SQL Editor > New query > Run
create table public.pesan (
  id bigint generated always as identity primary key,
  name text not null check (char_length(name) between 2 and 40),
  text text not null check (char_length(text) between 2 and 300),
  tampil boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.pesan enable row level security;
create policy "baca pesan yang tampil" on public.pesan for select to anon using (tampil = true);
create policy "kirim pesan" on public.pesan for insert to anon
  with check (tampil = true and char_length(name) between 2 and 40 and char_length(text) between 2 and 300);
-- Tidak ada policy update/delete: pesan hanya bisa diubah atau dihapus lewat dashboard Supabase.
