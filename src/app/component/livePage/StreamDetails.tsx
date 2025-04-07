import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, Star, MessageSquare, Trash2, RefreshCw } from "lucide-react";
import ProductList from "@/app/component/livePage/ProductList";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Toast } from "@/components/ui/toast";
import { toast } from "@/hooks/use-toast";

interface Rating {
  _id: string;
  userId: string;
  userClerkId: string;
  userName: string;
  userImage?: string;
  rating: number;
  comment?: string;
  createdAt: string;
}

interface ProductWithRatings {
  _id?: string;
  name: string;
  price: number;
  image: string;
  description: string;
  feature: boolean;
  ratings: Rating[];
  averageRating: number;
}

interface StreamDetailsProps {
  title: string;
  description: string;
  category: string;
  createdAt: string;
  products: ProductWithRatings[];
  isSeller: boolean;
  onRemoveProduct: (productId: string) => void;
  livestreamId: string;
}

export default function StreamDetails({
  title,
  description,
  category,
  createdAt,
  products,
  isSeller,
  onRemoveProduct,
  livestreamId,
}: StreamDetailsProps) {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState("products");
  const [selectedProduct, setSelectedProduct] =
    useState<ProductWithRatings | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");
  const [productsWithRatings, setProductsWithRatings] = useState<
    ProductWithRatings[]
  >(
    products.map((p) => ({
      ...p,
      ratings: p.ratings || [],
      averageRating: p.averageRating || 0,
    }))
  );
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchRatings = async () => {
    setIsRefreshing(true);
    try {
      const updatedProducts = await Promise.all(
        productsWithRatings.map(async (product) => {
          const productId =
            product._id || productsWithRatings.indexOf(product).toString();
          const response = await fetch(
            `/api/ratings?livestreamId=${livestreamId}&productId=${productId}`
          );

          if (!response.ok) throw new Error("Failed to fetch ratings");

          const data = await response.json();
          return {
            ...product,
            ratings: data.ratings || [],
            averageRating: data.averageRating || 0,
          };
        })
      );
      setProductsWithRatings(updatedProducts);

      if (selectedProduct) {
        const updatedSelected = updatedProducts.find(
          (p) => p._id === selectedProduct._id || p === selectedProduct
        );
        setSelectedProduct(updatedSelected || null);
      }

      toast({
        title: "Data refreshed successfully",
        variant: "default",
      });
    } catch (error) {
      console.error("Error fetching ratings:", error);
      toast({
        title: "Failed to refresh data",
        variant: "destructive",
      });
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, [livestreamId]);

  const handleProductSelect = (product: ProductWithRatings) => {
    setSelectedProduct(product);
    const userRating = user
      ? product.ratings.find((r) => r.userClerkId === user.id)
      : undefined;
    setRating(userRating?.rating || 0);
    setComment(userRating?.comment || "");
  };

  const handleRatingSubmit = async () => {
    if (!selectedProduct || !user || rating === 0) return;

    const productId =
      selectedProduct._id ||
      productsWithRatings.indexOf(selectedProduct).toString();

    try {
      const response = await fetch("/api/ratings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          userClerkId: user.id,
          userName: user.fullName || "Anonymous",
          userImage: user.imageUrl,
          livestreamId,
          productId,
          rating,
          comment,
        }),
      });

      const result = await response.json();
      if (result.success) {
        const updatedProducts = productsWithRatings.map((p) => {
          if (p._id === selectedProduct._id || p === selectedProduct) {
            const newRating = {
              _id: result.ratingId,
              userId: user.id,
              userClerkId: user.id,
              userName: user.fullName || "Anonymous",
              userImage: user.imageUrl,
              rating,
              comment,
              createdAt: new Date().toISOString(),
            };

            const existingIndex = p.ratings.findIndex(
              (r) => r.userClerkId === user.id
            );
            const updatedRatings = [...p.ratings];

            if (existingIndex >= 0) {
              updatedRatings[existingIndex] = newRating;
            } else {
              updatedRatings.push(newRating);
            }

            return {
              ...p,
              ratings: updatedRatings,
              averageRating: result.averageRating || 0,
            };
          }
          return p;
        });

        setProductsWithRatings(updatedProducts);
        setSelectedProduct(
          updatedProducts.find(
            (p) => p._id === selectedProduct._id || p === selectedProduct
          ) || null
        );
        setComment("");

        toast({
          title: "Rating submitted successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Failed to submit rating",
        variant: "destructive",
      });
    }
  };

  const handleDeleteComment = async (ratingId: string) => {
    if (!selectedProduct || !isSeller) return;

    try {
      const response = await fetch("/api/ratings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ratingId,
          livestreamId,
          productId:
            selectedProduct._id ||
            productsWithRatings.indexOf(selectedProduct).toString(),
        }),
      });

      const result = await response.json();
      if (result.success) {
        const updatedProducts = productsWithRatings.map((p) => {
          if (p._id === selectedProduct._id || p === selectedProduct) {
            const updatedRatings = p.ratings.filter((r) => r._id !== ratingId);
            return {
              ...p,
              ratings: updatedRatings,
              averageRating: result.averageRating || 0,
            };
          }
          return p;
        });

        setProductsWithRatings(updatedProducts);
        setSelectedProduct(
          updatedProducts.find(
            (p) => p._id === selectedProduct._id || p === selectedProduct
          ) || null
        );

        toast({
          title: "Review deleted successfully",
          variant: "default",
        });
      }
    } catch (error) {
      console.error("Error deleting rating:", error);
      toast({
        title: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  const handleRefresh = async () => {
    await fetchRatings();
  };

  const formatRating = (value?: number | null | undefined) => {
    const numericValue = Number(value);
    return isNaN(numericValue) ? "0.0" : numericValue.toFixed(1);
  };

  return (
    <Card className="border-none shadow-xl bg-background">
      <CardHeader className="flex flex-row justify-between items-start space-y-0">
        <div>
          <CardTitle className="text-2xl font-bold">{title}</CardTitle>
          <div className="flex items-center gap-2 text-muted-foreground mt-2">
            <Eye className="h-4 w-4" />
            <span>Live Stream</span>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="shrink-0"
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>

        <Tabs
          defaultValue="products"
          className="mt-6"
          onValueChange={setActiveTab}
        >
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
          </TabsList>

          <TabsContent value="products" className="mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ProductList
                  products={productsWithRatings}
                  isSeller={isSeller}
                  onRemoveProduct={onRemoveProduct}
                  onSelectProduct={handleProductSelect}
                  selectedProduct={selectedProduct}
                />
              </div>

              {selectedProduct && (
                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-2">
                      {selectedProduct.name}
                    </h3>
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-5 w-5 cursor-pointer ${
                            (hoverRating || rating) >= star
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-300"
                          }`}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        />
                      ))}
                      <span className="ml-2 text-sm text-muted-foreground">
                        {formatRating(selectedProduct.averageRating)} (
                        {selectedProduct.ratings.length})
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">
                      {selectedProduct.description}
                    </p>
                    <p className="font-bold text-lg">
                      ${selectedProduct.price.toFixed(2)}
                    </p>
                  </div>

                  {user && !isSeller && (
                    <div className="space-y-4">
                      <Textarea
                        placeholder="Write your review..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                      />
                      <Button
                        onClick={handleRatingSubmit}
                        disabled={rating === 0}
                      >
                        {rating === 0 ? "Select a rating" : "Submit Review"}
                      </Button>
                    </div>
                  )}

                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <MessageSquare className="h-4 w-4" />
                      Reviews ({selectedProduct.ratings.length})
                    </h4>

                    {selectedProduct.ratings.length > 0 ? (
                      <div className="space-y-4">
                        {selectedProduct.ratings.map((rating) => (
                          <div
                            key={rating._id}
                            className="border rounded-lg p-4 relative"
                          >
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarImage src={rating.userImage} />
                                <AvatarFallback>
                                  {rating.userName?.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="flex items-center gap-1">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <Star
                                      key={star}
                                      className={`h-4 w-4 ${
                                        rating.rating >= star
                                          ? "fill-yellow-400 text-yellow-400"
                                          : "text-gray-300"
                                      }`}
                                    />
                                  ))}
                                </div>
                                <p className="font-medium">{rating.userName}</p>
                                <p className="text-sm text-muted-foreground">
                                  {new Date(
                                    rating.createdAt
                                  ).toLocaleDateString()}
                                </p>
                                {rating.comment && (
                                  <p className="mt-2">{rating.comment}</p>
                                )}
                              </div>
                            </div>
                            {isSeller && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8"
                                onClick={() => handleDeleteComment(rating._id)}
                              >
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-sm">
                        No reviews yet
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="details" className="mt-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Category
              </h3>
              <p>{category}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-muted-foreground mb-1">
                Created
              </h3>
              <p>{new Date(createdAt).toLocaleDateString()}</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
