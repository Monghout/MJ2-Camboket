// components/StreamSidebar.tsx
import { Button } from "@/components/ui/button";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";

interface StreamSidebarProps {
  seller: any;
  stream: any;
  isBuyer: boolean;
  isFollowing: boolean;
  onFollow: () => void;
}

export default function StreamSidebar({
  seller,
  stream,
  isBuyer,
  isFollowing,
  onFollow,
}: StreamSidebarProps) {
  return (
    <div className="space-y-6">
      <SellerInfo
        name={seller?.name}
        email={seller?.email}
        imageUrl={seller?.imageUrl}
        followers={stream.followers}
        isBuyer={isBuyer}
      />

      {/* Follow Button */}
      {isBuyer && (
        <Button onClick={onFollow} className="w-full">
          {isFollowing ? "Unfollow" : "Follow"}
        </Button>
      )}

      {stream.products.length > 0 && (
        <FeaturedProducts products={stream.products} />
      )}
    </div>
  );
}
