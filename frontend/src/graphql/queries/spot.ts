import { gql } from "@/graphql/generated";

export const GET_SPOT = gql(`
  query GetSpot($id: ID!) {
    spot(id: $id) {
      id
      title
      description
      address
      priceRange
      businessHours
      likeCount
      createdAt
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
`);

export const GET_SPOTS = gql(`
  query GetSpots($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {
    spots(first: $first, after: $after, sort: $sort, filter: $filter) {
      edges {
        node {
          id
          title
          address
          likeCount
          createdAt
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
