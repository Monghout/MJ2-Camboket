import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import LiveStream from "@/app/models/LiveStream";

interface ContextParams {
  id: string; // LiveStream ID
  productId: string; // Product ID within LiveStream to delete
}

export async function DELETE(
  req: Request,
  context: { params: Promise<ContextParams> }
) {
  try {
    await connectDB();

    // Unwrap the Promise to get the parameters
    const { id, productId } = await context.params;

    // Find the LiveStream by ID
    const liveStream = await LiveStream.findById(id);
    if (!liveStream) {
      return NextResponse.json(
        { error: "LiveStream not found" },
        { status: 404 }
      );
    }

    // Find the product by its ID and remove it from the products array
    liveStream.products = liveStream.products.filter(
      (product: { _id: { toString: () => string } }) =>
        product._id.toString() !== productId
    );

    // Save the updated LiveStream document
    await liveStream.save();

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
