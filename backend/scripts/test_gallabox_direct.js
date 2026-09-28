(async () => {
  const settings = {
    gallabox_channel_id: '687de856ba93969639c5815d',
    gallabox_api_key: '6a266646fb427251e4a36c71',
    gallabox_api_secret: 'dad859177c7c44a3af02466d48625519',
    gallabox_tpl_car_booking: 'car_booking_confirmation'
  };

  const testPayload = {
    channelId: settings.gallabox_channel_id,
    channelType: "whatsapp",
    recipient: {
      name: "Rohit Yadav",
      phone: "919753003648"
    },
    whatsapp: {
      type: "template",
      template: {
        templateName: settings.gallabox_tpl_car_booking,
        bodyValues: {
          "1": "Rohit Yadav",
          "2": "2025 Skoda Kylaq",
          "3": "5,000",
          "4": "BK-755984",
          "customer_name": "Rohit Yadav",
          "car_name": "2025 Skoda Kylaq",
          "amount": "5,000",
          "booking_id": "BK-755984"
        }
      }
    }
  };

  console.log('Testing Gallabox message dispatch from local script...');
  const res = await fetch('https://server.gallabox.com/devapi/messages/whatsapp', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apiKey': settings.gallabox_api_key,
      'apiSecret': settings.gallabox_api_secret
    },
    body: JSON.stringify(testPayload)
  });
  const data = await res.json().catch(e => ({ error: e.message }));
  console.log('Gallabox HTTP Status:', res.status);
  console.log('Gallabox Response:', data);
})();
