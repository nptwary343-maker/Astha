const { MongoClient } = require('mongodb');

// Connection URL
const uri = "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

// Updated Template with Security Key
const NEW_HTML_TEMPLATE = `
<!DOCTYPE html>
<html>
<head>
<style>
  body { background-color: #f3f4f6; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; margin: 0; padding: 0; }
  .wrapper { width: 100%; table-layout: fixed; background-color: #f3f4f6; padding-bottom: 40px; }
  .card { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); }
  
  /* Header Gradient */
  .header { 
    background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
    padding: 30px 20px; 
    text-align: center; 
    color: #ffffff; 
  }
  .header h1 { margin: 10px 0 5px; font-size: 22px; font-weight: 700; }
  .lock-icon { font-size: 32px; display: block; margin-bottom: 5px; }

  /* Content Body */
  .content { padding: 30px; color: #374151; }
  .greeting { font-size: 18px; font-weight: 600; margin-bottom: 15px; color: #111827; }
  .message { line-height: 1.6; margin-bottom: 25px; font-size: 15px; color: #4b5563; }

  /* SECRET KEY BOX */
  .key-box {
    background: #ecfdf5;
    border: 2px dashed #059669;
    padding: 20px;
    text-align: center;
    border-radius: 8px;
    margin-bottom: 30px;
  }
  .key-label { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #047857; font-weight: 700; margin-bottom: 5px; display: block; }
  .security-key { font-size: 28px; font-family: monospace; font-weight: 800; color: #064e3b; letter-spacing: 4px; background: #fff; padding: 5px 15px; border-radius: 4px; display: inline-block; }
  .key-info { font-size: 11px; color: #059669; margin-top: 5px; opacity: 0.8; }

  /* Order Summary */
  .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
  .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #d1d5db; padding: 10px 0; font-size: 14px; }
  .row:last-child { border-bottom: none; font-weight: 700; color: #111827; margin-top: 5px; }
  
  .btn { 
    display: block; 
    width: 100%; 
    text-align: center; 
    background-color: #111827; 
    color: #ffffff; 
    padding: 14px 0; 
    border-radius: 6px; 
    text-decoration: none; 
    font-weight: 600; 
    margin-top: 25px;
  }
  
  .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
</style>
</head>
<body>

<div class="wrapper">
  <div style="height: 30px;"></div>
  
  <div class="card">
    <div class="header">
      <span class="lock-icon">🔒</span>
      <h1>Order Secured</h1>
      <p>Order #{{orderId}} Confirmed</p>
    </div>

    <div class="content">
      <div class="greeting">Hello {{customerName}},</div>
      <div class="message">
        Your order has been successfully placed. Please keep the <strong>Secret Key</strong> below safe. You may need to show this to the delivery agent to receive your package.
      </div>

      <!-- SECURITY KEY SECTION -->
      <div class="key-box">
        <span class="key-label">Secret Delivery Key</span>
        <span class="security-key">{{securityKey}}</span>
        <div class="key-info">Share this code only with our official delivery agent.</div>
      </div>

      <div class="summary-box">
        <div class="row">
          <span style="color:#6b7280;">Order ID</span>
          <span style="font-weight:500;">#{{orderId}}</span>
        </div>
        <div class="row">
          <span style="color:#6b7280;">Status</span>
          <span style="color:#10b981; font-weight:600;">{{status}}</span>
        </div>
        <div class="row">
          <span style="color:#6b7280;">Total Amount</span>
          <span style="color:#4f46e5; font-weight:bold;">{{totalPrice}} BDT</span>
        </div>
      </div>

      <a href="https://astharhat.com/user/orders" class="btn">Track Order Status</a>
    </div>
  </div>

  <div class="footer">
    &copy; 2026 Asthar Hat Inc.<br>
    Your security is our priority.
  </div>
</div>

</body>
</html>
`;

async function run() {
    try {
        await client.connect();
        const db = client.db('astharhat_analytics');
        const collection = db.collection('email_templates');

        // Update the template
        await collection.updateOne(
            { name: 'order_update' },
            {
                $set: {
                    subject: "Secure Order: #{{orderId}} - Key: {{securityKey}}", // Subject e key add kora hoyeche
                    body: NEW_HTML_TEMPLATE,
                    active: true,
                    updatedAt: new Date().toISOString()
                }
            },
            { upsert: true }
        );

        console.log("✅ Security Key Email Template Deployed!");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
