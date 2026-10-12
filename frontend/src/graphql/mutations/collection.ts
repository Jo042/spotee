import { gql } from "@/graphql/generated";

export const CREATE_COLLECTION = gql(`
  mutation CreateCollection($input: CollectionInput!) {
    createCollection(input: $input) {
      id
    }
  }
`);

/** 返り値は特集の詳細と同じ形にし、キャッシュの特集をそのまま新しくする */
export const UPDATE_COLLECTION = gql(`
  mutation UpdateCollection($id: ID!, $input: CollectionInput!) {
    updateCollection(id: $id, input: $input) {
      id
      title
      description
      coverImageUrl
      thumbnailUrl
      spotCount
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

export const DELETE_COLLECTION = gql(`
  mutation DeleteCollection($id: ID!) {
    deleteCollection(id: $id)
  }
`);
