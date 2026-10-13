import { gql } from "@/graphql/generated";

export const GET_COLLECTIONS = gql(`
  query GetCollections($first: Int, $after: String, $filter: CollectionFilterInput) {
    collections(first: $first, after: $after, filter: $filter) {
      totalCount
      edges {
        node {
          id
          title
          thumbnailUrl
          spotCount
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

export const GET_COLLECTION = gql(`
  query GetCollection($id: ID!) {
    collection(id: $id) {
      id
      title
      description
      coverImageUrl
      createdAt
      spotCount
      user {
        id
        name
        avatarUrl
      }
      spots {
        order
        comment
        spot {
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
      }
    }
  }
`);

export const GET_MY_COLLECTIONS = gql(`
  query GetMyCollections($first: Int, $after: String) {
    myCollections(first: $first, after: $after) {
      totalCount
      edges {
        node {
          id
          title
          thumbnailUrl
          spotCount
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
