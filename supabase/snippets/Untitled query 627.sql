insert into public.profiles (id, display_name, community_segment)
values (
  '2bb01db1-8263-4d0a-8255-39b6edd5d9be',
  'Steven',
  'conjunta'
)
on conflict (id) do update
set display_name = excluded.display_name,
    community_segment = excluded.community_segment;

insert into public.admin_users (user_id, role)
values (
  '2bb01db1-8263-4d0a-8255-39b6edd5d9be',
  'admin'
);
