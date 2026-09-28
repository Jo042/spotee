import { gql } from "@/graphql/generated";

export const GET_MY_FOLDERS = gql(`
  query GetMyFolders {
    myFolders {
      id
      name
      spotCount
      thumbnailUrl
    }
  }
`);

export const GET_SPOT_BOOKMARK_STATE = gql(`
  query GetSpotBookmarkState($id: ID!) {
    spot(id: $id) {
      id
      isBookmarked
      bookmarkFolderIds
    }
  }
`);

export const GET_FOLDER = gql(`
  query GetFolder($id: ID!, $first: Int, $after: String) {
    folder(id: $id) {
      id
      name
      spotCount
      spots(first: $first, after: $after) {
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
  }
`);
