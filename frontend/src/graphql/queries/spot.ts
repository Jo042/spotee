import { gql } from "@apollo/client";

export const GET_SPOT = gql`
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
`;
