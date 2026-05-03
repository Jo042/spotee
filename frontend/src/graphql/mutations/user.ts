import { gql } from "@/graphql/generated";

export const UPDATE_PROFILE = gql(`
  mutation UpdateProfile($name: String, $bio: String, $avatarUrl: String) {
    updateProfile(name: $name, bio: $bio, avatarUrl: $avatarUrl) {
      id
      name
      bio
      avatarUrl
    }
  }
`);
