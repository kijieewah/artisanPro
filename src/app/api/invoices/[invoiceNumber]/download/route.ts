// app/api/invoices/[invoiceNumber]/download/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "~/lib/auth1";
import { prisma } from "~/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ invoiceNumber: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { invoiceNumber } = await params;

    const invoice = await prisma.invoice.findUnique({
      where: { invoiceNumber },
      include: {
        order: {
          include: {
            orderItems: true,
          },
        },
        artisan: true,
      },
    });

    if (!invoice) {
      return NextResponse.json({ error: "Invoice not found" }, { status: 404 });
    }

    // Verify ownership
    if (invoice.artisanId !== user.id && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Generate HTML invoice
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            color: #333;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 30px;
            border: 1px solid #eee;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.15);
            font-size: 16px;
            line-height: 24px;
          }
          .invoice-box table {
            width: 100%;
            line-height: inherit;
            text-align: left;
            border-collapse: collapse;
          }
          .invoice-box table td {
            padding: 5px;
            vertical-align: top;
          }
          .invoice-box table tr td:nth-child(2) {
            text-align: right;
          }
          .invoice-box table tr.top table td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.top table td.title {
            font-size: 45px;
            line-height: 45px;
            color: #16507b;
          }
          .invoice-box table tr.information table td {
            padding-bottom: 40px;
          }
          .invoice-box table tr.heading td {
            background: #16507b;
            color: white;
            border-bottom: 1px solid #ddd;
            font-weight: bold;
            padding: 10px;
          }
          .invoice-box table tr.details td {
            padding-bottom: 20px;
          }
          .invoice-box table tr.item td {
            border-bottom: 1px solid #eee;
            padding: 10px;
          }
          .invoice-box table tr.item.last td {
            border-bottom: none;
          }
          .invoice-box table tr.total td:nth-child(2) {
            border-top: 2px solid #16507b;
            font-weight: bold;
            font-size: 18px;
          }
          .footer {
            margin-top: 30px;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <table cellpadding="0" cellspacing="0">
            <tr class="top">
              <td colspan="2">
                <table>
                  <tr>
                    <td class="title">
                      <h2 style="color: #16507b;">ArtisanPro</h2>
                    </td>
                    <td>
                      Invoice #: ${invoice.invoiceNumber}<br>
                      Created: ${new Date(invoice.invoiceDate).toLocaleDateString()}<br>
                      Due: ${new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="information">
              <td colspan="2">
                <table>
                  <tr>
                    <td>
                      <strong>Bill To:</strong><br>
                      ${invoice.artisanName}<br>
                      ${invoice.artisanEmail}<br>
                      ${invoice.artisanPhone || ""}
                    </td>
                    <td>
                      <strong>Order #:</strong><br>
                      ${invoice.order.orderNumber}<br>
                      <strong>Payment Status:</strong><br>
                      ${invoice.paymentStatus}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr class="heading">
              <td>Item</td>
              <td>Price</td>
            </tr>
            ${invoice.order.orderItems.map(item => `
              <tr class="item">
                <td>
                  ${item.metadata?.serviceName || item.metadata?.courseName || "Item"}<br>
                  <small>Quantity: ${item.quantity}</small>
                </td>
                <td>₦${Number(item.totalPrice).toLocaleString()}</td>
              </tr>
            `).join('')}
            <tr class="total">
              <td></td>
              <td>
                Subtotal: ₦${Number(invoice.subtotal).toLocaleString()}<br>
                Tax: ₦${Number(invoice.tax).toLocaleString()}<br>
                <strong>Total: ₦${Number(invoice.total).toLocaleString()}</strong>
              </td>
            </tr>
          </table>
          <div class="footer">
            Thank you for choosing ArtisanPro!
          </div>
        </div>
      </body>
      </html>
    `;

    // Return HTML response (in production, use a PDF generation library)
    return new NextResponse(html, {
      headers: {
        "Content-Type": "text/html",
        "Content-Disposition": `inline; filename="invoice-${invoice.invoiceNumber}.html"`,
      },
    });
  } catch (error) {
    console.error("Invoice download error:", error);
    return NextResponse.json(
      { error: "Failed to generate invoice" },
      { status: 500 }
    );
  }
}