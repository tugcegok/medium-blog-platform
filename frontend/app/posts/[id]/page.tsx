"use client";

import {
  useEffect,
  useState,
} from "react";

import type {
  FormEvent,
} from "react";

import {
  useParams,
  useRouter,
} from "next/navigation";

import {
  apiFetch,
} from "../../../lib/api";


// ============================================================
// TYPES
// ============================================================

type Post = {
  id: number;
  title: string;
  content: string;
  owner_id: number;
  reading_time: number;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
  category_id: number | null;

  tags: {
    id: number;
    name: string;
    slug: string;
  }[];
};


type Comment = {
  id: number;
  content: string;
  owner_id: number;
  post_id: number;
  parent_id: number | null;
};


type LikeCountResponse = {
  post_id: number;
  like_count: number;
};


type RepostCountResponse = {
  post_id: number;
  repost_count: number;
};


type Favorite = {
  id: number;
  user_id: number;
  post_id: number;
  created_at: string;
};


type CurrentUser = {
  id: number;
  username?: string;
  email?: string;
};


type FollowersResponse = {
  user_id: number;
  follower_count: number;
};


type FollowingResponse = {
  user_id: number;
  following_count: number;
};


type Collection = {
  id: number;
  user_id: number;
  name: string;
  description: string;
  created_at: string;
};


// ============================================================
// REACTION TYPES
// ============================================================

type ReactionType =
  | "love"
  | "fire"
  | "laugh"
  | "clap";


type ReactionCounts = {
  love: number;
  fire: number;
  laugh: number;
  clap: number;
};


type ReactionResponse = {
  post_id: number;
  reactions: ReactionCounts;
};


type ReactionItem = {
  type: ReactionType;
  emoji: string;
  label: string;
};


// ============================================================
// REACTION OPTIONS
// ============================================================

const reactionOptions: ReactionItem[] = [
  {
    type: "love",
    emoji: "❤️",
    label: "Love",
  },
  {
    type: "fire",
    emoji: "🔥",
    label: "Fire",
  },
  {
    type: "laugh",
    emoji: "😂",
    label: "Laugh",
  },
  {
    type: "clap",
    emoji: "👏",
    label: "Clap",
  },
];


// ============================================================
// POST DETAIL PAGE
// ============================================================

export default function PostDetailPage() {

  const router =
    useRouter();

  const params =
    useParams();

  const postId =
    params.id as string;


  // ==========================================================
  // POST STATES
  // ==========================================================

  const [post, setPost] =
    useState<Post | null>(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [deleting, setDeleting] =
    useState(false);

  const [publishing, setPublishing] =
    useState(false);

  const [unpublishing, setUnpublishing] =
    useState(false);

  const [archiving, setArchiving] =
    useState(false);

  const [scheduling, setScheduling] =
    useState(false);

  const [scheduleDate, setScheduleDate] =
    useState("");


  // ==========================================================
  // CURRENT USER
  // ==========================================================

  const [currentUser, setCurrentUser] =
    useState<CurrentUser | null>(null);


  // ==========================================================
  // FOLLOW STATES
  // ==========================================================

  const [following, setFollowing] =
    useState(false);

  const [followLoading, setFollowLoading] =
    useState(false);

  const [followMessage, setFollowMessage] =
    useState("");

  const [followerCount, setFollowerCount] =
    useState(0);

  const [followingCount, setFollowingCount] =
    useState(0);


  // ==========================================================
  // CLAP STATES
  // ==========================================================

  const [clapped, setClapped] =
    useState(false);

  const [clapLoading, setClapLoading] =
    useState(false);

  const [clapMessage, setClapMessage] =
    useState("");


  // ==========================================================
  // LIKE STATES
  // ==========================================================

  const [liked, setLiked] =
    useState(false);

  const [likeCount, setLikeCount] =
    useState(0);

  const [likeLoading, setLikeLoading] =
    useState(false);

  const [likeMessage, setLikeMessage] =
    useState("");


  // ==========================================================
  // REPOST STATES
  // ==========================================================

  const [reposted, setReposted] =
    useState(false);

  const [repostCount, setRepostCount] =
    useState(0);

  const [repostLoading, setRepostLoading] =
    useState(false);

  const [repostMessage, setRepostMessage] =
    useState("");


  // ==========================================================
  // FAVORITE STATES
  // ==========================================================

  const [favorited, setFavorited] =
    useState(false);

  const [favoriteLoading, setFavoriteLoading] =
    useState(false);

  const [favoriteMessage, setFavoriteMessage] =
    useState("");


  // ==========================================================
  // COLLECTION STATES
  // ==========================================================

  const [collections, setCollections] =
    useState<Collection[]>([]);

  const [selectedCollectionId, setSelectedCollectionId] =
    useState("");

  const [collectionLoading, setCollectionLoading] =
    useState(false);

  const [collectionActionLoading, setCollectionActionLoading] =
    useState(false);

  const [collectionMessage, setCollectionMessage] =
    useState("");


  // ==========================================================
  // REACTION STATES
  // ==========================================================

  const [reactionCounts, setReactionCounts] =
    useState<ReactionCounts>({
      love: 0,
      fire: 0,
      laugh: 0,
      clap: 0,
    });

  const [selectedReaction, setSelectedReaction] =
    useState<ReactionType | null>(null);

  const [reactionLoading, setReactionLoading] =
    useState<ReactionType | null>(null);

  const [reactionMessage, setReactionMessage] =
    useState("");


  // ==========================================================
  // COMMENT STATES
  // ==========================================================

  const [comments, setComments] =
    useState<Comment[]>([]);

  const [commentContent, setCommentContent] =
    useState("");

  const [commentsLoading, setCommentsLoading] =
    useState(true);

  const [commentSubmitting, setCommentSubmitting] =
    useState(false);

  const [commentError, setCommentError] =
    useState("");

  const [commentSuccess, setCommentSuccess] =
    useState("");


  // ==========================================================
  // COMMENT EDIT
  // ==========================================================

  const [editingCommentId, setEditingCommentId] =
    useState<number | null>(null);

  const [editingCommentContent, setEditingCommentContent] =
    useState("");

  const [commentUpdating, setCommentUpdating] =
    useState(false);


  // ==========================================================
  // COMMENT DELETE
  // ==========================================================

  const [deletingCommentId, setDeletingCommentId] =
    useState<number | null>(null);


  // ==========================================================
  // COMMENT REPLY
  // ==========================================================

  const [replyingCommentId, setReplyingCommentId] =
    useState<number | null>(null);

  const [replyContent, setReplyContent] =
    useState("");

  const [replySubmitting, setReplySubmitting] =
    useState(false);


  // ==========================================================
  // GET CURRENT USER
  // ==========================================================

  const getCurrentUser = async () => {

    try {

      const response =
        await apiFetch(
          "/users/me",
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data: CurrentUser =
        await response.json();

      setCurrentUser(
        data
      );

    } catch (error) {

      console.error(
        "Current user error:",
        error
      );

    }

  };


  // ==========================================================
  // GET POST
  // ==========================================================

  const getPost = async () => {

    try {

      setLoading(
        true
      );

      setError(
        ""
      );

      const response =
        await apiFetch(
          `/posts/${postId}`,
          {
            method: "GET",
          }
        );

      if (!response.ok) {

        throw new Error(
          "Post not found."
        );

      }

      const data: Post =
        await response.json();

      setPost(
        data
      );

    } catch (error) {

      console.error(
        "Post error:",
        error
      );

      setError(
        "Could not load post."
      );

    } finally {

      setLoading(
        false
      );

    }

  };


  // ==========================================================
  // GET FOLLOW STATS
  // ==========================================================

  const getFollowStats = async (
    userId: number
  ) => {

    try {

      const followersResponse =
        await apiFetch(
          `/follows/${userId}/followers`,
          {
            method: "GET",
          }
        );

      if (
        followersResponse.ok
      ) {

        const followersData:
          FollowersResponse =
          await followersResponse.json();

        setFollowerCount(
          followersData.follower_count
        );

      }


      const followingResponse =
        await apiFetch(
          `/follows/${userId}/following`,
          {
            method: "GET",
          }
        );

      if (
        followingResponse.ok
      ) {

        const followingData:
          FollowingResponse =
          await followingResponse.json();

        setFollowingCount(
          followingData.following_count
        );

      }

    } catch (error) {

      console.error(
        "Follow stats error:",
        error
      );

    }

  };


  // ==========================================================
  // GET LIKE COUNT
  // ==========================================================

  const getLikeCount = async () => {

    try {

      const response =
        await apiFetch(
          `/likes/posts/${postId}`,
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data:
        LikeCountResponse =
        await response.json();

      setLikeCount(
        data.like_count
      );

    } catch (error) {

      console.error(
        "Like count error:",
        error
      );

    }

  };


  // ==========================================================
  // GET REPOST COUNT
  // ==========================================================

  const getRepostCount = async () => {

    try {

      const response =
        await apiFetch(
          `/reposts/${postId}/count`,
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data:
        RepostCountResponse =
        await response.json();

      setRepostCount(
        data.repost_count
      );

    } catch (error) {

      console.error(
        "Repost count error:",
        error
      );

    }

  };


  // ==========================================================
  // GET FAVORITES
  // ==========================================================

  const getFavorites = async () => {

    try {

      const response =
        await apiFetch(
          "/favorites",
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data:
        Favorite[] =
        await response.json();

      const exists =
        data.some(
          favorite =>
            favorite.post_id ===
            Number(postId)
        );

      setFavorited(
        exists
      );

    } catch (error) {

      console.error(
        "Favorites error:",
        error
      );

    }

  };


  // ==========================================================
  // GET COLLECTIONS
  // ==========================================================

  const getCollections = async () => {

    try {

      setCollectionLoading(
        true
      );

      const response =
        await apiFetch(
          "/collections",
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data =
        await response.json();

      setCollections(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Collections error:",
        error
      );

    } finally {

      setCollectionLoading(
        false
      );

    }

  };


  // ==========================================================
  // GET REACTIONS
  // ==========================================================

  const getReactions = async () => {

    try {

      const response =
        await apiFetch(
          `/reactions/posts/${postId}`,
          {
            method: "GET",
          }
        );

      if (!response.ok) {
        return;
      }

      const data:
        ReactionResponse =
        await response.json();

      setReactionCounts(
        data.reactions
      );

    } catch (error) {

      console.error(
        "Get reactions error:",
        error
      );

    }

  };


  // ==========================================================
  // GET COMMENTS
  // ==========================================================

  const getComments = async () => {

    try {

      setCommentsLoading(
        true
      );

      setCommentError(
        ""
      );

      const response =
        await apiFetch(
          `/comments/post/${postId}`,
          {
            method: "GET",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        const errorMessage =
          Array.isArray(
            data.detail
          )
            ? data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ||
                    "Validation error."
                )
                .join(", ")
            : data.detail ||
              "Comments could not be loaded.";

        setCommentError(
          errorMessage
        );

        return;

      }

      setComments(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (error) {

      console.error(
        "Comments error:",
        error
      );

      setCommentError(
        "Could not load comments."
      );

    } finally {

      setCommentsLoading(
        false
      );

    }

  };


  // ==========================================================
  // LOAD PAGE DATA
  // ==========================================================

  useEffect(() => {

    if (!postId) {
      return;
    }

    getCurrentUser();

    getPost();

    getComments();

    getLikeCount();

    getRepostCount();

    getFavorites();

    getCollections();

    getReactions();

  }, [postId]);


  // ==========================================================
  // LOAD FOLLOW STATS
  // ==========================================================

  useEffect(() => {

    if (!post) {
      return;
    }

    getFollowStats(
      post.owner_id
    );

  }, [post]);


  // ==========================================================
  // ADD OR UPDATE REACTION
  // ==========================================================

  const handleAddReaction = async (
    reactionType: ReactionType
  ) => {

    try {

      setReactionLoading(
        reactionType
      );

      setReactionMessage(
        ""
      );

      const response =
        await apiFetch(
          `/reactions/posts/${postId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                reaction_type:
                  reactionType,
              }),
          }
        );


      const data =
        await response.json();


      if (!response.ok) {

        const message =
          Array.isArray(
            data.detail
          )
            ? data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ||
                    "Validation error."
                )
                .join(", ")
            : data.detail ||
              "Could not add reaction.";

        setReactionMessage(
          message
        );

        return;

      }


      setSelectedReaction(
        reactionType
      );


      setReactionMessage(
        `Reaction changed to ${reactionType}.`
      );


      await getReactions();

    } catch (error) {

      console.error(
        "Reaction error:",
        error
      );

      setReactionMessage(
        "Could not add reaction."
      );

    } finally {

      setReactionLoading(
        null
      );

    }

  };


  // ==========================================================
  // DELETE REACTION
  // ==========================================================

  const handleDeleteReaction = async () => {

    try {

      setReactionLoading(
        selectedReaction
      );

      setReactionMessage(
        ""
      );

      const response =
        await apiFetch(
          `/reactions/posts/${postId}`,
          {
            method: "DELETE",
          }
        );


      let data: {
        detail?: string;
        message?: string;
      } | null = null;


      try {

        data =
          await response.json();

      } catch {

        data = null;

      }


      if (!response.ok) {

        setReactionMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Could not remove reaction."
        );

        return;

      }


      setSelectedReaction(
        null
      );


      setReactionMessage(
        data?.message ||
        "Reaction removed successfully."
      );


      await getReactions();

    } catch (error) {

      console.error(
        "Delete reaction error:",
        error
      );

      setReactionMessage(
        "Could not remove reaction."
      );

    } finally {

      setReactionLoading(
        null
      );

    }

  };


  // ==========================================================
  // REACTION CLICK
  // ==========================================================

  const handleReaction = async (
    reactionType: ReactionType
  ) => {

    if (
      selectedReaction ===
      reactionType
    ) {

      await handleDeleteReaction();

      return;

    }


    await handleAddReaction(
      reactionType
    );

  };


  // ==========================================================
  // ADD POST TO COLLECTION
  // ==========================================================

  const handleAddToCollection = async () => {

    if (!selectedCollectionId) {

      setCollectionMessage(
        "Please select a collection."
      );

      return;

    }

    try {

      setCollectionActionLoading(
        true
      );

      setCollectionMessage(
        ""
      );

      const response =
        await apiFetch(
          `/collections/${selectedCollectionId}/posts/${postId}`,
          {
            method: "POST",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        setCollectionMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Could not add post to collection."
        );

        return;

      }

      setCollectionMessage(
        data?.message ||
        "Post added to collection."
      );

    } catch (error) {

      console.error(
        "Add to collection error:",
        error
      );

      setCollectionMessage(
        "Could not add post to collection."
      );

    } finally {

      setCollectionActionLoading(
        false
      );

    }

  };


  // ==========================================================
  // REMOVE POST FROM COLLECTION
  // ==========================================================

  const handleRemoveFromCollection = async () => {

    if (!selectedCollectionId) {

      setCollectionMessage(
        "Please select a collection."
      );

      return;

    }

    try {

      setCollectionActionLoading(
        true
      );

      setCollectionMessage(
        ""
      );

      const response =
        await apiFetch(
          `/collections/${selectedCollectionId}/posts/${postId}`,
          {
            method: "DELETE",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        setCollectionMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Could not remove post from collection."
        );

        return;

      }

      setCollectionMessage(
        data?.message ||
        "Post removed from collection."
      );

    } catch (error) {

      console.error(
        "Remove from collection error:",
        error
      );

      setCollectionMessage(
        "Could not remove post from collection."
      );

    } finally {

      setCollectionActionLoading(
        false
      );

    }

  };


  // ==========================================================
  // FOLLOW USER
  // ==========================================================

  const handleFollow = async () => {

    if (!post) {
      return;
    }

    try {

      setFollowLoading(
        true
      );

      setFollowMessage(
        ""
      );

      const response =
        await apiFetch(
          `/follows/${post.owner_id}`,
          {
            method: "POST",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        const message =
          typeof data?.detail === "string"
            ? data.detail
            : "Could not follow this author.";

        if (
          message
            .toLowerCase()
            .includes("zaten takip")
        ) {

          setFollowing(
            true
          );

        }

        setFollowMessage(
          message
        );

        return;

      }

      setFollowing(
        true
      );

      setFollowMessage(
        data?.message ||
        "Author followed successfully."
      );

      await getFollowStats(
        post.owner_id
      );

    } catch (error) {

      console.error(
        "Follow error:",
        error
      );

      setFollowMessage(
        "Could not follow this author."
      );

    } finally {

      setFollowLoading(
        false
      );

    }

  };


  // ==========================================================
  // UNFOLLOW USER
  // ==========================================================

  const handleUnfollow = async () => {

    if (!post) {
      return;
    }

    try {

      setFollowLoading(
        true
      );

      setFollowMessage(
        ""
      );

      const response =
        await apiFetch(
          `/follows/${post.owner_id}`,
          {
            method: "DELETE",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        setFollowMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Could not unfollow this author."
        );

        return;

      }

      setFollowing(
        false
      );

      setFollowMessage(
        data?.message ||
        "Author unfollowed successfully."
      );

      await getFollowStats(
        post.owner_id
      );

    } catch (error) {

      console.error(
        "Unfollow error:",
        error
      );

      setFollowMessage(
        "Could not unfollow this author."
      );

    } finally {

      setFollowLoading(
        false
      );

    }

  };


  // ==========================================================
  // TOGGLE FOLLOW
  // ==========================================================

  const handleFollowToggle = async () => {

    if (following) {

      await handleUnfollow();

    } else {

      await handleFollow();

    }

  };


  // ==========================================================
  // CREATE REPOST
  // ==========================================================

  const handleCreateRepost = async () => {

    try {

      setRepostLoading(
        true
      );

      setRepostMessage(
        ""
      );

      const response =
        await apiFetch(
          `/reposts/${postId}`,
          {
            method: "POST",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        const message =
          typeof data?.detail === "string"
            ? data.detail
            : "Could not repost this story.";

        if (
          message
            .toLowerCase()
            .includes("zaten")
        ) {

          setReposted(
            true
          );

        }

        setRepostMessage(
          message
        );

        return;

      }

      setReposted(
        true
      );

      setRepostMessage(
        data?.message ||
        "Story reposted successfully."
      );

      await getRepostCount();

    } catch (error) {

      console.error(
        "Repost error:",
        error
      );

      setRepostMessage(
        "Could not repost this story."
      );

    } finally {

      setRepostLoading(
        false
      );

    }

  };


  // ==========================================================
  // DELETE REPOST
  // ==========================================================

  const handleDeleteRepost = async () => {

    try {

      setRepostLoading(
        true
      );

      setRepostMessage(
        ""
      );

      const response =
        await apiFetch(
          `/reposts/${postId}`,
          {
            method: "DELETE",
          }
        );

      let data: {
        detail?: string;
        message?: string;
      } | null = null;

      try {

        data =
          await response.json();

      } catch {

        data = null;

      }

      if (!response.ok) {

        setRepostMessage(
          typeof data?.detail === "string"
            ? data.detail
            : "Could not remove repost."
        );

        return;

      }

      setReposted(
        false
      );

      setRepostMessage(
        data?.message ||
        "Repost removed successfully."
      );

      await getRepostCount();

    } catch (error) {

      console.error(
        "Delete repost error:",
        error
      );

      setRepostMessage(
        "Could not remove repost."
      );

    } finally {

      setRepostLoading(
        false
      );

    }

  };


  // ==========================================================
  // TOGGLE REPOST
  // ==========================================================

  const handleRepost = async () => {

    if (reposted) {

      await handleDeleteRepost();

    } else {

      await handleCreateRepost();

    }

  };


  // ==========================================================
  // ADD FAVORITE
  // ==========================================================

  const handleAddFavorite = async () => {

    try {

      setFavoriteLoading(
        true
      );

      setFavoriteMessage(
        ""
      );

      const response =
        await apiFetch(
          `/favorites/posts/${postId}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setFavoriteMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not add post to favorites."
        );

        return;

      }

      setFavorited(
        true
      );

      setFavoriteMessage(
        "Post added to favorites."
      );

    } catch (error) {

      console.error(
        "Favorite error:",
        error
      );

      setFavoriteMessage(
        "Could not add post to favorites."
      );

    } finally {

      setFavoriteLoading(
        false
      );

    }

  };


  // ==========================================================
  // REMOVE FAVORITE
  // ==========================================================

  const handleRemoveFavorite = async () => {

    try {

      setFavoriteLoading(
        true
      );

      setFavoriteMessage(
        ""
      );

      const response =
        await apiFetch(
          `/favorites/posts/${postId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        let message =
          "Could not remove post from favorites.";

        try {

          const data =
            await response.json();

          if (
            typeof data.detail === "string"
          ) {

            message =
              data.detail;

          }

        } catch {
        }

        setFavoriteMessage(
          message
        );

        return;

      }

      setFavorited(
        false
      );

      setFavoriteMessage(
        "Post removed from favorites."
      );

    } catch (error) {

      console.error(
        "Remove favorite error:",
        error
      );

      setFavoriteMessage(
        "Could not remove post from favorites."
      );

    } finally {

      setFavoriteLoading(
        false
      );

    }

  };


  // ==========================================================
  // TOGGLE FAVORITE
  // ==========================================================

  const handleFavorite = async () => {

    if (favorited) {

      await handleRemoveFavorite();

    } else {

      await handleAddFavorite();

    }

  };


  // ==========================================================
  // CREATE LIKE
  // ==========================================================

  const handleCreateLike = async () => {

    try {

      setLikeLoading(
        true
      );

      setLikeMessage(
        ""
      );

      const response =
        await apiFetch(
          `/likes/posts/${postId}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setLikeMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not like this post."
        );

        return;

      }

      setLiked(
        true
      );

      setLikeMessage(
        "Post liked successfully."
      );

      await getLikeCount();

    } catch (error) {

      console.error(
        "Like error:",
        error
      );

      setLikeMessage(
        "Could not like this post."
      );

    } finally {

      setLikeLoading(
        false
      );

    }

  };


  // ==========================================================
  // DELETE LIKE
  // ==========================================================

  const handleDeleteLike = async () => {

    try {

      setLikeLoading(
        true
      );

      setLikeMessage(
        ""
      );

      const response =
        await apiFetch(
          `/likes/posts/${postId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        let message =
          "Could not remove like.";

        try {

          const data =
            await response.json();

          if (
            typeof data.detail === "string"
          ) {

            message =
              data.detail;

          }

        } catch {
        }

        setLikeMessage(
          message
        );

        return;

      }

      setLiked(
        false
      );

      setLikeMessage(
        "Like removed successfully."
      );

      await getLikeCount();

    } catch (error) {

      console.error(
        "Unlike error:",
        error
      );

      setLikeMessage(
        "Could not remove like."
      );

    } finally {

      setLikeLoading(
        false
      );

    }

  };


  // ==========================================================
  // TOGGLE LIKE
  // ==========================================================

  const handleLike = async () => {

    if (liked) {

      await handleDeleteLike();

    } else {

      await handleCreateLike();

    }

  };


  // ==========================================================
  // CREATE CLAP
  // ==========================================================

  const handleCreateClap = async () => {

    try {

      setClapLoading(
        true
      );

      setClapMessage(
        ""
      );

      const response =
        await apiFetch(
          `/claps/${postId}`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setClapMessage(
          typeof data.detail === "string"
            ? data.detail
            : "Could not clap this post."
        );

        return;

      }

      setClapped(
        true
      );

      setClapMessage(
        "Clap added successfully."
      );

    } catch (error) {

      console.error(
        "Clap error:",
        error
      );

      setClapMessage(
        "Could not clap this post."
      );

    } finally {

      setClapLoading(
        false
      );

    }

  };


  // ==========================================================
  // DELETE CLAP
  // ==========================================================

  const handleDeleteClap = async () => {

    try {

      setClapLoading(
        true
      );

      setClapMessage(
        ""
      );

      const response =
        await apiFetch(
          `/claps/${postId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        let message =
          "Could not remove clap.";

        try {

          const data =
            await response.json();

          if (
            typeof data.detail === "string"
          ) {

            message =
              data.detail;

          }

        } catch {
        }

        setClapMessage(
          message
        );

        return;

      }

      setClapped(
        false
      );

      setClapMessage(
        "Clap removed successfully."
      );

    } catch (error) {

      console.error(
        "Delete clap error:",
        error
      );

      setClapMessage(
        "Could not remove clap."
      );

    } finally {

      setClapLoading(
        false
      );

    }

  };


  // ==========================================================
  // TOGGLE CLAP
  // ==========================================================

  const handleClap = async () => {

    if (clapped) {

      await handleDeleteClap();

    } else {

      await handleCreateClap();

    }

  };


  // ==========================================================
  // CREATE COMMENT
  // ==========================================================

  const handleCreateComment = async (
    event: FormEvent<HTMLFormElement>
  ) => {

    event.preventDefault();

    if (!commentContent.trim()) {

      setCommentError(
        "Please write a comment."
      );

      return;

    }

    try {

      setCommentSubmitting(
        true
      );

      setCommentError(
        ""
      );

      setCommentSuccess(
        ""
      );

      const response =
        await apiFetch(
          `/comments?post_id=${postId}`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                content:
                  commentContent.trim(),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        const errorMessage =
          Array.isArray(
            data.detail
          )
            ? data.detail
                .map(
                  (
                    item: {
                      msg?: string;
                    }
                  ) =>
                    item.msg ||
                    "Validation error."
                )
                .join(", ")
            : data.detail ||
              "Comment could not be created.";

        setCommentError(
          errorMessage
        );

        return;

      }

      setCommentContent(
        ""
      );

      setCommentSuccess(
        "Comment added successfully."
      );

      await getComments();

    } catch (error) {

      console.error(
        "Create comment error:",
        error
      );

      setCommentError(
        "Could not create comment."
      );

    } finally {

      setCommentSubmitting(
        false
      );

    }

  };


  // ==========================================================
  // START EDIT COMMENT
  // ==========================================================

  const handleStartEditComment = (
    comment: Comment
  ) => {

    setEditingCommentId(
      comment.id
    );

    setEditingCommentContent(
      comment.content
    );

    setReplyingCommentId(
      null
    );

    setReplyContent(
      ""
    );

    setCommentError(
      ""
    );

    setCommentSuccess(
      ""
    );

  };


  // ==========================================================
  // CANCEL EDIT
  // ==========================================================

  const handleCancelEditComment = () => {

    setEditingCommentId(
      null
    );

    setEditingCommentContent(
      ""
    );

  };


  // ==========================================================
  // UPDATE COMMENT
  // ==========================================================

  const handleUpdateComment = async (
    commentId: number
  ) => {

    if (
      !editingCommentContent.trim()
    ) {

      setCommentError(
        "Comment cannot be empty."
      );

      return;

    }

    try {

      setCommentUpdating(
        true
      );

      setCommentError(
        ""
      );

      setCommentSuccess(
        ""
      );

      const response =
        await apiFetch(
          `/comments/${commentId}`,
          {
            method: "PUT",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                content:
                  editingCommentContent.trim(),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setCommentError(
          data.detail ||
          "Comment could not be updated."
        );

        return;

      }

      setCommentSuccess(
        "Comment updated successfully."
      );

      setEditingCommentId(
        null
      );

      setEditingCommentContent(
        ""
      );

      await getComments();

    } catch (error) {

      console.error(
        "Update comment error:",
        error
      );

      setCommentError(
        "Could not update comment."
      );

    } finally {

      setCommentUpdating(
        false
      );

    }

  };


  // ==========================================================
  // DELETE COMMENT
  // ==========================================================

  const handleDeleteComment = async (
    commentId: number
  ) => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this comment?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      setDeletingCommentId(
        commentId
      );

      setCommentError(
        ""
      );

      setCommentSuccess(
        ""
      );

      const response =
        await apiFetch(
          `/comments/${commentId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        let message =
          "Comment could not be deleted.";

        try {

          const data =
            await response.json();

          if (
            typeof data.detail === "string"
          ) {

            message =
              data.detail;

          }

        } catch {
        }

        setCommentError(
          message
        );

        return;

      }

      setCommentSuccess(
        "Comment deleted successfully."
      );

      if (
        editingCommentId ===
        commentId
      ) {

        setEditingCommentId(
          null
        );

        setEditingCommentContent(
          ""
        );

      }

      if (
        replyingCommentId ===
        commentId
      ) {

        setReplyingCommentId(
          null
        );

        setReplyContent(
          ""
        );

      }

      await getComments();

    } catch (error) {

      console.error(
        "Delete comment error:",
        error
      );

      setCommentError(
        "Could not delete comment."
      );

    } finally {

      setDeletingCommentId(
        null
      );

    }

  };


  // ==========================================================
  // START REPLY
  // ==========================================================

  const handleStartReply = (
    commentId: number
  ) => {

    setReplyingCommentId(
      commentId
    );

    setReplyContent(
      ""
    );

    setEditingCommentId(
      null
    );

    setEditingCommentContent(
      ""
    );

    setCommentError(
      ""
    );

    setCommentSuccess(
      ""
    );

  };


  // ==========================================================
  // CANCEL REPLY
  // ==========================================================

  const handleCancelReply = () => {

    setReplyingCommentId(
      null
    );

    setReplyContent(
      ""
    );

  };


  // ==========================================================
  // REPLY
  // ==========================================================

  const handleReply = async (
    commentId: number
  ) => {

    if (
      !replyContent.trim()
    ) {

      setCommentError(
        "Reply cannot be empty."
      );

      return;

    }

    try {

      setReplySubmitting(
        true
      );

      setCommentError(
        ""
      );

      setCommentSuccess(
        ""
      );

      const response =
        await apiFetch(
          `/comments/${commentId}/reply`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                content:
                  replyContent.trim(),
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setCommentError(
          data.detail ||
          "Reply could not be created."
        );

        return;

      }

      setReplyContent(
        ""
      );

      setReplyingCommentId(
        null
      );

      setCommentSuccess(
        "Reply added successfully."
      );

      await getComments();

    } catch (error) {

      console.error(
        "Reply error:",
        error
      );

      setCommentError(
        "Could not reply to comment."
      );

    } finally {

      setReplySubmitting(
        false
      );

    }

  };


  // ==========================================================
  // PUBLISH
  // ==========================================================

  const handlePublish = async () => {

    try {

      setPublishing(
        true
      );

      setError(
        ""
      );

      const response =
        await apiFetch(
          `/posts/${postId}/publish`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Publish failed."
        );

        return;

      }

      setPost(
        data
      );

      alert(
        "Post published successfully."
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "Could not publish post."
      );

    } finally {

      setPublishing(
        false
      );

    }

  };


  // ==========================================================
  // UNPUBLISH
  // ==========================================================

  const handleUnpublish = async () => {

    try {

      setUnpublishing(
        true
      );

      setError(
        ""
      );

      const response =
        await apiFetch(
          `/posts/${postId}/unpublish`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Unpublish failed."
        );

        return;

      }

      setPost(
        data
      );

      alert(
        "Post moved back to draft."
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "Could not unpublish post."
      );

    } finally {

      setUnpublishing(
        false
      );

    }

  };


  // ==========================================================
  // ARCHIVE
  // ==========================================================

  const handleArchive = async () => {

    try {

      setArchiving(
        true
      );

      setError(
        ""
      );

      const response =
        await apiFetch(
          `/posts/${postId}/archive`,
          {
            method: "POST",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Archive failed."
        );

        return;

      }

      setPost(
        data
      );

      alert(
        "Post archived successfully."
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "Could not archive post."
      );

    } finally {

      setArchiving(
        false
      );

    }

  };


  // ==========================================================
  // SCHEDULE
  // ==========================================================

  const handleSchedule = async () => {

    if (!scheduleDate) {

      alert(
        "Please select a date and time."
      );

      return;

    }

    try {

      setScheduling(
        true
      );

      setError(
        ""
      );

      const response =
        await apiFetch(
          `/posts/${postId}/schedule`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                scheduled_at:
                  scheduleDate,
              }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        setError(
          data.detail ||
          "Schedule failed."
        );

        return;

      }

      setPost(
        data
      );

      alert(
        "Post scheduled successfully."
      );

    } catch (error) {

      console.error(
        error
      );

      setError(
        "Could not schedule post."
      );

    } finally {

      setScheduling(
        false
      );

    }

  };


  // ==========================================================
  // DELETE POST
  // ==========================================================

  const handleDelete = async () => {

    const confirmDelete =
      window.confirm(
        "Are you sure you want to delete this post?"
      );

    if (!confirmDelete) {
      return;
    }

    try {

      setDeleting(
        true
      );

      const response =
        await apiFetch(
          `/posts/${postId}`,
          {
            method: "DELETE",
          }
        );

      if (!response.ok) {

        throw new Error(
          "Delete failed."
        );

      }

      alert(
        "Post deleted successfully."
      );

      router.push(
        "/posts"
      );

    } catch (error) {

      console.error(
        error
      );

      alert(
        "Could not delete post."
      );

    } finally {

      setDeleting(
        false
      );

    }

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <main className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f5f1e8]
        text-black
      ">

        Loading story...

      </main>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <main className="
        flex
        min-h-screen
        items-center
        justify-center
        bg-[#f5f1e8]
        px-6
        text-black
      ">

        <div className="
          text-center
        ">

          <p className="
            text-red-600
          ">

            {error}

          </p>


          <button
            type="button"
            onClick={() =>
              router.push(
                "/posts"
              )
            }
            className="
              mt-6
              rounded-full
              bg-black
              px-6
              py-3
              text-sm
              text-white
            "
          >

            Back to stories

          </button>

        </div>

      </main>

    );

  }


  if (!post) {
    return null;
  }


  const isOwnPost =
    currentUser?.id ===
    post.owner_id;


  const totalReactions =
    reactionCounts.love +
    reactionCounts.fire +
    reactionCounts.laugh +
    reactionCounts.clap;


  // ==========================================================
  // PAGE
  // ==========================================================

  return (

    <main className="
      min-h-screen
      bg-[#f5f1e8]
      px-6
      py-20
      text-black
    ">

      <article className="
        mx-auto
        max-w-4xl
      ">


        {/* BACK */}

        <button
          type="button"
          onClick={() =>
            router.back()
          }
          className="
            text-sm
            text-black/50
            hover:text-black
          "
        >

          ← Back

        </button>


        {/* LABEL */}

        <p className="
          mt-12
          text-xs
          uppercase
          tracking-[0.3em]
          text-black/40
        ">

          Mindscape Story

        </p>


        {/* TITLE */}

        <h1 className="
          mt-6
          text-5xl
          font-semibold
          leading-tight
          tracking-[-0.05em]
          md:text-7xl
        ">

          {post.title}

        </h1>


        {/* ====================================================
            AUTHOR
        ==================================================== */}

        <div className="
          mt-7
        ">

          <div className="
            flex
            flex-wrap
            items-center
            gap-4
          ">

            <span className="
              text-sm
              font-medium
              text-black/65
            ">

              Author #{post.owner_id}

            </span>


            {
              currentUser &&
              !isOwnPost
              &&
              <button
                type="button"
                onClick={
                  handleFollowToggle
                }
                disabled={
                  followLoading
                }
                className="
                  rounded-full
                  border
                  border-black
                  px-5
                  py-2
                  text-xs
                  font-medium
                  transition
                  hover:bg-black
                  hover:text-white
                  disabled:opacity-40
                "
              >

                {
                  followLoading
                    ? "Please wait..."
                    : following
                      ? "Following"
                      : "Follow"
                }

              </button>
            }


            {
              currentUser &&
              isOwnPost
              &&
              <span className="
                rounded-full
                bg-black/5
                px-4
                py-2
                text-xs
                text-black/50
              ">

                Your story

              </span>
            }

          </div>


          {/* FOLLOW STATS */}

          <div className="
            mt-4
            flex
            flex-wrap
            gap-5
            text-sm
            text-black/45
          ">

            <span>

              <strong className="
                font-medium
                text-black/70
              ">

                {followerCount}

              </strong>

              {" "}

              {
                followerCount === 1
                  ? "Follower"
                  : "Followers"
              }

            </span>


            <span>

              <strong className="
                font-medium
                text-black/70
              ">

                {followingCount}

              </strong>

              {" "}
              Following

            </span>

          </div>


          {
            followMessage
            &&
            <p className="
              mt-3
              text-sm
              text-black/55
            ">

              {followMessage}

            </p>
          }

        </div>


        {/* ====================================================
            ACTION BUTTONS
        ==================================================== */}

        <div className="
          mt-8
          flex
          flex-wrap
          items-center
          gap-4
        ">

          <button
            type="button"
            onClick={() =>
              router.push(
                `/posts/${postId}/edit`
              )
            }
            className="
              rounded-full
              border
              border-black
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
            "
          >

            Edit

          </button>


          <button
            type="button"
            onClick={() =>
              router.push(
                `/posts/${postId}/history`
              )
            }
            className="
              rounded-full
              border
              border-black/30
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
            "
          >

            Version History

          </button>


          {/* CLAP */}

          <button
            type="button"
            onClick={
              handleClap
            }
            disabled={
              clapLoading
            }
            className="
              rounded-full
              border
              border-black/30
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
              disabled:opacity-40
            "
          >

            {
              clapLoading
                ? "Please wait..."
                : clapped
                  ? "👏 Remove Clap"
                  : "👏 Clap"
            }

          </button>


          {/* LIKE */}

          <button
            type="button"
            onClick={
              handleLike
            }
            disabled={
              likeLoading
            }
            className="
              rounded-full
              border
              border-black/30
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
              disabled:opacity-40
            "
          >

            {
              likeLoading
                ? "Please wait..."
                : liked
                  ? `♥ Liked · ${likeCount}`
                  : `♡ Like · ${likeCount}`
            }

          </button>


          {/* REPOST */}

          <button
            type="button"
            onClick={
              handleRepost
            }
            disabled={
              repostLoading
            }
            className="
              rounded-full
              border
              border-black/30
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
              disabled:opacity-40
            "
          >

            {
              repostLoading
                ? "Please wait..."
                : reposted
                  ? `↻ Reposted · ${repostCount}`
                  : `↻ Repost · ${repostCount}`
            }

          </button>


          {/* FAVORITE */}

          <button
            type="button"
            onClick={
              handleFavorite
            }
            disabled={
              favoriteLoading
            }
            className="
              rounded-full
              border
              border-black/30
              px-6
              py-3
              text-sm
              transition
              hover:bg-black
              hover:text-white
              disabled:opacity-40
            "
          >

            {
              favoriteLoading
                ? "Please wait..."
                : favorited
                  ? "★ Saved"
                  : "☆ Save"
            }

          </button>


          {/* DRAFT */}

          {
            post.status === "draft"
            &&
            <>

              <input
                type="datetime-local"
                value={
                  scheduleDate
                }
                onChange={
                  event =>
                    setScheduleDate(
                      event.target.value
                    )
                }
                className="
                  rounded-full
                  border
                  border-black
                  bg-transparent
                  px-4
                  py-3
                  text-sm
                "
              />


              <button
                type="button"
                onClick={
                  handleSchedule
                }
                disabled={
                  scheduling ||
                  !scheduleDate
                }
                className="
                  rounded-full
                  bg-blue-700
                  px-6
                  py-3
                  text-sm
                  text-white
                  disabled:opacity-40
                "
              >

                {
                  scheduling
                    ? "Scheduling..."
                    : "Schedule"
                }

              </button>


              <button
                type="button"
                onClick={
                  handlePublish
                }
                disabled={
                  publishing
                }
                className="
                  rounded-full
                  bg-green-700
                  px-6
                  py-3
                  text-sm
                  text-white
                  disabled:opacity-50
                "
              >

                {
                  publishing
                    ? "Publishing..."
                    : "Publish"
                }

              </button>

            </>
          }


          {/* SCHEDULED */}

          {
            post.status === "scheduled"
            &&
            <span className="
              rounded-full
              bg-blue-700
              px-6
              py-3
              text-sm
              text-white
            ">

              Scheduled

            </span>
          }


          {/* PUBLISHED */}

          {
            post.status === "published"
            &&
            <>

              <button
                type="button"
                onClick={
                  handleUnpublish
                }
                disabled={
                  unpublishing
                }
                className="
                  rounded-full
                  bg-yellow-600
                  px-6
                  py-3
                  text-sm
                  text-white
                  disabled:opacity-50
                "
              >

                {
                  unpublishing
                    ? "Unpublishing..."
                    : "Unpublish"
                }

              </button>


              <button
                type="button"
                onClick={
                  handleArchive
                }
                disabled={
                  archiving
                }
                className="
                  rounded-full
                  bg-purple-700
                  px-6
                  py-3
                  text-sm
                  text-white
                  disabled:opacity-50
                "
              >

                {
                  archiving
                    ? "Archiving..."
                    : "Archive"
                }

              </button>

            </>
          }


          {/* ARCHIVED */}

          {
            post.status === "archived"
            &&
            <span className="
              rounded-full
              bg-gray-700
              px-6
              py-3
              text-sm
              text-white
            ">

              Archived

            </span>
          }


          {/* DELETE */}

          <button
            type="button"
            onClick={
              handleDelete
            }
            disabled={
              deleting
            }
            className="
              rounded-full
              bg-red-600
              px-6
              py-3
              text-sm
              text-white
              disabled:opacity-50
            "
          >

            {
              deleting
                ? "Deleting..."
                : "Delete"
            }

          </button>

        </div>


        {/* ====================================================
            REACTIONS
        ==================================================== */}

        <div className="
          mt-8
          rounded-2xl
          border
          border-black/15
          p-5
        ">

          <div className="
            flex
            flex-wrap
            items-center
            justify-between
            gap-4
          ">

            <div>

              <p className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-black/40
              ">

                Reactions

              </p>


              <p className="
                mt-2
                text-sm
                text-black/50
              ">

                {totalReactions}
                {" "}
                {
                  totalReactions === 1
                    ? "reaction"
                    : "reactions"
                }

              </p>

            </div>

          </div>


          <div className="
            mt-5
            flex
            flex-wrap
            gap-3
          ">

            {
              reactionOptions.map(
                reaction => {

                  const isSelected =
                    selectedReaction ===
                    reaction.type;

                  const isLoading =
                    reactionLoading ===
                    reaction.type;


                  return (

                    <button
                      key={
                        reaction.type
                      }
                      type="button"
                      onClick={() =>
                        handleReaction(
                          reaction.type
                        )
                      }
                      disabled={
                        reactionLoading !== null
                      }
                      className={`
                        rounded-full
                        border
                        px-5
                        py-3
                        text-sm
                        transition
                        disabled:cursor-not-allowed
                        disabled:opacity-40

                        ${
                          isSelected

                            ? "border-black bg-black text-white"

                            : "border-black/20 hover:border-black hover:bg-black hover:text-white"
                        }
                      `}
                    >

                      {
                        isLoading
                          ? "Please wait..."
                          : `${reaction.emoji} ${reaction.label} · ${reactionCounts[reaction.type]}`
                      }

                    </button>

                  );

                }
              )
            }

          </div>


          {
            reactionMessage
            &&
            <p className="
              mt-4
              text-sm
              text-black/55
            ">

              {reactionMessage}

            </p>
          }

        </div>


        {/* ====================================================
            COLLECTION
        ==================================================== */}

        <div className="
          mt-8
          rounded-2xl
          border
          border-black/15
          p-5
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.2em]
            text-black/40
          ">

            Collection

          </p>


          {
            collectionLoading

              ?

              <p className="
                mt-4
                text-sm
                text-black/50
              ">

                Loading collections...

              </p>

              : collections.length === 0

                ?

                <div className="
                  mt-4
                ">

                  <p className="
                    text-sm
                    text-black/50
                  ">

                    You do not have any collections yet.

                  </p>


                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        "/collections"
                      )
                    }
                    className="
                      mt-4
                      rounded-full
                      border
                      border-black/30
                      px-5
                      py-2
                      text-sm
                      transition
                      hover:bg-black
                      hover:text-white
                    "
                  >

                    Create collection

                  </button>

                </div>

                :

                <>

                  <div className="
                    mt-4
                    flex
                    flex-col
                    gap-3
                    md:flex-row
                  ">

                    <select
                      value={
                        selectedCollectionId
                      }
                      onChange={
                        event => {

                          setSelectedCollectionId(
                            event.target.value
                          );

                          setCollectionMessage(
                            ""
                          );

                        }
                      }
                      className="
                        flex-1
                        rounded-xl
                        border
                        border-black/20
                        bg-transparent
                        px-4
                        py-3
                        text-sm
                        outline-none
                        focus:border-black
                      "
                    >

                      <option
                        value=""
                      >

                        Select collection

                      </option>


                      {
                        collections.map(
                          collection => (

                            <option
                              key={
                                collection.id
                              }
                              value={
                                collection.id
                              }
                            >

                              {collection.name}

                            </option>

                          )
                        )
                      }

                    </select>


                    <button
                      type="button"
                      onClick={
                        handleAddToCollection
                      }
                      disabled={
                        collectionActionLoading ||
                        !selectedCollectionId
                      }
                      className="
                        rounded-full
                        bg-black
                        px-5
                        py-3
                        text-sm
                        text-white
                        disabled:opacity-40
                      "
                    >

                      {
                        collectionActionLoading
                          ? "Please wait..."
                          : "Add"
                      }

                    </button>


                    <button
                      type="button"
                      onClick={
                        handleRemoveFromCollection
                      }
                      disabled={
                        collectionActionLoading ||
                        !selectedCollectionId
                      }
                      className="
                        rounded-full
                        border
                        border-black/30
                        px-5
                        py-3
                        text-sm
                        transition
                        hover:bg-black
                        hover:text-white
                        disabled:opacity-40
                      "
                    >

                      Remove

                    </button>

                  </div>


                  {
                    collectionMessage
                    &&
                    <p className="
                      mt-4
                      text-sm
                      text-black/55
                    ">

                      {collectionMessage}

                    </p>
                  }

                </>
          }

        </div>


        {/* ====================================================
            OTHER ACTION MESSAGES
        ==================================================== */}

        {
          clapMessage
          &&
          <p className="
            mt-4
            text-sm
            text-black/55
          ">

            {clapMessage}

          </p>
        }


        {
          likeMessage
          &&
          <p className="
            mt-2
            text-sm
            text-black/55
          ">

            {likeMessage}

          </p>
        }


        {
          repostMessage
          &&
          <p className="
            mt-2
            text-sm
            text-black/55
          ">

            {repostMessage}

          </p>
        }


        {
          favoriteMessage
          &&
          <p className="
            mt-2
            text-sm
            text-black/55
          ">

            {favoriteMessage}

          </p>
        }


        {/* ====================================================
            POST META
        ==================================================== */}

        <div className="
          mt-8
          flex
          flex-wrap
          gap-6
          text-sm
          text-black/40
        ">

          <span>
            Reading time:
            {" "}
            {post.reading_time}
            {" "}
            min
          </span>


          <span>
            Status:
            {" "}
            {post.status}
          </span>


          <span>
            Owner:
            {" "}
            {post.owner_id}
          </span>


          <span>
            Likes:
            {" "}
            {likeCount}
          </span>


          <span>
            Reposts:
            {" "}
            {repostCount}
          </span>


          <span>
            Reactions:
            {" "}
            {totalReactions}
          </span>

        </div>


        {/* SCHEDULE */}

        {
          post.status === "scheduled"
          &&
          post.scheduled_at
          &&
          <div className="
            mt-6
            rounded-xl
            border
            border-blue-700/20
            bg-blue-50
            p-4
            text-sm
            text-blue-700
          ">

            Scheduled at:
            {" "}

            {
              new Date(
                post.scheduled_at
              ).toLocaleString()
            }

          </div>
        }


        {/* ====================================================
            CONTENT
        ==================================================== */}

        <div className="
          mt-14
          border-t
          border-black/10
          pt-10
        ">

          <p className="
            whitespace-pre-line
            text-lg
            leading-[2]
            text-black/75
          ">

            {post.content}

          </p>

        </div>


        {/* ====================================================
            STATUS
        ==================================================== */}

        <div className="
          mt-14
          border-t
          border-black/10
          pt-8
        ">

          <p className="
            text-xs
            uppercase
            tracking-[0.3em]
            text-black/40
          ">

            {
              post.status === "archived"
                ? "Archived"
                : post.status === "scheduled"
                  ? "Scheduled"
                  : post.status === "draft"
                    ? "Draft"
                    : "Published"
            }

          </p>


          <p className="
            mt-3
            text-sm
            text-black/60
          ">

            {
              post.status === "scheduled"
              && post.scheduled_at

                ? new Date(
                    post.scheduled_at
                  ).toLocaleString()

                : post.published_at

                  ? new Date(
                      post.published_at
                    ).toLocaleString()

                  : post.status === "draft"

                    ? "This story is currently a draft."

                    : post.status === "archived"

                      ? "This story is archived."

                      : "Not published"
            }

          </p>

        </div>


        {/* ====================================================
            COMMENTS
        ==================================================== */}

        <section className="
          mt-20
          border-t
          border-black
          pt-12
        ">

          <div className="
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          ">

            <div>

              <p className="
                text-xs
                uppercase
                tracking-[0.3em]
                text-black/40
              ">

                Discussion

              </p>


              <h2 className="
                mt-4
                text-4xl
                font-semibold
              ">

                Comments

              </h2>

            </div>


            <p className="
              text-sm
              text-black/45
            ">

              {comments.length}
              {" "}

              {
                comments.length === 1
                  ? "comment"
                  : "comments"
              }

            </p>

          </div>


          {/* CREATE COMMENT */}

          <form
            onSubmit={
              handleCreateComment
            }
            className="
              mt-10
              rounded-2xl
              border
              border-black/15
              p-6
            "
          >

            <label
              htmlFor="comment"
              className="
                text-xs
                uppercase
                tracking-[0.2em]
                text-black/40
              "
            >

              Join the discussion

            </label>


            <textarea
              id="comment"
              value={
                commentContent
              }
              onChange={
                event => {

                  setCommentContent(
                    event.target.value
                  );

                  setCommentError(
                    ""
                  );

                  setCommentSuccess(
                    ""
                  );

                }
              }
              rows={4}
              placeholder="Write your comment..."
              className="
                mt-4
                w-full
                resize-none
                border-b
                border-black/20
                bg-transparent
                pb-4
                outline-none
              "
            />


            {
              commentError
              &&
              <p className="
                mt-4
                text-sm
                text-red-600
              ">

                {commentError}

              </p>
            }


            {
              commentSuccess
              &&
              <p className="
                mt-4
                text-sm
                text-green-700
              ">

                {commentSuccess}

              </p>
            }


            <div className="
              mt-6
              flex
              justify-end
            ">

              <button
                type="submit"
                disabled={
                  commentSubmitting ||
                  !commentContent.trim()
                }
                className="
                  rounded-full
                  bg-black
                  px-7
                  py-3
                  text-sm
                  text-white
                  disabled:opacity-40
                "
              >

                {
                  commentSubmitting
                    ? "Posting..."
                    : "Add comment"
                }

              </button>

            </div>

          </form>


          {/* COMMENT LIST */}

          <div className="
            mt-12
          ">

            {
              commentsLoading

                ?

                <p className="
                  text-sm
                  text-black/50
                ">

                  Loading comments...

                </p>

                : comments.length === 0

                  ?

                  <p className="
                    border-t
                    border-black/15
                    py-12
                    text-black/50
                  ">

                    No comments yet.

                  </p>

                  :

                  <div className="
                    border-t
                    border-black
                  ">

                    {
                      comments.map(
                        comment => (

                          <article
                            key={
                              comment.id
                            }
                            className="
                              border-b
                              border-black/15
                              py-8
                            "
                          >

                            <div className="
                              flex
                              justify-between
                              gap-6
                            ">

                              <p className="
                                text-xs
                                uppercase
                                tracking-[0.2em]
                                text-black/40
                              ">

                                User #{comment.owner_id}

                              </p>


                              <p className="
                                text-xs
                                text-black/35
                              ">

                                Comment #{comment.id}

                              </p>

                            </div>


                            {
                              editingCommentId ===
                              comment.id

                                ?

                                <div className="
                                  mt-5
                                ">

                                  <textarea
                                    value={
                                      editingCommentContent
                                    }
                                    onChange={
                                      event =>
                                        setEditingCommentContent(
                                          event.target.value
                                        )
                                    }
                                    rows={4}
                                    className="
                                      w-full
                                      rounded-xl
                                      border
                                      border-black/20
                                      bg-transparent
                                      p-4
                                      outline-none
                                    "
                                  />


                                  <div className="
                                    mt-4
                                    flex
                                    gap-3
                                  ">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateComment(
                                          comment.id
                                        )
                                      }
                                      disabled={
                                        commentUpdating ||
                                        !editingCommentContent.trim()
                                      }
                                      className="
                                        rounded-full
                                        bg-black
                                        px-5
                                        py-2
                                        text-sm
                                        text-white
                                        disabled:opacity-40
                                      "
                                    >

                                      {
                                        commentUpdating
                                          ? "Saving..."
                                          : "Save"
                                      }

                                    </button>


                                    <button
                                      type="button"
                                      onClick={
                                        handleCancelEditComment
                                      }
                                      className="
                                        rounded-full
                                        border
                                        border-black/30
                                        px-5
                                        py-2
                                        text-sm
                                      "
                                    >

                                      Cancel

                                    </button>

                                  </div>

                                </div>

                                :

                                <>

                                  <p className="
                                    mt-4
                                    whitespace-pre-line
                                    leading-[1.8]
                                    text-black/70
                                  ">

                                    {comment.content}

                                  </p>


                                  {
                                    comment.parent_id
                                    &&
                                    <p className="
                                      mt-3
                                      text-xs
                                      text-black/40
                                    ">

                                      ↳ Reply to comment
                                      {" "}
                                      #{comment.parent_id}

                                    </p>
                                  }


                                  <div className="
                                    mt-5
                                    flex
                                    flex-wrap
                                    gap-3
                                  ">

                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartEditComment(
                                          comment
                                        )
                                      }
                                      className="
                                        rounded-full
                                        border
                                        border-black/30
                                        px-4
                                        py-2
                                        text-xs
                                      "
                                    >

                                      Edit

                                    </button>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleStartReply(
                                          comment.id
                                        )
                                      }
                                      className="
                                        rounded-full
                                        border
                                        border-black/30
                                        px-4
                                        py-2
                                        text-xs
                                      "
                                    >

                                      Reply

                                    </button>


                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleDeleteComment(
                                          comment.id
                                        )
                                      }
                                      disabled={
                                        deletingCommentId ===
                                        comment.id
                                      }
                                      className="
                                        rounded-full
                                        border
                                        border-red-600/40
                                        px-4
                                        py-2
                                        text-xs
                                        text-red-700
                                        disabled:opacity-40
                                      "
                                    >

                                      {
                                        deletingCommentId ===
                                        comment.id
                                          ? "Deleting..."
                                          : "Delete"
                                      }

                                    </button>

                                  </div>

                                </>
                            }


                            {/* REPLY FORM */}

                            {
                              replyingCommentId ===
                              comment.id
                              &&
                              <div className="
                                mt-6
                                rounded-xl
                                border
                                border-black/15
                                p-5
                              ">

                                <p className="
                                  text-xs
                                  uppercase
                                  tracking-[0.2em]
                                  text-black/40
                                ">

                                  Reply to comment
                                  {" "}
                                  #{comment.id}

                                </p>


                                <textarea
                                  value={
                                    replyContent
                                  }
                                  onChange={
                                    event =>
                                      setReplyContent(
                                        event.target.value
                                      )
                                  }
                                  rows={3}
                                  placeholder="Write your reply..."
                                  className="
                                    mt-4
                                    w-full
                                    resize-none
                                    border-b
                                    border-black/20
                                    bg-transparent
                                    pb-3
                                    outline-none
                                  "
                                />


                                <div className="
                                  mt-4
                                  flex
                                  gap-3
                                ">

                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleReply(
                                        comment.id
                                      )
                                    }
                                    disabled={
                                      replySubmitting ||
                                      !replyContent.trim()
                                    }
                                    className="
                                      rounded-full
                                      bg-black
                                      px-5
                                      py-2
                                      text-sm
                                      text-white
                                      disabled:opacity-40
                                    "
                                  >

                                    {
                                      replySubmitting
                                        ? "Sending..."
                                        : "Send Reply"
                                    }

                                  </button>


                                  <button
                                    type="button"
                                    onClick={
                                      handleCancelReply
                                    }
                                    disabled={
                                      replySubmitting
                                    }
                                    className="
                                      rounded-full
                                      border
                                      border-black/30
                                      px-5
                                      py-2
                                      text-sm
                                    "
                                  >

                                    Cancel

                                  </button>

                                </div>

                              </div>
                            }

                          </article>

                        )
                      )
                    }

                  </div>
            }

          </div>

        </section>

      </article>

    </main>

  );

}