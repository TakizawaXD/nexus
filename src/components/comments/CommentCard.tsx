import type { CommentWithAuthor } from "@/lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";

export default function CommentCard({ comment }: { comment: CommentWithAuthor }) {
    const commentDate = new Date(comment.created_at);
    return (
        <div className="flex gap-4 border-b p-4">
            <Link href={`/u/${comment.author.username}`}>
                <Avatar>
                <AvatarImage src={comment.author.avatar_url ?? undefined} alt={comment.author.username} />
                <AvatarFallback>{comment.author.username.charAt(0).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <div className="flex w-full flex-col">
                <div className="flex flex-wrap items-center gap-x-2">
                    <Link href={`/u/${comment.author.username}`} className="font-bold hover:underline">
                        {comment.author.full_name ?? comment.author.username}
                    </Link>
                    <span className="text-sm text-muted-foreground">@{comment.author.username}</span>
                    <span className="text-sm text-muted-foreground hidden sm:inline">·</span>
                    <time dateTime={commentDate.toISOString()} className="text-sm text-muted-foreground" title={commentDate.toLocaleString()}>
                        {formatDistanceToNowStrict(commentDate, {
                            addSuffix: true,
                        })}
                    </time>
                </div>
                <p className="mt-1 whitespace-pre-wrap text-base">{comment.content}</p>
            </div>
        </div>
    )
}
