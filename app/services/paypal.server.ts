import { paypalConfig } from "@/config/paypal";

export class PayPalService {
  private static async getAccessToken() {
    const auth = Buffer.from(
      `${paypalConfig.clientId}:${paypalConfig.clientSecret}`
    ).toString("base64");

    const response = await fetch(`${paypalConfig.apiUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const data = await response.json();
    return data.access_token;
  }

  static async createOrder(amount: number, currency = "GBP") {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${paypalConfig.apiUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              currency_code: currency,
              value: amount.toFixed(2),
            },
          },
        ],
      }),
    });

    return await response.json();
  }

  static async capturePayment(orderId: string) {
    const accessToken = await this.getAccessToken();

    const response = await fetch(
      `${paypalConfig.apiUrl}/v2/checkout/orders/${orderId}/capture`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return await response.json();
  }
} 