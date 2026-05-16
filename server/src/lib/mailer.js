const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport(
  process.env.EMAIL_SERVICE === 'sendgrid'
    ? { host: 'smtp.sendgrid.net', port: 587, auth: { user: 'apikey', pass: process.env.EMAIL_PASS } }
    : process.env.EMAIL_SERVICE === 'mailtrap'
    ? { host: 'sandbox.smtp.mailtrap.io', port: 587, auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }
    : { service: 'gmail', auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS } }
)

async function sendOrderEmail(order) {
  const rows = order.items.map(i =>
    `<tr>
      <td style="padding:8px;border-bottom:1px solid #eee">${i.name}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${i.qty}</td>
      <td style="padding:8px;border-bottom:1px solid #eee;text-align:right">${i.price.toFixed(2)}</td>
    </tr>`).join('')

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to:   process.env.ADMIN_EMAIL,
    subject: `🛒 New Order #${order._id} — ${order.customer.name}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#f8f8f4;color:#f98512;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:22px"> </h1>
          <p style="margin:6px 0 0;opacity:0.8">New order received</p>
        </div>
        <div style="padding:24px;background:#f9f9f9">
          <h2 style="margin:0 0 16px;font-size:16px">Customer</h2>
          <p style="margin:4px 0"><strong>Name:</strong> ${order.customer.name}</p>
          <p style="margin:4px 0"><strong>Phone:</strong> ${order.customer.phone}</p>
          <p style="margin:4px 0"><strong>Address:</strong> ${order.customer.address}</p>
          <h2 style="margin:24px 0 12px;font-size:16px">Items</h2>
          <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden">
            <thead><tr style="background:#eee">
              <th style="padding:10px;text-align:left">Product</th>
              <th style="padding:10px;text-align:center">Qty</th>
              <th style="padding:10px;text-align:right">Price</th>
            </tr></thead>
            <tbody>${rows}</tbody>
            <tfoot><tr>
              <td colspan="2" style="padding:10px;font-weight:bold">Total</td>
              <td style="padding:10px;text-align:right;font-weight:bold">${order.total.toFixed(2)}</td>
            </tr></tfoot>
          </table>
        </div>
        <div style="padding:16px 24px;background:#eee;border-radius:0 0 12px 12px;font-size:12px;color:#666">
          Order ID: ${order._id} · ${new Date().toLocaleString()}
        </div>
      </div>`
  })
}

async function sendOutOfStockEmail(product) {
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to:   process.env.ADMIN_EMAIL,
    subject: `🚨 Out of Stock: ${product.name}`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#f8f8f4;color:#f98512;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:22px"> </h1>
          <p style="margin:6px 0 0;opacity:0.8">⚠️ Stock Alert</p>
        </div>
        <div style="padding:24px;background:#fff3f3;border:2px solid #ef4444;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 12px;color:#ef4444;font-size:18px">Product Out of Stock</h2>
          <p style="margin:4px 0"><strong>Product:</strong> ${product.name}</p>
          <p style="margin:4px 0"><strong>SKU / ID:</strong> ${product._id}</p>
          <p style="margin:4px 0"><strong>Current Stock:</strong> <span style="color:#ef4444;font-weight:bold">0</span></p>
          <p style="margin:16px 0 0;font-size:13px;color:#666">This product is no longer available in your store. Please restock it as soon as possible.</p>
          <p style="margin:4px 0;font-size:12px;color:#999">${new Date().toLocaleString()}</p>
        </div>
      </div>`
  })
}

async function sendLowStockEmail(product, remaining) {
  const threshold = parseInt(process.env.LOW_STOCK_THRESHOLD || 5)
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to:   process.env.ADMIN_EMAIL,
    subject: `⚠️ Low Stock Warning: ${product.name} (${remaining} left)`,
    html: `
      <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto">
        <div style="background:#f8f8f4;color:#f98512;padding:24px;border-radius:12px 12px 0 0">
          <h1 style="margin:0;font-size:22px"> </h1>
          <p style="margin:6px 0 0;opacity:0.8">⚠️ Stock Alert</p>
        </div>
        <div style="padding:24px;background:#fffbeb;border:2px solid #f59e0b;border-radius:0 0 12px 12px">
          <h2 style="margin:0 0 12px;color:#d97706;font-size:18px">Low Stock Warning</h2>
          <p style="margin:4px 0"><strong>Product:</strong> ${product.name}</p>
          <p style="margin:4px 0"><strong>SKU / ID:</strong> ${product._id}</p>
          <p style="margin:4px 0"><strong>Remaining Stock:</strong> <span style="color:#d97706;font-weight:bold">${remaining}</span></p>
          <p style="margin:4px 0"><strong>Alert Threshold:</strong> ${threshold} units</p>
          <p style="margin:16px 0 0;font-size:13px;color:#666">Consider restocking this product soon to avoid running out.</p>
          <p style="margin:4px 0;font-size:12px;color:#999">${new Date().toLocaleString()}</p>
        </div>
      </div>`
  })
}

// ── Expo Push Notifications ───────────────────────────────────────────────────
// Reads admin push tokens stored in process.env.PUSH_TOKENS (JSON array)
// and sends a push notification to each registered device.
async function sendPushNotification({ title, body, data = {} }) {
  const tokens = (() => { try { return JSON.parse(process.env.PUSH_TOKENS || '[]') } catch { return [] } })()
  if (!tokens.length) return
  const messages = tokens.map(token => ({
    to: token, sound: 'default', title, body, data,
    priority: 'high', channelId: 'admin-alerts',
  }))
  try {
    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { 'Accept': 'application/json', 'Accept-Encoding': 'gzip, deflate', 'Content-Type': 'application/json' },
      body: JSON.stringify(messages),
    })
  } catch (e) { console.warn('Push notification failed:', e.message) }
}

module.exports = { sendOrderEmail, sendOutOfStockEmail, sendLowStockEmail, sendPushNotification }
