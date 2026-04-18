import { gql } from "@/graphql/generated";

export const CREATE_SPOT = gql(`
  mutation CreateSpot($input: CreateSpotInput!) {
    createSpot(input: $input) {
      id
      title
    }
  }
`);

export const UPDATE_SPOT = gql(`
  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {
    updateSpot(id: $id, input: $input) {
      id
      title
    }
  }
`);

export const DELETE_SPOT = gql(`
  mutation DeleteSpot($id: ID!) {
    deleteSpot(id: $id)
  }
`);
