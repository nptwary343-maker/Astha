const { MongoClient } = require('mongodb');

// Connection URL
const uri = "mongodb+srv://aidadmin:Bangladesh247152%40@cluster0.yzro6ml.mongodb.net/?appName=Cluster0";
const client = new MongoClient(uri);

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
    background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
    padding: 40px 20px; 
    text-align: center; 
    color: #ffffff; 
  }
  .header h1 { margin: 10px 0 5px; font-size: 24px; font-weight: 700; }
  .header p { margin: 0; opacity: 0.9; font-size: 16px; }
  .checkmark { font-size: 48px; display: block; margin-bottom: 10px; }

  /* Content Body */
  .content { padding: 30px; color: #374151; }
  .greeting { font-size: 18px; font-weight: 600; margin-bottom: 20px; color: #111827; }
  .message { line-height: 1.6; margin-bottom: 30px; font-size: 15px; color: #4b5563; }

  /* Order Summary Box */
  .summary-box { background: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; }
  .row { display: flex; justify-content: space-between; border-bottom: 1px dashed #d1d5db; padding: 12px 0; font-size: 14px; }
  .row:last-child { border-bottom: none; font-weight: 700; color: #111827; font-size: 16px; padding-top: 15px; }
  .label { color: #6b7280; }
  .value { color: #111827; font-weight: 500; text-align: right; }
  .status-pill { background: #d1fae5; color: #065f46; padding: 4px 10px; border-radius: 99px; font-size: 12px; font-weight: 600; text-transform: uppercase; }

  /* Action Button */
  .btn-container { text-align: center; margin-top: 30px; }
  .btn { 
    display: inline-block; 
    background-color: #4f46e5; 
    color: #ffffff; 
    padding: 14px 32px; 
    border-radius: 6px; 
    text-decoration: none; 
    font-weight: 600; 
    font-size: 16px; 
    transition: background-color 0.2s; 
  }
  
  /* Footer */
  .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; line-height: 1.5; }
  .footer a { color: #6b7280; text-decoration: underline; }
</style>
</head>
<body>

<div class="wrapper">
  <div style="height: 40px;"></div>
  
  <div class="card">
    <div class="header">
      <span class="checkmark">🎉</span>
      <h1>Order Confirmed!</h1>
      <p>Thanks for shopping with Asthar Hat</p>
    </div>

    <div class="content">
      <div class="greeting">Hi {{customerName}},</div>
      <div class="message">
        We are excited to let you know that your order <strong>#{{orderId}}</strong> has been received and is being processed. 
        You will receive another update once it ships.
      </div>

      <div class="summary-box">
        <div class="row">
          <span class="label">Order ID</span>
          <span class="value">#{{orderId}}</span>
        </div>
        <div class="row">
          <span class="label">Status</span>
          <span class="value"><span class="status-pill">{{status}}</span></span>
        </div>
        <div class="row">
          <span class="label">Delivery To</span>
          <span class="value" style="max-width: 180px;">{{address}}</span>
        </div>
        <div class="row" style="margin-top: 10px;">
          <span class="label" style="color: #111827; font-weight: 700;">Total Amount</span>
          <span class="value" style="color: #4f46e5; font-size: 18px;">{{totalPrice}} BDT</span>
        </div>
      </div>

      <div class="btn-container">
        <a href="https://astharhat.com/user/orders" class="btn">Track Order Status</a>
      </div>
    </div>
  </div>

  <div class="footer">
    &copy; 2026 Asthar Hat Inc. All rights reserved.<br>
    Questions? Contact <a href="mailto:support@astharhat.com">Support</a>
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

        // Update or Insert the new template
        await collection.updateOne(
            { name: 'order_update' },
            {
                $set: {
                    subject: "Order Update: {{orderId}} - Asthar Hat",
                    body: NEW_HTML_TEMPLATE,
                    active: true,
                    updatedAt: new Date().toISOString()
                }
            },
            { upsert: true }
        );

        console.log("✅ New Modern Email Template Successfully Deployed!");
    } finally {
        await client.close();
    }
}
run().catch(console.dir);
