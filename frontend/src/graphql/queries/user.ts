import { gql } from "@/graphql/generated";

export const GET_ME = gql(`
  query GetMe {
    me {
      id
      name
      email
      avatarUrl
      bio
      followersCount
      followingCount
    }
  }
`);

export const GET_MY_SPOTS = gql(`
  query GetMySpots($first: Int, $after: String) {
    mySpots(first: $first, after: $after) {
      edges {
        node {
          id
          title
          address
          likeCount
          isLiked
          isBookmarked
          images {
            id
            url
            order
          }
          category {
            id
            name
          }
          user {
            id
            name
            avatarUrl
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`);

export const GET_MY_LIKED_SPOTS = gql(`
  query GetMyLikedSpots($first: Int, $after: String) {
    myLikedSpots(first: $first, after: $after) {
      edges {
        node {
          id
          title
          address
          likeCount
          isLiked
          isBookmarked
          images {
            id
            url
            order
          }
          category {
            id
            name
          }
          user {
            id
            name
            avatarUrl
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`);

export const GET_USER_PROFILE = gql(`
  query GetUserProfile($id: ID!) {
    user(id: $id) {
      id
      name
      avatarUrl
      bio
      spotsCount
      followersCount
      followingCount
      isFollowing
    }
  }
`);

export const GET_USER_SPOTS = gql(`
  query GetUserSpots($userId: ID!, $first: Int, $after: String) {
    userSpots(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          id
          title
          address
          likeCount
          isLiked
          isBookmarked
          images {
            id
            url
            order
          }
          category {
            id
            name
          }
          user {
            id
            name
            avatarUrl
          }
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`);

export const GET_USER_FOLLOWERS = gql(`
  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {
    userFollowers(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          id
          name
          avatarUrl
          bio
          isFollowing
          followersCount
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`);

export const GET_USER_FOLLOWING = gql(`
  query GetUserFollowing($userId: ID!, $first: Int, $after: String) {
    userFollowing(userId: $userId, first: $first, after: $after) {
      edges {
        node {
          id
          name
          avatarUrl
          bio
          isFollowing
          followersCount
        }
        cursor
      }
      pageInfo {
        hasNextPage
        endCursor
      }
      totalCount
    }
  }
`);
