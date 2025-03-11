// components/StreamContent.tsx
import StreamDetails from "@/app/component/livePage/StreamDetails";
import EditStreamForm from "@/app/component/editStreamForm";

interface StreamContentProps {
  stream: any;
  isSeller: boolean;
  onUpdate: (updatedStream: any) => void;
}

export default function StreamContent({
  stream,
  isSeller,
  onUpdate,
}: StreamContentProps) {
  return (
    <div className="md:col-span-2 space-y-6">
      <StreamDetails
        title={stream.title}
        description={stream.description}
        category={stream.category}
        createdAt={stream.createdAt}
        products={stream.products}
        isSeller={isSeller}
        onRemoveProduct={function (productId: string): void {
          throw new Error("Function not implemented.");
        }}
      />

      {/* Edit Stream Form (only for seller) */}
      {isSeller && (
        <div className="pt-4">
          <EditStreamForm stream={stream} onUpdate={onUpdate} />
        </div>
      )}
    </div>
  );
}
