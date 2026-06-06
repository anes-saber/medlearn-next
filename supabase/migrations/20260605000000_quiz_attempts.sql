create table public.quiz_attempts (
    id uuid primary key default gen_random_uuid(),
    quiz_id uuid not null references public.quizzes(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    answers_json jsonb not null default '{}'::jsonb,
    score integer not null default 0,
    total integer not null default 0,
    completed_at timestamp with time zone not null default now(),
    created_at timestamp with time zone not null default now()
);

alter table public.quiz_attempts enable row level security;

create policy "Users can view their own attempts"
    on public.quiz_attempts for select
    using (auth.uid() = user_id);

create policy "Teachers and admins can view all attempts"
    on public.quiz_attempts for select
    using (public.get_my_role() in ('teacher', 'admin'));

create policy "Users can insert their own attempts"
    on public.quiz_attempts for insert
    with check (auth.uid() = user_id);

-- Allow public inserts if anonymous users are allowed to take quizzes (since user_id is nullable)
create policy "Anonymous can insert attempts"
    on public.quiz_attempts for insert
    with check (auth.uid() is null and user_id is null);

create policy "Anonymous can view their attempts in current session (if any)"
    on public.quiz_attempts for select
    using (auth.uid() is null and user_id is null);
