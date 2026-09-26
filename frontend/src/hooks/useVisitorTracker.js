import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { API_URL } from '../config/api';

// Helper to get or generate persistent Visitor ID
function getVisitorId() {
  let vid = localStorage.getItem('selectt_visitor_id');
  if (!vid) {
    vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    localStorage.setItem('selectt_visitor_id', vid);
  }
  return vid;
}

// Helper to get or generate session-scoped Session ID
function getSessionId() {
  let sid = sessionStorage.getItem('selectt_session_id');
  if (!sid) {
    sid = 's_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
    sessionStorage.setItem('selectt_session_id', sid);
  }
  return sid;
}

// Device, Browser, and OS Detection
function getClientDetails() {
  const ua = navigator.userAgent || '';
  let deviceType = 'Desktop';
  if (/iPad|Tablet|(android(?!.*mobile))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobi|Android|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
    deviceType = 'Mobile';
  }

  let browser = 'Chrome';
  if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Opera|OPR/i.test(ua)) browser = 'Opera';

  let os = 'Windows';
  if (/Mac/i.test(ua)) os = 'macOS';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  return { deviceType, browser, os };
}

// Lightweight Geo Location Resolver (Cached per session)
async function getGeoLocation() {
  try {
    const cached = sessionStorage.getItem('selectt_visitor_geo');
    if (cached) {
      return JSON.parse(cached);
    }

    // Check user's selected location from app if available
    const appSelectedCity = localStorage.getItem('selected_location') || localStorage.getItem('selectedCity');

    // Attempt fast non-blocking lookup with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);

    const res = await fetch('https://ipapi.co/json/', { signal: controller.signal }).catch(() => null);
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json();
      const geo = {
        city: data.city || appSelectedCity || 'Mumbai',
        region: data.region || 'Maharashtra',
        country: data.country_name || 'India'
      };
      sessionStorage.setItem('selectt_visitor_geo', JSON.stringify(geo));
      return geo;
    }
  } catch {
    // Graceful fallback
  }

  const appSelectedCity = localStorage.getItem('selected_location') || localStorage.getItem('selectedCity') || 'Mumbai';
  return {
    city: appSelectedCity,
    region: 'Maharashtra',
    country: 'India'
  };
}

export function useVisitorTracker() {
  const location = useLocation();
  const activeVisitIdRef = useRef(null);
  const startTimeRef = useRef(Date.now());
  const intervalRef = useRef(null);

  useEffect(() => {
    const visitorId = getVisitorId();
    const sessionId = getSessionId();
    const { deviceType, browser, os } = getClientDetails();
    const currentPath = location.pathname + location.search;
    const pageTitle = document.title || 'Selectt';
    const referrer = document.referrer || 'Direct';

    startTimeRef.current = Date.now();
    let currentVisitId = null;

    // Send initial page track event
    const trackPage = async () => {
      try {
        const geo = await getGeoLocation();
        const payload = {
          visitor_id: visitorId,
          session_id: sessionId,
          page_url: currentPath,
          page_title: pageTitle,
          referrer: referrer,
          device_type: deviceType,
          browser: browser,
          os: os,
          city: geo.city,
          region: geo.region,
          country: geo.country,
          duration_seconds: 0,
          is_ping: false
        };

        const res = await fetch(`${API_URL}/api/analytics/track`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          const data = await res.json();
          if (data.visit_id) {
            currentVisitId = data.visit_id;
            activeVisitIdRef.current = data.visit_id;
          }
        }
      } catch (err) {
        // Silently fail to not disrupt user experience
      }
    };

    trackPage();

    // Heartbeat ping every 10 seconds to update time spent / duration
    intervalRef.current = setInterval(() => {
      const elapsedSeconds = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (elapsedSeconds > 0) {
        try {
          fetch(`${API_URL}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              visit_id: currentVisitId || activeVisitIdRef.current,
              session_id: sessionId,
              visitor_id: visitorId,
              page_url: currentPath,
              duration_seconds: elapsedSeconds,
              is_ping: true
            })
          }).catch(() => {});
        } catch {}
      }
    }, 10000);

    // Send final duration ping on unmount / navigation
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      const totalDuration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      if (totalDuration > 0) {
        const pingData = JSON.stringify({
          visit_id: currentVisitId || activeVisitIdRef.current,
          session_id: sessionId,
          visitor_id: visitorId,
          page_url: currentPath,
          duration_seconds: totalDuration,
          is_ping: true
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon(
            `${API_URL}/api/analytics/track`,
            new Blob([pingData], { type: 'application/json' })
          );
        } else {
          fetch(`${API_URL}/api/analytics/track`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: pingData,
            keepalive: true
          }).catch(() => {});
        }
      }
    };
  }, [location.pathname, location.search]);
}

export default useVisitorTracker;
