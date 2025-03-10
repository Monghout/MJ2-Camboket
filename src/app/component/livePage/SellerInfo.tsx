import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { User } from "lucide-react";

interface SellerInfoProps {
  name: string;
  email: string;
  imageUrl: string;
  followers: number;
  isBuyer: boolean;
}

export default function SellerInfo({
  name,
  email,
  imageUrl,
  followers,
  isBuyer,
}: SellerInfoProps) {
  const getInitials = (name: string) => {
    return (
      name
        ?.split(" ")
        .map((part) => part[0])
        .join("")
        .toUpperCase() || "?"
    );
  };

  return (
    <Card className="border-none shadow-xl bg-background">
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <User className="h-4 w-4" />
          Seller Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={imageUrl} alt={name} />
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{name || "Unknown"}</p>
            <p className="text-sm text-muted-foreground">
              {email || "Unknown"}
            </p>
            {isBuyer && (
              <div>
                <p className="text-sm text-muted-foreground">
                  Followers: {followers || "0"}
                </p>
                <Button variant="outline" className="mt-2">
                  Follow
                </Button>
              </div>
            )}
          </div>
        </div>
        <Separator />
      </CardContent>
    </Card>
  );
}
