select
  exists (
    select 1
    from public.subscriptions
    where user_id = '<USER_ID>'
      and status in ('active', 'trialing')
  ) as has_active_subscription,
  exists (
    select 1
    from public.subscription_access_grants
    where user_id = '<USER_ID>'
      and ends_at > now()
  ) as has_active_core_grant;
