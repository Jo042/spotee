import { gql } from "@/graphql/generated";

export const CREATE_FOLDER = gql(`
  mutation CreateFolder($input: FolderNameInput!) {
    createFolder(input: $input) {
      id
      name
      spotCount
      thumbnailUrl
    }
  }
`);

export const ADD_BOOKMARK = gql(`
  mutation AddBookmark($spotId: ID!, $folderId: ID!) {
    addBookmark(spotId: $spotId, folderId: $folderId) {
      id
      isBookmarked
      bookmarkFolderIds
    }
  }
`);

export const REMOVE_BOOKMARK = gql(`
  mutation RemoveBookmark($spotId: ID!, $folderId: ID!) {
    removeBookmark(spotId: $spotId, folderId: $folderId) {
      id
      isBookmarked
      bookmarkFolderIds
    }
  }
`);

export const RENAME_FOLDER = gql(`
  mutation RenameFolder($id: ID!, $input: FolderNameInput!) {
    renameFolder(id: $id, input: $input) {
      id
      name
    }
  }
`);

export const DELETE_FOLDER = gql(`
  mutation DeleteFolder($id: ID!) {
    deleteFolder(id: $id)
  }
`);
