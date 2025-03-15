import React from "react";

interface SellerInfoProps {
  name: string;
  email: string;
  imageUrl: string;
  followers: any[];
  isBuyer: boolean;
  onFollow: () => Promise<void>; // This is the function you'll pass to handle follow/unfollow
  isFollowing: boolean; // This is used to control the follow/unfollow button state
}

const SellerInfo: React.FC<SellerInfoProps> = ({
  name,
  email,
  imageUrl,
  followers,
  isBuyer,
  onFollow,
  isFollowing,
}) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <img
          src={imageUrl || "/default-avatar.jpg"} // default avatar if no image
          alt={name}
          className="w-16 h-16 rounded-full object-cover"
        />
        <div className="flex flex-col">
          <span className="text-lg font-semibold">{name}</span>
          <span className="text-sm text-muted-foreground">{email}</span>
        </div>
      </div>

      {/* Follow/Unfollow button */}
      {isBuyer && (
        <button
          onClick={onFollow} // Trigger the follow/unfollow action
          className="btn-primary"
        >
          {isFollowing ? "Unfollow" : "Follow"}{" "}
          {/* Button text based on follow state */}
        </button>
      )}

      {/* Followers count */}
      <div>
        <span>{followers.length} Followers</span>
      </div>
    </div>
  );
};

export default SellerInfo;
