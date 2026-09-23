import { gql } from "@/graphql/generated";

export const UPDATE_PROFILE = gql(`
  mutation UpdateProfile($input: UpdateProfileInput!) {
    updateProfile(input: $input) {
      id
      name
      bio
      avatarUrl
    }
  }
`);
