import { gql } from "@/graphql/generated";

export const GET_CATEGORIES = gql(`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`);

export const GET_ATTRIBUTE_TAGS = gql(`
  query GetAttributeTags {
    attributeTags {
      id
      name
      slug
    }
  }
`);

export const GET_MOOD_TAGS = gql(`
  query GetMoodTags {
    moodTags {
      id
      name
      slug
    }
  }
`);

export const GET_ALL_TAGS = gql(`
  query GetAllTags {
    categories {
      id
      name
      slug
    }
    attributeTags {
      id
      name
      slug
    }
    moodTags {
      id
      name
      slug
    }
  }
`);
