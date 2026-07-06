// Push Notification Service
// Handles requesting permission, subscribing/unsubscribing from Web Push

import { supabase } from '../lib/supabase'

export const VAPID_PUBLIC_KEY = 'BJH5T01zddDbCKAChuzRa8A6R8yP6ZXQYAszAhshtiIpLKmGSwChdw-DLdUvEEXl1fNReIHIGT8unIuptAB34Dc'

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function isPushSupported(): Promise<boolean> {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
}

export async function getCurrentPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) return 'denied'
  return Notification.permission
}

export async function requestPushSubscription(userId: string): Promise<{ success: boolean; message: string }> {
  if (!(await isPushSupported())) {
    return { success: false, message: 'Push notifications are not supported in this browser.' }
  }

  // Request permission
  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { success: false, message: 'Notification permission was denied.' }
  }

  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as any,
    })

    const subJson = subscription.toJSON()
    const p256dh = subJson.keys?.p256dh
    const auth = subJson.keys?.auth

    if (!p256dh || !auth) {
      return { success: false, message: 'Failed to retrieve subscription keys.' }
    }

    // Save subscription to Supabase
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint: subscription.endpoint,
        p256dh,
        auth,
      }, { onConflict: 'user_id,endpoint' })

    if (error) {
      console.error('Error saving push subscription:', error)
      return { success: false, message: 'Failed to save your subscription. Please try again.' }
    }

    return { success: true, message: 'Push notifications enabled!' }
  } catch (err: any) {
    console.error('Push subscription error:', err)
    return { success: false, message: err.message || 'Failed to subscribe to notifications.' }
  }
}

export async function removePushSubscription(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()

    if (subscription) {
      // Remove from database first
      await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', subscription.endpoint)

      // Then unsubscribe from push manager
      await subscription.unsubscribe()
    }

    return { success: true, message: 'Push notifications disabled.' }
  } catch (err: any) {
    console.error('Push unsubscribe error:', err)
    return { success: false, message: 'Failed to unsubscribe. Please try again.' }
  }
}

export async function isCurrentlySubscribed(): Promise<boolean> {
  try {
    if (!(await isPushSupported())) return false
    const registration = await navigator.serviceWorker.ready
    const subscription = await registration.pushManager.getSubscription()
    return subscription !== null && Notification.permission === 'granted'
  } catch {
    return false
  }
}
