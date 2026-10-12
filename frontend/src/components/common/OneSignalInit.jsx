import { useEffect, useRef } from 'react';
import { useSiteSettings } from '../../context/SiteSettingsContext';

/**
 * OneSignal Web Push Notification Initializer for Selectt
 * Initializes OneSignal Web SDK v16 when enabled in Admin settings.
 */
export default function OneSignalInit() {
  const { settings } = useSiteSettings();
  const initializedRef = useRef(false);

  useEffect(() => {
    const isEnabled = settings?.onesignal_enabled === 'true' || settings?.onesignal_enabled === true;
    const appId = settings?.onesignal_app_id?.trim();

    if (!isEnabled || !appId) return;
    if (initializedRef.current) return;

    try {
      window.OneSignalDeferred = window.OneSignalDeferred || [];
      window.OneSignalDeferred.push(async function (OneSignal) {
        if (!OneSignal || typeof OneSignal.init !== 'function') return;
        if (OneSignal?.initialized || window.__oneSignalInitialized) {
          initializedRef.current = true;
          return;
        }

        const promptEnabled = settings?.onesignal_prompt_enabled === 'true' || settings?.onesignal_prompt_enabled === true;

        await OneSignal.init({
          appId: appId,
          allowLocalhostAsSecureOrigin: true,
          serviceWorkerParam: { scope: '/' },
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          notifyButton: {
            enable: promptEnabled,
            size: 'medium',
            position: 'bottom-left',
            showCredit: false,
            text: {
              'tip.state.unsubscribed': 'Subscribe to price drops & new cars',
              'tip.state.subscribed': 'You are subscribed to Selectt car alerts',
              'tip.state.blocked': 'You have blocked notifications',
              'message.action.subscribed': 'Thanks for subscribing to Selectt cars!',
              'message.action.resubscribed': 'You are subscribed to Selectt car alerts',
              'message.action.unsubscribed': "You won't receive car notifications",
              'dialog.main.title': 'Manage Selectt Car Alerts',
              'dialog.main.button.subscribe': 'SUBSCRIBE',
              'dialog.main.button.unsubscribe': 'UNSUBSCRIBE',
            },
          },
        });

        initializedRef.current = true;
      });
    } catch (err) {
      console.warn('[OneSignal] Initialization error:', err);
    }
  }, [settings?.onesignal_enabled, settings?.onesignal_app_id, settings?.onesignal_prompt_enabled]);

  return null;
}
