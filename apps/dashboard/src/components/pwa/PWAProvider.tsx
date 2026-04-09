"use client";

import React, { useEffect, useState } from "react";
import { useAppStore } from "@/store";

export default function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const pushNotification = useAppStore(state => state.pushNotification);

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = "=".repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, "+")
      .replace(/_/g, "/");

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribeUserToPush = async (registration: ServiceWorkerRegistration) => {
    try {
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_KEY;
      if (!vapidPublicKey) {
        console.warn("VAPID KEY is not set. Push Notifications disabled.");
        return;
      }
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);
      
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      console.log("Device subscribed to Push Notifications:", subscription);
      // NOTE: Here you would send the `subscription` object to your Go backend.
      // fetch('/api/subscribe', { method: 'POST', body: JSON.stringify(subscription) });
      
    } catch (err) {
      console.error("Failed to subscribe the user: ", err);
    }
  };


  useEffect(() => {
    // Registrasi Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker registered with scope:", registration.scope);
            
            // Check for updates
            registration.onupdatefound = () => {
              const installingWorker = registration.installing;
              if (installingWorker == null) {
                return;
              }
              installingWorker.onstatechange = () => {
                if (installingWorker.state === 'installed') {
                  if (navigator.serviceWorker.controller) {
                    // Update available
                    console.log("New PWA content is available; please refresh.");
                    pushNotification({
                      title: "Pembaruan Sistem",
                      description: "Versi terbaru SENTINEL tersedia. Muat ulang aplikasi untuk mengaplikasikan.",
                      level: "warning"
                    });
                  } else {
                    // Content is cached for offline use
                    console.log("PWA content is cached for offline use.");
                  }
                }
              };
            };
            
            // Auto subscribe for Push Notification when VAPID is available and permission granted
            if (Notification.permission === "granted") {
              subscribeUserToPush(registration);
            }
          })
          .catch((error) => {
            console.error("Service Worker registration failed:", error);
          });
      });
    }
    setIsReady(true);
  }, [pushNotification]);

  return <>{children}</>;
}

// Helper: Push Notification Permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!("Notification" in window)) {
    console.error("Browser tidak mendukung push notifications.");
    return false;
  }

  // Jika sudah diberikan izin, bypass
  if (Notification.permission === "granted") return true;

  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      console.log("Notifikasi diizinkan.");
      // Di sini trigger registrasi push manager ke Backend Go (Lihat instruksi)
      return true;
    }
  } catch (error) {
    console.error("Gagal meminta izin notifikasi:", error);
  }

  return false;
};
