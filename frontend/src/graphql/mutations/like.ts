import { gql } from "@/graphql/generated";

export const TOGGLE_LIKE = gql(`
  mutation ToggleLike($spotId: ID!) {
    toggleLike(spotId: $spotId) {
      liked
      likeCount
    }
  }
`);
