import { gql } from "@/graphql/generated";

export const FOLLOW_USER = gql(`
  mutation FollowUser($userId: ID!) {
    followUser(userId: $userId) {
      id
      isFollowing
      followersCount
    }
  }
`);

export const UNFOLLOW_USER = gql(`
  mutation UnfollowUser($userId: ID!) {
    unfollowUser(userId: $userId) {
      id
      isFollowing
      followersCount
    }
  }
`);
