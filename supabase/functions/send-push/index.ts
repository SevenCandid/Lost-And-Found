// @ts-nocheck
// Supabase Edge Function: send-push
// Triggered via a Supabase Database Webhook on the `notifications` table (INSERT events)

import { createClient } from "npm:@supabase/supabase-js@2";

// VAPID keys stored as Supabase secrets
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

import webpush from "npm:web-push@3.6.7";

webpush.setVapidDetails(
  "mailto:admin@lostandfound.app",
  VAPID_PUBLIC_KEY,
  VAPID_PRIVATE_KEY
);

Deno.serve(async (req) => {
  try {
    // Verify request is from Supabase webhook
    const body = await req.json();
    
    // The webhook sends the new record
    const notification = body.record;
    if (!notification) {
      return new Response("No record", { status: 400 });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Fetch all push subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("endpoint, p256dh, auth")
      .eq("user_id", notification.user_id);

    if (error || !subscriptions || subscriptions.length === 0) {
      return new Response("No subscriptions found", { status: 200 });
    }

    // Build the push payload
    const pushPayload = JSON.stringify({
      title: notification.title || "Lost & Found",
      body: notification.message || "You have a new notification",
      icon: "/icons/icon-192x192.png",
      badge: "/icons/icon-96x96.png",
      data: {
        url: notification.action_url || "/notifications",
        notification_id: notification.id,
      },
    });

    // Send to all devices
    const results = await Promise.allSettled(
      subscriptions.map(async (sub) => {
        try {
          const pushSubscription = {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            }
          };
          const res = await webpush.sendNotification(pushSubscription, pushPayload);
          console.log(`Push sent successfully to ${sub.endpoint}`);
          return res;
        } catch (err) {
          console.error(`Error sending push to ${sub.endpoint}:`, err);
          throw err;
        }
      })
    );

    const successCount = results.filter(r => r.status === "fulfilled").length;
    
    return new Response(
      JSON.stringify({ sent: successCount, total: subscriptions.length }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Push error:", err);
    return new Response(JSON.stringify({ error: String(err) }), { status: 500 });
  }
});
