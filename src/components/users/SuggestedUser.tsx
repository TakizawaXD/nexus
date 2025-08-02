'use client';

import type { Profile } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import FollowButton from "./FollowButton";
import { useState } from "react";


export default function SuggestedUser({ profile }: { profile: Profile }) {
    const [isFollowed, setIsFollowed] = useState(false);

    // This is an optimistic update. When follow button is clicked, we hide the user
    // from the suggestion list without waiting for server revalidation.
    if(isFollowed) return null;

    return (
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={profile.avatar_url ?? undefined} />
                    <AvatarFallback>{profile.username.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                    <Link href={`/u/${profile.username}`} className="font-bold hover:underline text-sm">
                        {profile.full_name ?? profile.username}
                    </Link>
                    <p className="text-sm text-muted-foreground">@{profile.username}</p>
                </div>
            </div>
            <div onClick={() => setIsFollowed(true)}>
                <FollowButton profileId={profile.id} isFollowing={false} />
            </div>
        </div>
    )
}
