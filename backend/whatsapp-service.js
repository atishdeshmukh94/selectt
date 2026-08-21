const axios = require('axios');

/**
 * Sends an OTP via official WhatsApp Business API (Meta)
 * @param {string} phone - Recipient phone number with country code (e.g. 919876543210)
 * @param {string} otp - 6-digit OTP code
 * @param {object} settings - WhatsApp configuration settings
 */
const sendWhatsAppOTP = async (phone, otp, settings) => {
    const provider = settings.whatsapp_provider || 'meta';

    if (provider === 'gallabox') {
        const {
            gallabox_api_key,
            gallabox_api_secret,
            gallabox_channel_id,
            gallabox_template_name
        } = settings;

        if (!gallabox_api_key || !gallabox_api_secret || !gallabox_channel_id || !gallabox_template_name) {
            throw new Error('Gallabox WhatsApp API is not configured in Site Settings');
        }

        const url = 'https://server.gallabox.com/devapi/messages/whatsapp';
        const cleanPhone = phone.replace(/\D/g, '');

        // Gallabox template payload
        const payload = {
            channelId: gallabox_channel_id,
            channelType: "whatsapp",
            recipient: {
                name: "Customer",
                phone: cleanPhone
            },
            whatsapp: {
                type: "template",
                template: {
                    templateName: gallabox_template_name,
                    bodyValues: {
                        "1": otp,
                        "otp": otp
                    }
                }
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'apiKey': gallabox_api_key,
                    'apiSecret': gallabox_api_secret,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.response?.data?.message || error.message;
            console.error('Gallabox API Error:', error.response?.data || error.message);
            throw new Error(`Gallabox API Error: ${errorMsg}`);
        }
    } else {
        // Official Meta WhatsApp Business API Setup
        const {
            whatsapp_api_token,
            whatsapp_phone_number_id,
            whatsapp_otp_template_name
        } = settings;

        if (!whatsapp_api_token || !whatsapp_phone_number_id || !whatsapp_otp_template_name) {
            throw new Error('WhatsApp API is not configured in Site Settings');
        }

        // Meta Graph API URL for sending messages
        const url = `https://graph.facebook.com/v19.0/${whatsapp_phone_number_id}/messages`;
        
        // Clean phone number: remove any non-digit characters
        const cleanPhone = phone.replace(/\D/g, '');
        
        // Standard payload for an OTP template
        // Note: Template must be pre-approved in Meta Business Suite
        const payload = {
            messaging_product: "whatsapp",
            to: cleanPhone,
            type: "template",
            template: {
                name: whatsapp_otp_template_name,
                language: {
                    code: "en" // Adjust if your template uses a different language
                },
                components: [
                    {
                        type: "body",
                        parameters: [
                            {
                                type: "text",
                                text: otp
                            }
                        ]
                    },
                    {
                        "type": "button",
                        "sub_type": "url",
                        "index": "0",
                        "parameters": [
                            {
                                "type": "text",
                                "text": otp
                            }
                        ]
                    }
                ]
            }
        };

        try {
            const response = await axios.post(url, payload, {
                headers: {
                    'Authorization': `Bearer ${whatsapp_api_token}`,
                    'Content-Type': 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            const errorMsg = error.response?.data?.error?.message || error.message;
            console.error('WhatsApp API Error:', error.response?.data || error.message);
            throw new Error(`WhatsApp API Error: ${errorMsg}`);
        }
    }
};

module.exports = { sendWhatsAppOTP };
