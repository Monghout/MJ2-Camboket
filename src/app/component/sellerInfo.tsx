import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCircle, Mail, Users } from "lucide-react";

interface SellerInfoProps {
  name: string;
  email: string;
  photo: string;
  followers: any[];
  followerCount?: number;
  isBuyer: boolean;
  isFollowing?: boolean;
  followLoading?: boolean;
  onFollowToggle?: () => void;
}

export default function SellerInfo({
  name,
  email,
  photo,
  followers,
  followerCount = 0,
  isBuyer,
  isFollowing = false,
  followLoading = false,
  onFollowToggle,
}: SellerInfoProps) {
  return (
    <Card className="border border-border/40 bg-card/60">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Seller Information</span>
          {followers.length > 0 && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              <span>{followerCount || followers.length}</span>
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12 border border-border/40">
            <AvatarImage src={photo} alt={name} />
            <AvatarFallback>
              <UserCircle className="h-8 w-8" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium leading-none">{name}</h3>
            <p className="text-sm text-muted-foreground flex items-center mt-1 gap-1">
              <Mail className="h-3 w-3" />
              {email}
            </p>
          </div>
        </div>

        {isBuyer && onFollowToggle && (
          <Button
            className="w-full"
            variant={isFollowing ? "outline" : "default"}
            onClick={onFollowToggle}
            disabled={followLoading}
          >
            {followLoading
              ? "Processing..."
              : isFollowing
              ? "Unfollow"
              : "Follow"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
