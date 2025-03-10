import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream"; // Ensure correct import path

// DELETE method to remove a product from the stream
export async function DELETE(
  req: Request,
  context: { params: { id: string } }
) {
  try {
    await connectDB();
    const body = await req.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    const stream = await LiveStream.findById(context.params.id);
    if (!stream) {
      return NextResponse.json({ error: "Stream not found" }, { status: 404 });
    }

    // Filter out the product to remove it
    stream.products = stream.products.filter(
      (product: any) => product._id.toString() !== productId
    );

    await stream.save();

    return NextResponse.json({ message: "Product removed successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to remove product" },
      { status: 500 }
    );
  }
}
