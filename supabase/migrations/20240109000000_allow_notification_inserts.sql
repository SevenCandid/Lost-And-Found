-- Allow authenticated users to insert notifications (needed for chat messages)
create policy "Users can insert notifications"
  on public.notifications for insert
  to authenticated
  with check (true);
