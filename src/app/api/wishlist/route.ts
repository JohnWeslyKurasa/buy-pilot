import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { savedProducts: true }
    });

    return NextResponse.json(user?.savedProducts || []);
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    const { title, brand, image, price, originalUrl, marketplace } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Check if already in wishlist
    const existing = await prisma.savedProduct.findFirst({
      where: {
        userId: user.id,
        title: title,
        marketplace: marketplace
      }
    });

    if (existing) {
      return NextResponse.json(existing); // already saved
    }

    const product = await prisma.savedProduct.create({
      data: {
        userId: user.id,
        title,
        brand,
        image,
        price,
        originalUrl,
        marketplace
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.error(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return new NextResponse("Missing ID", { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    });

    if (!user) return new NextResponse("User not found", { status: 404 });

    await prisma.savedProduct.deleteMany({
      where: {
        id: id,
        userId: user.id // Ensure they can only delete their own
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
