/**
 * Content Service - Business logic for posts and content management
 */

import { storage } from "../storage";
import { CONTENT } from "../constants";
import type { Post, Tip } from "@shared/schema";

export class ContentService {
  /**
   * Get featured posts
   */
  async getFeaturedPosts(): Promise<Post[]> {
    const posts = await storage.getPosts();
    return posts.slice(0, CONTENT.FEATURED_POSTS_COUNT);
  }

  /**
   * Get daily featured content with tip and post
   */
  async getDailyFeatured(date: string): Promise<{
    id: string;
    date: string;
    tipId: string | null;
    postId: string | null;
    quote: string | null;
    tip?: Tip;
    post?: Post;
  } | null> {
    const featured = await storage.getDailyFeatured(date);
    if (!featured) return null;

    let tip: Tip | undefined;
    let post: Post | undefined;

    if (featured.tipId) {
      tip = await storage.getTip(featured.tipId);
    }

    if (featured.postId) {
      post = await storage.getPost(featured.postId);
    }

    return {
      ...featured,
      tip,
      post,
    };
  }
}

export const contentService = new ContentService();
