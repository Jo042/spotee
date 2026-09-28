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
