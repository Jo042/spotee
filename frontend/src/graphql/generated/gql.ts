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
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetCategoriesDocument,
    "\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n": typeof types.CreateSpotDocument,
    "\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n": typeof types.UpdateSpotDocument,
    "\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n": typeof types.DeleteSpotDocument,
    "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n      }\n    }\n  }\n": typeof types.GetSpotDocument,
    "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput) {\n    spots(first: $first, after: $after, sort: $sort) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": typeof types.GetSpotsDocument,
    "\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetAttributeTagsDocument,
    "\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetMoodTagsDocument,
    "\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": typeof types.GetAllTagsDocument,
};
const documents: Documents = {
    "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n": types.GetCategoriesDocument,
    "\n  mutation CreateSpot($input: CreateSpotInput!) {\n    createSpot(input: $input) {\n      id\n      title\n    }\n  }\n": types.CreateSpotDocument,
    "\n  mutation UpdateSpot($id: ID!, $input: UpdateSpotInput!) {\n    updateSpot(id: $id, input: $input) {\n      id\n      title\n    }\n  }\n": types.UpdateSpotDocument,
    "\n  mutation DeleteSpot($id: ID!) {\n    deleteSpot(id: $id)\n  }\n": types.DeleteSpotDocument,
    "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n      }\n    }\n  }\n": types.GetSpotDocument,
    "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput) {\n    spots(first: $first, after: $after, sort: $sort) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n": types.GetSpotsDocument,
    "\n  query GetAttributeTags {\n    attributeTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetAttributeTagsDocument,
    "\n  query GetMoodTags {\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetMoodTagsDocument,
    "\n  query GetAllTags {\n    categories {\n      id\n      name\n      slug\n    }\n    attributeTags {\n      id\n      name\n      slug\n    }\n    moodTags {\n      id\n      name\n      slug\n    }\n  }\n": types.GetAllTagsDocument,
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
export function gql(source: "\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n"): (typeof documents)["\n  query GetCategories {\n    categories {\n      id\n      name\n      slug\n    }\n  }\n"];
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
export function gql(source: "\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n      }\n    }\n  }\n"): (typeof documents)["\n  query GetSpot($id: ID!) {\n    spot(id: $id) {\n      id\n      title\n      description\n      address\n      priceRange\n      businessHours\n      likeCount\n      createdAt\n      images {\n        id\n        url\n        order\n      }\n      category {\n        id\n        name\n      }\n      user {\n        id\n        name\n        avatarUrl\n      }\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput) {\n    spots(first: $first, after: $after, sort: $sort) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"): (typeof documents)["\n  query GetSpots($first: Int, $after: String, $sort: SpotSortInput) {\n    spots(first: $first, after: $after, sort: $sort) {\n      edges {\n        node {\n          id\n          title\n          address\n          likeCount\n          createdAt\n          images {\n            id\n            url\n            order\n          }\n          category {\n            id\n            name\n          }\n          user {\n            id\n            name\n            avatarUrl\n          }\n        }\n        cursor\n      }\n      pageInfo {\n        hasNextPage\n        endCursor\n      }\n      totalCount\n    }\n  }\n"];
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

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;