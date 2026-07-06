// @ts-nocheck
// Supabase Edge Function: send-push
// Triggered via a Supabase Database Webhook on the `notifications` table (INSERT events)

import { createClient } from "npm:@supabase/supabase-js@2";

// VAPID keys stored as Supabase secrets
const VAPID_PUBLIC_KEY = Deno.env.get("VAPID_PUBLIC_KEY")!;
const VAPID_PRIVATE_KEY = Deno.env.get("VAPID_PRIVATE_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Utility: base64url encode
function base64urlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let str = "";
  for (const byte of bytes) str += String.fromCharCode(byte);
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Utility: base64url decode
function base64urlDecode(str: string): Uint8Array {
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) str += "=";
  const raw = atob(str);
  const buffer = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) buffer[i] = raw.charCodeAt(i);
  return buffer;
}

// Utility: create JWT for VAPID auth header
async function createVapidJwt(endpoint: string, privateKeyBytes: Uint8Array, publicKeyBytes: Uint8Array): Promise<string> {
  const url = new URL(endpoint);
  const audience = `${url.protocol}//${url.host}`;
  
  const now = Math.floor(Date.now() / 1000);
  const header = { typ: "JWT", alg: "ES256" };
  const payload = {
    aud: audience,
    exp: now + 12 * 60 * 60, // 12 hours
    sub: "mailto:admin@lostandfound.app"
  };

  const enc = new TextEncoder();
  const headerB64 = base64urlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64urlEncode(enc.encode(JSON.stringify(payload)));
  const signingInput = `${headerB64}.${payloadB64}`;

  const privateKey = await crypto.subtle.importKey(
    "raw",
    privateKeyBytes,
    { name: "ECDSA", namedCurve: "P-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    { name: "ECDSA", hash: "SHA-256" },
    privateKey,
    enc.encode(signingInput)
  );

  return `${signingInput}.${base64urlEncode(signature)}`;
}

// Send a push notification to a single subscription endpoint
async function sendPushNotification(subscription: { endpoint: string; p256dh: string; auth: string }, payload: string): Promise<Response> {
  const privateKeyBytes = base64urlDecode(VAPID_PRIVATE_KEY);
  const publicKeyBytes = base64urlDecode(VAPID_PUBLIC_KEY);
  
  const jwt = await createVapidJwt(subscription.endpoint, privateKeyBytes, publicKeyBytes);
  
  const vapidAuth = `vapid t=${jwt},k=${VAPID_PUBLIC_KEY}`;
  
  const enc = new TextEncoder();
  const payloadBytes = enc.encode(payload);

  // Encrypt the payload using Web Push encryption (RFC 8291)
  const recipientPublicKey = await crypto.subtle.importKey(
    "raw",
    base64urlDecode(subscription.p256dh),
    { name: "ECDH", namedCurve: "P-256" },
    false,
    []
  );

  const serverKeyPair = await crypto.subtle.generateKey(
    { name: "ECDH", namedCurve: "P-256" },
    true,
    ["deriveBits"]
  );

  const serverPublicKeyRaw = await crypto.subtle.exportKey("raw", serverKeyPair.publicKey);

  const sharedBits = await crypto.subtle.deriveBits(
    { name: "ECDH", public: recipientPublicKey },
    serverKeyPair.privateKey,
    256
  );

  const authInfo = enc.encode("Content-Encoding: auth\0");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const authBytes = base64urlDecode(subscription.auth);

  const ikm = await crypto.subtle.importKey("raw", sharedBits, "HKDF", false, ["deriveBits"]);

  const prk = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt: authBytes, info: authInfo },
    ikm,
    256
  );

  const serverPublicKeyBytes = new Uint8Array(serverPublicKeyRaw);
  const recipientPublicKeyBytes = base64urlDecode(subscription.p256dh);

  const keyInfo = new Uint8Array([
    ...enc.encode("Content-Encoding: aesgcm\0"),
    0x00, 0x41,
    ...recipientPublicKeyBytes,
    0x00, 0x41,
    ...serverPublicKeyBytes,
  ]);
  const nonceInfo = new Uint8Array([
    ...enc.encode("Content-Encoding: nonce\0"),
    0x00, 0x41,
    ...recipientPublicKeyBytes,
    0x00, 0x41,
    ...serverPublicKeyBytes,
  ]);

  const prkKey = await crypto.subtle.importKey("raw", prk, "HKDF", false, ["deriveBits"]);

  const contentEncryptionKey = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: keyInfo },
    prkKey,
    128
  );
  const nonce = await crypto.subtle.deriveBits(
    { name: "HKDF", hash: "SHA-256", salt, info: nonceInfo },
    prkKey,
    96
  );

  const aesKey = await crypto.subtle.importKey("raw", contentEncryptionKey, "AES-GCM", false, ["encrypt"]);

  const paddedPayload = new Uint8Array([0, 0, ...payloadBytes]);

  const encryptedBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: nonce },
    aesKey,
    paddedPayload
  );

  const headers: Record<string, string> = {
    "Authorization": vapidAuth,
    "Content-Encoding": "aesgcm",
    "Content-Type": "application/octet-stream",
    "Encryption": `salt=${base64urlEncode(salt)}`,
    "Crypto-Key": `dh=${base64urlEncode(serverPublicKeyRaw)};p256ecdsa=${VAPID_PUBLIC_KEY}`,
    "TTL": "86400",
  };

  return fetch(subscription.endpoint, {
    method: "POST",
    headers,
    body: encryptedBuffer,
  });
}

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
      subscriptions.map(sub => sendPushNotification(sub, pushPayload))
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
