/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  mutation CreateFolder($input: FolderNameInput!) {\n    createFolder(input: $input) {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n": typeof types.CreateFolderDocument,
    "\n  mutation AddBookmark($spotId: ID!, $folderId: ID!) {\n    addBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": typeof types.AddBookmarkDocument,
    "\n  mutation RemoveBookmark($spotId: ID!, $folderId: ID!) {\n    removeBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": typeof types.RemoveBookmarkDocument,
    "\n  mutation RenameFolder($id: ID!, $input: FolderNameInput!) {\n    renameFolder(id: $id, input: $input) {\n      id\n      name\n    }\n  }\n": typeof types.RenameFolderDocument,
    "\n  mutation DeleteFolder($id: ID!) {\n    deleteFolder(id: $id)\n  }\n": typeof types.DeleteFolderDocument,
    "\n  mutation FollowUser($userId: ID!) {\n    followUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n": typeof types.FollowUserDocument,
    "\n  mutation UnfollowUser($userId: ID!) {\n    unfollowUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n": typeof types.UnfollowUserDocument,
    "\n  mutation ToggleLike($spotId: ID!) {\n    toggleLike(spotId: $spotId) {\n      liked\n      likeCount\n    }\n  }\n": typeof types.ToggleLikeDocument,
    "\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n": typeof types.CreateSpotDocument,
    "\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n": typeof types.UpdateSpotDocument,
    "\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n": typeof types.DeleteSpotDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      name\n      bio\n      avatarUrl\n    }\n  }\n": typeof types.UpdateProfileDocument,
    "\n  query GetMyFolders {\n    myFolders {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n": typeof types.GetMyFoldersDocument,
    "\n  query GetSpotBookmarkState($id: ID!) {\n    spot(id: $id) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": typeof types.GetSpotBookmarkStateDocument,
    "\n  query GetFolder($id: ID!, $first: Int, $after: String) {\n    folder(id: $id) {\n      id\n      name\n      spotCount\n      spots(first: $first, after: $after) {\n        edges {\n          node {\n            id\n            title\n            address\n            likeCount\n            isLiked\n            isBookmarked\n            images {\n              id\n              url\n              order\n            }\n            category {\n              id\n              name\n            }\n            user {\n              id\n              name\n              avatarUrl\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n": typeof types.GetFolderDocument,
    "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      isLiked\n      isBookmarked\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n        isFollowing\n        followersCount\n      }\n      attributeTags {\n        id\n        name\n      }\n      moodTags {\n        id\n        name\n      }\n    }\n  }\n": typeof types.GetSpotDocument,
    "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetSpotsDocument,
    "\n  query GetSpotsPage($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetSpotsPageDocument,
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetCategoriesDocument,
    "\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetAttributeTagsDocument,
    "\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetMoodTagsDocument,
    "\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetAllTagsDocument,
    "\n  query GetMe {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      followersCount\n      followingCount\n    }\n  }\n": typeof types.GetMeDocument,
    "\n  query GetMySpots($first: Int, $after: String) {\n    mySpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetMySpotsDocument,
    "\n  query GetMyLikedSpots($first: Int, $after: String) {\n    myLikedSpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetMyLikedSpotsDocument,
    "\n  query GetUserProfile($id: ID!) {\n    user(id: $id) {\n      id\n      name\n      avatarUrl\n      bio\n      spotsCount\n      followersCount\n      followingCount\n      isFollowing\n    }\n  }\n": typeof types.GetUserProfileDocument,
    "\n  query GetUserSpots($userId: ID!, $first: Int, $after: String) {\n    userSpots(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": typeof types.GetUserSpotsDocument,
    "\n  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {\n    userFollowers(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetUserFollowersDocument,
    "\n  query GetUserFollowing($userId: ID!, $first: Int, $after: String) {\n    userFollowing(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetUserFollowingDocument,
};
const documents: Documents = {
    "\n  mutation CreateFolder($input: FolderNameInput!) {\n    createFolder(input: $input) {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n": types.CreateFolderDocument,
    "\n  mutation AddBookmark($spotId: ID!, $folderId: ID!) {\n    addBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": types.AddBookmarkDocument,
    "\n  mutation RemoveBookmark($spotId: ID!, $folderId: ID!) {\n    removeBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": types.RemoveBookmarkDocument,
    "\n  mutation RenameFolder($id: ID!, $input: FolderNameInput!) {\n    renameFolder(id: $id, input: $input) {\n      id\n      name\n    }\n  }\n": types.RenameFolderDocument,
    "\n  mutation DeleteFolder($id: ID!) {\n    deleteFolder(id: $id)\n  }\n": types.DeleteFolderDocument,
    "\n  mutation FollowUser($userId: ID!) {\n    followUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n": types.FollowUserDocument,
    "\n  mutation UnfollowUser($userId: ID!) {\n    unfollowUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n": types.UnfollowUserDocument,
    "\n  mutation ToggleLike($spotId: ID!) {\n    toggleLike(spotId: $spotId) {\n      liked\n      likeCount\n    }\n  }\n": types.ToggleLikeDocument,
    "\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n": types.CreateSpotDocument,
    "\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n": types.UpdateSpotDocument,
    "\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n": types.DeleteSpotDocument,
    "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      name\n      bio\n      avatarUrl\n    }\n  }\n": types.UpdateProfileDocument,
    "\n  query GetMyFolders {\n    myFolders {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n": types.GetMyFoldersDocument,
    "\n  query GetSpotBookmarkState($id: ID!) {\n    spot(id: $id) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n": types.GetSpotBookmarkStateDocument,
    "\n  query GetFolder($id: ID!, $first: Int, $after: String) {\n    folder(id: $id) {\n      id\n      name\n      spotCount\n      spots(first: $first, after: $after) {\n        edges {\n          node {\n            id\n            title\n            address\n            likeCount\n            isLiked\n            isBookmarked\n            images {\n              id\n              url\n              order\n            }\n            category {\n              id\n              name\n            }\n            user {\n              id\n              name\n              avatarUrl\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n": types.GetFolderDocument,
    "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      isLiked\n      isBookmarked\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n        isFollowing\n        followersCount\n      }\n      attributeTags {\n        id\n        name\n      }\n      moodTags {\n        id\n        name\n      }\n    }\n  }\n": types.GetSpotDocument,
    "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetSpotsDocument,
    "\n  query GetSpotsPage($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetSpotsPageDocument,
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n": types.GetCategoriesDocument,
    "\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetAttributeTagsDocument,
    "\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetMoodTagsDocument,
    "\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetAllTagsDocument,
    "\n  query GetMe {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      followersCount\n      followingCount\n    }\n  }\n": types.GetMeDocument,
    "\n  query GetMySpots($first: Int, $after: String) {\n    mySpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetMySpotsDocument,
    "\n  query GetMyLikedSpots($first: Int, $after: String) {\n    myLikedSpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetMyLikedSpotsDocument,
    "\n  query GetUserProfile($id: ID!) {\n    user(id: $id) {\n      id\n      name\n      avatarUrl\n      bio\n      spotsCount\n      followersCount\n      followingCount\n      isFollowing\n    }\n  }\n": types.GetUserProfileDocument,
    "\n  query GetUserSpots($userId: ID!, $first: Int, $after: String) {\n    userSpots(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n": types.GetUserSpotsDocument,
    "\n  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {\n    userFollowers(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetUserFollowersDocument,
    "\n  query GetUserFollowing($userId: ID!, $first: Int, $after: String) {\n    userFollowing(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetUserFollowingDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateFolder($input: FolderNameInput!) {\n    createFolder(input: $input) {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n"): (typeof documents)["\n  mutation CreateFolder($input: FolderNameInput!) {\n    createFolder(input: $input) {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation AddBookmark($spotId: ID!, $folderId: ID!) {\n    addBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"): (typeof documents)["\n  mutation AddBookmark($spotId: ID!, $folderId: ID!) {\n    addBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RemoveBookmark($spotId: ID!, $folderId: ID!) {\n    removeBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"): (typeof documents)["\n  mutation RemoveBookmark($spotId: ID!, $folderId: ID!) {\n    removeBookmark(spotId: $spotId, folderId: $folderId) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation RenameFolder($id: ID!, $input: FolderNameInput!) {\n    renameFolder(id: $id, input: $input) {\n      id\n      name\n    }\n  }\n"): (typeof documents)["\n  mutation RenameFolder($id: ID!, $input: FolderNameInput!) {\n    renameFolder(id: $id, input: $input) {\n      id\n      name\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteFolder($id: ID!) {\n    deleteFolder(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteFolder($id: ID!) {\n    deleteFolder(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation FollowUser($userId: ID!) {\n    followUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n"): (typeof documents)["\n  mutation FollowUser($userId: ID!) {\n    followUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UnfollowUser($userId: ID!) {\n    unfollowUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n"): (typeof documents)["\n  mutation UnfollowUser($userId: ID!) {\n    unfollowUser(userId: $userId) {\n      id\n      isFollowing\n      followersCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation ToggleLike($spotId: ID!) {\n    toggleLike(spotId: $spotId) {\n      liked\n      likeCount\n    }\n  }\n"): (typeof documents)["\n  mutation ToggleLike($spotId: ID!) {\n    toggleLike(spotId: $spotId) {\n      liked\n      likeCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n"): (typeof documents)["\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      name\n      bio\n      avatarUrl\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateProfile($input: UpdateProfileInput!) {\n    updateProfile(input: $input) {\n      id\n      name\n      bio\n      avatarUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMyFolders {\n    myFolders {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n"): (typeof documents)["\n  query GetMyFolders {\n    myFolders {\n      id\n      name\n      spotCount\n      thumbnailUrl\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSpotBookmarkState($id: ID!) {\n    spot(id: $id) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"): (typeof documents)["\n  query GetSpotBookmarkState($id: ID!) {\n    spot(id: $id) {\n      id\n      isBookmarked\n      bookmarkFolderIds\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetFolder($id: ID!, $first: Int, $after: String) {\n    folder(id: $id) {\n      id\n      name\n      spotCount\n      spots(first: $first, after: $after) {\n        edges {\n          node {\n            id\n            title\n            address\n            likeCount\n            isLiked\n            isBookmarked\n            images {\n              id\n              url\n              order\n            }\n            category {\n              id\n              name\n            }\n            user {\n              id\n              name\n              avatarUrl\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetFolder($id: ID!, $first: Int, $after: String) {\n    folder(id: $id) {\n      id\n      name\n      spotCount\n      spots(first: $first, after: $after) {\n        edges {\n          node {\n            id\n            title\n            address\n            likeCount\n            isLiked\n            isBookmarked\n            images {\n              id\n              url\n              order\n            }\n            category {\n              id\n              name\n            }\n            user {\n              id\n              name\n              avatarUrl\n            }\n          }\n          cursor\n        }\n        pageInfo {\n          hasNextPage\n          endCursor\n        }\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      isLiked\n      isBookmarked\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n        isFollowing\n        followersCount\n      }\n      attributeTags {\n        id\n        name\n      }\n      moodTags {\n        id\n        name\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      isLiked\n      isBookmarked\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n        isFollowing\n        followersCount\n      }\n      attributeTags {\n        id\n        name\n      }\n      moodTags {\n        id\n        name\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSpotsPage($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSpotsPage($first: Int, $after: String, $sort: SpotSortInput, $filter: SpotFilterInput) {\n    spots(first: $first, after: $after, sort: $sort, filter: $filter) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMe {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      followersCount\n      followingCount\n    }\n  }\n"): (typeof documents)["\n  query GetMe {\n    me {\n      id\n      name\n      email\n      avatarUrl\n      bio\n      followersCount\n      followingCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMySpots($first: Int, $after: String) {\n    mySpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetMySpots($first: Int, $after: String) {\n    mySpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetMyLikedSpots($first: Int, $after: String) {\n    myLikedSpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetMyLikedSpots($first: Int, $after: String) {\n    myLikedSpots(first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserProfile($id: ID!) {\n    user(id: $id) {\n      id\n      name\n      avatarUrl\n      bio\n      spotsCount\n      followersCount\n      followingCount\n      isFollowing\n    }\n  }\n"): (typeof documents)["\n  query GetUserProfile($id: ID!) {\n    user(id: $id) {\n      id\n      name\n      avatarUrl\n      bio\n      spotsCount\n      followersCount\n      followingCount\n      isFollowing\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserSpots($userId: ID!, $first: Int, $after: String) {\n    userSpots(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetUserSpots($userId: ID!, $first: Int, $after: String) {\n    userSpots(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          isLiked\n          isBookmarked\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {\n    userFollowers(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetUserFollowers($userId: ID!, $first: Int, $after: String) {\n    userFollowers(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetUserFollowing($userId: ID!, $first: Int, $after: String) {\n    userFollowing(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetUserFollowing($userId: ID!, $first: Int, $after: String) {\n    userFollowing(userId: $userId, first: $first, after: $after) {\n      edges {\n        node {\n          id\n          name\n          avatarUrl\n          bio\n          isFollowing\n          followersCount\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;