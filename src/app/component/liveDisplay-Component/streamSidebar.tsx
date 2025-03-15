// components/StreamSidebar.tsx
import { Button } from "@/components/ui/button";
import SellerInfo from "@/app/component/livePage/SellerInfo";
import FeaturedProducts from "@/app/component/livePage/FeaturedProducts";

interface StreamSidebarProps {
  seller: any;
  stream: any;
  isBuyer: boolean;

  onFollow: () => void;
}

export default function StreamSidebar({
  seller,
  stream,
  isBuyer,

  onFollow,
}: StreamSidebarProps) {
  return (
    <div className="space-y-6">
      <SellerInfo
        name={seller?.name}
        email={seller?.email}
        imageUrl={seller?.imageUrl}
        isBuyer={isBuyer}
        followers={0}
      />

      {stream.products.length > 0 && (
        <FeaturedProducts products={stream.products} />
      )}
    </div>
  );
}
