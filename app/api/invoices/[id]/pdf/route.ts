import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { invoices, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateInvoicePDF, generateInvoiceFilename } from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId: clerkId } = await auth();
    const { id } = await params;

    // Check if it's an authenticated request or a public token request
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    let invoice;
    let user;

    if (token) {
      // Public access via pay token
      invoice = await db.query.invoices.findFirst({
        where: eq(invoices.payToken, token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      user = await db.query.users.findFirst({
        where: eq(users.id, invoice.userId),
      });
    } else if (clerkId) {
      // Authenticated request
      user = await db.query.users.findFirst({
        where: eq(users.clerkId, clerkId),
      });

      if (!user) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      invoice = await db.query.invoices.findFirst({
        where: eq(invoices.id, id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!invoice) {
        return NextResponse.json(
          { error: "Invoice not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (invoice.userId !== user.id) {
        return NextResponse.json(
          { error: "Access denied" },
          { status: 403 }
        );
      }
    } else {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Cast lineItems to correct type
    const lineItems = invoice.lineItems as Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      amount: number;
    }>;

    // Generate PDF
    const pdfBuffer = await generateInvoicePDF({
      invoice: {
        id: invoice.id,
        invoiceNumber: invoice.invoiceNumber,
        status: invoice.status,
        lineItems,
        subtotal: invoice.subtotal,
        tax: invoice.tax ?? 0,
        taxRate: invoice.taxRate,
        total: invoice.total,
        currency: invoice.currency ?? "USD",
        dueDate: invoice.dueDate,
        paidAt: invoice.paidAt,
        notes: invoice.notes,
        createdAt: invoice.createdAt,
      },
      client: {
        name: invoice.client.name,
        email: invoice.client.email,
        company: invoice.client.company,
        address: invoice.client.address,
      },
      developer: {
        name: user?.name || "Developer",
        email: user?.email || "",
        businessName: user?.businessName,
        businessAddress: user?.businessAddress,
        logoUrl: user?.logoUrl,
        taxId: user?.taxId,
      },
      project: invoice.project
        ? { name: invoice.project.name }
        : null,
    });

    // Generate filename
    const filename = generateInvoiceFilename(
      invoice.invoiceNumber,
      invoice.client.name
    );

    // Convert Buffer to Uint8Array for NextResponse
    const uint8Array = new Uint8Array(pdfBuffer);

    // Return PDF
    return new NextResponse(uint8Array, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("[PDF] Error generating invoice PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}