import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/server/db";
import { contracts, users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { generateContractPDF, generateContractFilename } from "@/lib/pdf";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { userId: clerkId } = await auth();

    // Check if it's an authenticated request or a public token request
    const searchParams = request.nextUrl.searchParams;
    const token = searchParams.get("token");

    let contract;
    let user;

    if (token) {
      // Public access via sign token
      contract = await db.query.contracts.findFirst({
        where: eq(contracts.signToken, token),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }

      // Only allow PDF download for signed contracts via token
      if (contract.status !== "signed") {
        return NextResponse.json(
          { error: "Contract must be signed to download PDF" },
          { status: 400 }
        );
      }

      user = await db.query.users.findFirst({
        where: eq(users.id, contract.userId),
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

      contract = await db.query.contracts.findFirst({
        where: eq(contracts.id, id),
        with: {
          client: true,
          project: true,
        },
      });

      if (!contract) {
        return NextResponse.json(
          { error: "Contract not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (contract.userId !== user.id) {
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

    // Generate PDF
    const pdfBuffer = await generateContractPDF({
      contract: {
        id: contract.id,
        name: contract.name,
        content: contract.content,
        status: contract.status,
        signedAt: contract.signedAt,
        clientSignature: contract.clientSignature,
        clientIp: contract.clientIp,
        createdAt: contract.createdAt,
      },
      client: {
        name: contract.client.name,
        email: contract.client.email,
        company: contract.client.company,
      },
      developer: {
        name: user?.name || "Developer",
        email: user?.email || "",
        businessName: user?.businessName,
        businessAddress: user?.businessAddress,
        logoUrl: user?.logoUrl,
      },
      project: contract.project
        ? { name: contract.project.name }
        : null,
    });

    // Generate filename
    const filename = generateContractFilename(
      contract.name,
      contract.client.name
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
    console.error("[PDF] Error generating contract PDF:", error);
    return NextResponse.json(
      { error: "Failed to generate PDF" },
      { status: 500 }
    );
  }
}