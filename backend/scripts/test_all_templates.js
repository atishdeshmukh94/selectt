(async () => {
  const settings = {
    channelId: '687de856ba93969639c5815d',
    apiKey: '6a266646fb427251e4a36c71',
    apiSecret: 'dad859177c7c44a3af02466d48625519'
  };

  const templatesToTest = [
    {
      name: 'sell_request (customer_got_sell_price_for_their_car)',
      template: 'customer_got_sell_price_for_their_car',
      bodyValues: { "1": "Rohit", "2": "2021 Kia Sonet", "3": "#SELL-4", "customer_name": "Rohit", "car_name": "2021 Kia Sonet", "request_id": "#SELL-4" }
    },
    {
      name: 'sell_inspection_scheduled (schedule_visit_confim)',
      template: 'schedule_visit_confim',
      bodyValues: { "1": "Rohit", "2": "2021 Kia Sonet", "3": "28 Sep, 11:00 AM", "customer_name": "Rohit", "car_name": "2021 Kia Sonet", "date_slot": "28 Sep, 11:00 AM" }
    },
    {
      name: 'test_drive (schedule_visit_confim)',
      template: 'schedule_visit_confim',
      bodyValues: { "1": "Rohit", "2": "2025 Skoda Kylaq", "3": "28 Sep, 02:00 PM", "customer_name": "Rohit", "car_name": "2025 Skoda Kylaq", "date_slot": "28 Sep, 02:00 PM" }
    },
    {
      name: 'loan_application (hot_lead_sequence_3_2026)',
      template: 'hot_lead_sequence_3_2026',
      bodyValues: { "1": "Rohit", "2": "Vehicle Loan", "3": "5,00,000", "4": "9,500", "customer_name": "Rohit" }
    }
  ];

  for (const t of templatesToTest) {
    const payload = {
      channelId: settings.channelId,
      channelType: "whatsapp",
      recipient: { name: "Rohit Yadav", phone: "919753003648" },
      whatsapp: {
        type: "template",
        template: {
          templateName: t.template,
          bodyValues: t.bodyValues
        }
      }
    };

    const res = await fetch('https://server.gallabox.com/devapi/messages/whatsapp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apiKey': settings.apiKey,
        'apiSecret': settings.apiSecret
      },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(e => ({ error: e.message }));
    console.log(`[${t.name}] HTTP ${res.status}:`, data.status || data.message || data);
  }
})();
