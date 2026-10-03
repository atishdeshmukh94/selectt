const axios = require('axios');

/**
 * Default Neodove Webhook Endpoint provided by the user.
 * Can be overridden via Site Settings or NEODOVE_WEBHOOK_URL environment variable.
 */
const DEFAULT_NEODOVE_WEBHOOK_URL = 
    'https://eda0390f-321a-469b-8626-96ccef23232f.neodove.com/integration/custom/1b3a4680-2005-4ede-a529-3ce4d5e8bb86/leads';

/**
 * Normalizes phone numbers to a 10-digit Indian mobile number format as expected by Neodove.
 * Accepts string or number, strips country codes (+91, 91, 0), and returns an integer.
 * 
 * @param {string|number} phone
 * @returns {number|null} 10-digit integer or null if invalid
 */
function cleanMobile(phone) {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, '');
    if (digits.length === 10) {
        return parseInt(digits, 10);
    }
    if (digits.length === 12 && digits.startsWith('91')) {
        return parseInt(digits.slice(2), 10);
    }
    if (digits.length === 11 && digits.startsWith('0')) {
        return parseInt(digits.slice(1), 10);
    }
    if (digits.length > 10) {
        return parseInt(digits.slice(-10), 10);
    }
    return null;
}

/**
 * Retrieves the effective Neodove configuration from site_settings or environment variables.
 * 
 * @param {Function} [getSettingFn] - Optional site_settings lookup function
 * @returns {Promise<{ webhookUrl: string, enabled: boolean, updateExisting: boolean }>}
 */
async function getNeodoveConfig(getSettingFn) {
    let webhookUrl = process.env.NEODOVE_WEBHOOK_URL || DEFAULT_NEODOVE_WEBHOOK_URL;
    let enabled = process.env.NEODOVE_ENABLED !== 'false';
    let updateExisting = true;

    if (typeof getSettingFn === 'function') {
        try {
            const dbUrl = await getSettingFn('neodove_webhook_url');
            if (dbUrl && dbUrl.trim()) webhookUrl = dbUrl.trim();

            const dbEnabled = await getSettingFn('neodove_enabled');
            if (dbEnabled !== null && dbEnabled !== undefined) {
                enabled = String(dbEnabled).toLowerCase() !== 'false' && String(dbEnabled) !== '0';
            }

            const dbUpdate = await getSettingFn('neodove_update_existing');
            if (dbUpdate !== null && dbUpdate !== undefined) {
                updateExisting = String(dbUpdate).toLowerCase() !== 'false';
            }
        } catch (e) {
            console.error('⚠️ [Neodove CRM] Error fetching settings:', e.message);
        }
    }

    return { webhookUrl, enabled, updateExisting };
}

/**
 * Pushes a lead, inquiry, or customer interaction to Neodove CRM.
 * Mapped to Neodove Custom Contact Properties (CCP):
 * - detail1: Car Interested
 * - detail2: Buy urgency / Lead Type
 * - detail3: Summary / Notes
 * - detail4: Budget (Number)
 * - detail5: Agent / Source
 * 
 * @param {object} lead
 * @param {string} [lead.name]
 * @param {string|number} lead.mobile
 * @param {string} [lead.email]
 * @param {string} [lead.car_interested]
 * @param {string} [lead.urgency]
 * @param {string} [lead.summary]
 * @param {number|string} [lead.budget]
 * @param {string} [lead.agent]
 * @param {Function} [getSettingFn]
 * @returns {Promise<{ success: boolean, message?: string, error?: string, data?: any }>}
 */
async function pushLeadToNeodove(lead, getSettingFn) {
    try {
        const config = await getNeodoveConfig(getSettingFn);

        if (!config.enabled) {
            console.log('ℹ️ [Neodove CRM] Integration is currently disabled in settings. Skipping push.');
            return { success: false, skipped: true, message: 'Neodove CRM integration is disabled' };
        }

        const mobileNumber = cleanMobile(lead.mobile || lead.phone);
        if (!mobileNumber) {
            console.warn('⚠️ [Neodove CRM] Skipped push: No valid 10-digit mobile number found in payload.', { leadName: lead.name });
            return { success: false, message: 'Invalid mobile number' };
        }

        let parsedBudget = null;
        if (lead.budget !== undefined && lead.budget !== null && lead.budget !== '') {
            const num = Number(String(lead.budget).replace(/[^0-9.]/g, ''));
            if (!isNaN(num) && num > 0) parsedBudget = Math.round(num);
        }

        // Construct Neodove Payload
        const payload = {
            name: (lead.name && lead.name.trim()) ? lead.name.trim() : 'Customer',
            mobile: mobileNumber
        };

        if (lead.email && String(lead.email).includes('@')) {
            payload.email = lead.email.trim();
        }

        // Custom Contact Properties (CCP)
        if (lead.car_interested) {
            payload.detail1 = String(lead.car_interested).trim().slice(0, 255);
        }
        if (lead.urgency || lead.lead_type) {
            payload.detail2 = String(lead.urgency || lead.lead_type).trim().slice(0, 255);
        }
        if (lead.summary || lead.message) {
            payload.detail3 = String(lead.summary || lead.message).trim().slice(0, 500);
        }
        if (parsedBudget !== null) {
            payload.detail4 = parsedBudget;
        }
        if (lead.agent || lead.source) {
            payload.detail5 = String(lead.agent || lead.source).trim().slice(0, 100);
        }

        // Target webhook endpoint (do NOT append update=true for new leads)
        let targetUrl = config.webhookUrl;
        if (config.updateExisting && !targetUrl.includes('update=')) {
            // Only if explicitly required
            // targetUrl += (targetUrl.includes('?') ? '&' : '?') + 'update=true';
        }

        // Clean any existing query params if present in webhookUrl
        const cleanEndpoint = targetUrl.replace(/[?&]update=true/g, '');

        const response = await axios.post(cleanEndpoint, payload, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 8000
        });

        console.log(`✅ [Neodove CRM] Lead dispatched for ${payload.name} (${payload.mobile}): HTTP ${response.status}`);
        return { success: true, status: response.status, data: response.data };

    } catch (error) {
        const errorMsg = error.response?.data?.message || error.response?.data || error.message;
        console.error('❌ [Neodove CRM] Failed to dispatch lead:', errorMsg);
        return { success: false, error: String(errorMsg) };
    }
}

/**
 * Formats a customer database row and pushes it to Neodove CRM.
 * 
 * @param {object} customer - Customer record from database
 * @param {Function} [getSettingFn]
 * @returns {Promise<{ success: boolean, message?: string }>}
 */
async function pushCustomerToNeodove(customer, getSettingFn) {
    if (!customer) return { success: false, message: 'No customer data provided' };

    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || 'Selectt Customer';
    const addressParts = [
        customer.address,
        customer.area,
        customer.city,
        customer.state,
        customer.pincode
    ].filter(Boolean);

    const locationStr = [customer.city, customer.state].filter(Boolean).join(', ') || 'India';

    return await pushLeadToNeodove({
        name: fullName,
        mobile: customer.phone || customer.alt_phone,
        email: customer.email,
        car_interested: 'Registered Account',
        urgency: `Customer (${locationStr})`,
        summary: `Selectt User #${customer.id}. ${addressParts.length ? 'Address: ' + addressParts.join(', ') : 'Registered account on selectt.in'}. Reg: ${customer.created_at ? new Date(customer.created_at).toLocaleDateString('en-IN') : 'Recent'}`,
        agent: 'Selectt Portal'
    }, getSettingFn);
}

/**
 * Bulk syncs an array of customers to Neodove CRM with throttling to prevent API rate limiting.
 * 
 * @param {Array<object>} customers
 * @param {Function} [getSettingFn]
 * @param {Function} [onProgress]
 * @returns {Promise<{ total: number, synced: number, failed: number, skipped: number, errors: string[] }>}
 */
async function bulkSyncCustomers(customers, getSettingFn, onProgress) {
    const results = {
        total: customers.length,
        synced: 0,
        failed: 0,
        skipped: 0,
        errors: []
    };

    if (!Array.isArray(customers) || customers.length === 0) {
        return results;
    }

    for (let i = 0; i < customers.length; i++) {
        const cust = customers[i];
        try {
            const res = await pushCustomerToNeodove(cust, getSettingFn);
            if (res.success) {
                results.synced++;
            } else if (res.skipped) {
                results.skipped++;
            } else {
                results.failed++;
                if (res.error) results.errors.push(`Customer #${cust.id} (${cust.phone}): ${res.error}`);
            }
        } catch (e) {
            results.failed++;
            results.errors.push(`Customer #${cust.id}: ${e.message}`);
        }

        if (typeof onProgress === 'function') {
            onProgress(i + 1, customers.length);
        }

        // Small pause (120ms) between records to be respectful of Neodove webhook rate limits
        if (i < customers.length - 1) {
            await new Promise(r => setTimeout(r, 120));
        }
    }

    return results;
}

/**
 * Sends a test ping lead to Neodove CRM to verify connectivity.
 * 
 * @param {string} [webhookUrl] - Optional URL to test; defaults to configured URL
 * @returns {Promise<{ success: boolean, message: string }>}
 */
async function testNeodoveConnection(webhookUrl) {
    try {
        const targetUrl = (webhookUrl && webhookUrl.trim()) ? webhookUrl.trim() : DEFAULT_NEODOVE_WEBHOOK_URL;
        const testUrl = targetUrl + (targetUrl.includes('?') ? '&' : '?') + 'update=true';

        const testPayload = {
            name: "Neodove Ping Test (Selectt)",
            mobile: 9999999999,
            email: "support@selectt.in",
            detail1: "Connection Test",
            detail2: "Diagnostic Test",
            detail3: `Verification ping from Selectt Admin at ${new Date().toISOString()}`,
            detail4: 100000,
            detail5: "Admin Diagnostic"
        };

        const response = await axios.post(testUrl, testPayload, {
            headers: { 'Content-Type': 'application/json' },
            timeout: 8000
        });

        if (response.status >= 200 && response.status < 300) {
            return {
                success: true,
                message: `Connection successful! Neodove responded with HTTP ${response.status} (${typeof response.data === 'string' ? response.data : 'OK'}).`
            };
        } else {
            return {
                success: false,
                message: `Neodove returned unexpected status code: HTTP ${response.status}`
            };
        }
    } catch (error) {
        const errMsg = error.response?.data?.message || error.response?.data || error.message;
        return {
            success: false,
            message: `Connection failed: ${errMsg}`
        };
    }
}

module.exports = {
    DEFAULT_NEODOVE_WEBHOOK_URL,
    cleanMobile,
    getNeodoveConfig,
    pushLeadToNeodove,
    pushCustomerToNeodove,
    bulkSyncCustomers,
    testNeodoveConnection
};
