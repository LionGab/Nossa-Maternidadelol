import { supabase } from "./supabase";
import type { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Subscribe to community posts updates
 */
export function subscribeToCommunityPosts(
  callback: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel("community-posts")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "community_posts",
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "community_posts",
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to comments updates
 */
export function subscribeToComments(
  postId: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`comments:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "comments",
        filter: `post_id=eq.${postId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Subscribe to reactions updates
 */
export function subscribeToReactions(
  postId: string,
  callback: (payload: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`reactions:${postId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "reactions",
        filter: `post_id=eq.${postId}`,
      },
      callback
    )
    .on(
      "postgres_changes",
      {
        event: "DELETE",
        schema: "public",
        table: "reactions",
        filter: `post_id=eq.${postId}`,
      },
      callback
    )
    .subscribe();

  return channel;
}

/**
 * Unsubscribe from a channel
 */
export function unsubscribe(channel: RealtimeChannel) {
  supabase.removeChannel(channel);
}

