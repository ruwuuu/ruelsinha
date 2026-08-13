// [[path]].js - Cloudflare Pages Function for Location Logging

// ** CRITICAL: PASTE YOUR GOOGLE SHEETS WEB APP URL HERE **
const LOGGING_ENDPOINT =
  'https://script.google.com/macros/s/AKfycbzHe0i9d3BC0TLZq33ch3CkrXIjyOM7OMb1rkEGCrJ_hidQ2l7U15rT82JASk1im9Z2/exec';

export async function onRequest(context) {
  // 1. Capture the necessary request headers provided by Cloudflare's network
  const city = context.request.headers.get('cf-ipcity') || 'Unknown City';
  const region = context.request.headers.get('cf-ipregion') || 'Unknown Region'; // State/Province
  const country = context.request.headers.get('cf-ipcountry') || 'Unknown Country';
  const ip = context.request.headers.get('cf-connecting-ip') || 'Unknown IP'; // Visitor's IP

  const logData = {
    timestamp: new Date().toISOString(),
    city: city,
    region: region,
    country: country,
    ip: ip,
  };

  // 2. Asynchronously send the data to your Google Sheet API (LOGGING_ENDPOINT)
  // context.waitUntil ensures logging happens without delaying the user's page load.
  context.waitUntil(
    fetch(LOGGING_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(logData),
    }).catch((err) => console.error('Location Logging Failed:', err))
  );

  // 3. Pass the request through to the static assets (the React website)
  // This serves the page content to the visitor as normal.
  return context.next();
}
