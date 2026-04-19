/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = T | null | undefined;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  /** A date-time string at UTC, such as 2019-12-03T09:54:33Z, compliant with the date-time format. */
  DateTime: { input: any; output: any; }
};

export type AttributeTag = {
  __typename?: 'AttributeTag';
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Category = {
  __typename?: 'Category';
  createdAt: Scalars['DateTime']['output'];
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type CreateSpotInput = {
  address: Scalars['String']['input'];
  attributeTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  businessHours?: InputMaybe<Scalars['String']['input']>;
  categoryId: Scalars['ID']['input'];
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrls: Array<Scalars['String']['input']>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  moodTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  priceRange?: InputMaybe<PriceRange>;
  title: Scalars['String']['input'];
};

export type MoodTag = {
  __typename?: 'MoodTag';
  displayOrder: Scalars['Int']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  slug: Scalars['String']['output'];
};

export type Mutation = {
  __typename?: 'Mutation';
  createSpot: Spot;
  deleteSpot: Scalars['Boolean']['output'];
  updateProfile: User;
  updateSpot: Spot;
};


export type MutationCreateSpotArgs = {
  input: CreateSpotInput;
};


export type MutationDeleteSpotArgs = {
  id: Scalars['ID']['input'];
};


export type MutationUpdateProfileArgs = {
  avatarUrl?: InputMaybe<Scalars['String']['input']>;
  bio?: InputMaybe<Scalars['String']['input']>;
  name?: InputMaybe<Scalars['String']['input']>;
};


export type MutationUpdateSpotArgs = {
  id: Scalars['ID']['input'];
  input: UpdateSpotInput;
};

export type PageInfo = {
  __typename?: 'PageInfo';
  endCursor?: Maybe<Scalars['String']['output']>;
  hasNextPage: Scalars['Boolean']['output'];
  hasPreviousPage: Scalars['Boolean']['output'];
  startCursor?: Maybe<Scalars['String']['output']>;
};

/** 価格帯 */
export enum PriceRange {
  /** 5,000円~ */
  Over_5000 = 'OVER_5000',
  /** 1,000~3,000円 */
  Range_1000_3000 = 'RANGE_1000_3000',
  /** 3,000~5,000円 */
  Range_3000_5000 = 'RANGE_3000_5000',
  /** ~1,000円 */
  Under_1000 = 'UNDER_1000'
}

export type Query = {
  __typename?: 'Query';
  attributeTags: Array<AttributeTag>;
  categories: Array<Category>;
  category?: Maybe<Category>;
  me: User;
  moodTags: Array<MoodTag>;
  spot?: Maybe<Spot>;
  spots: SpotConnection;
  user?: Maybe<User>;
  whoAmI: Scalars['String']['output'];
};


export type QueryCategoryArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpotArgs = {
  id: Scalars['ID']['input'];
};


export type QuerySpotsArgs = {
  after?: InputMaybe<Scalars['String']['input']>;
  filter?: InputMaybe<SpotFilterInput>;
  first?: InputMaybe<Scalars['Int']['input']>;
  sort?: InputMaybe<SpotSortInput>;
};


export type QueryUserArgs = {
  id: Scalars['String']['input'];
};

/** ソート順序 */
export enum SortOrder {
  Asc = 'ASC',
  Desc = 'DESC'
}

export type Spot = {
  __typename?: 'Spot';
  address: Scalars['String']['output'];
  businessHours?: Maybe<Scalars['String']['output']>;
  category: Category;
  createdAt: Scalars['DateTime']['output'];
  description?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  images: Array<SpotImage>;
  latitude?: Maybe<Scalars['Float']['output']>;
  likeCount: Scalars['Int']['output'];
  longitude?: Maybe<Scalars['Float']['output']>;
  priceRange?: Maybe<PriceRange>;
  title: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
  user: User;
};

export type SpotConnection = {
  __typename?: 'SpotConnection';
  edges: Array<SpotEdge>;
  pageInfo: PageInfo;
  totalCount: Scalars['Int']['output'];
};

export type SpotEdge = {
  __typename?: 'SpotEdge';
  cursor: Scalars['String']['output'];
  node: Spot;
};

export type SpotFilterInput = {
  attributeTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  categoryIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  keyword?: InputMaybe<Scalars['String']['input']>;
  moodTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  tagSearchMode?: InputMaybe<TagSearchMode>;
};

export type SpotImage = {
  __typename?: 'SpotImage';
  id: Scalars['ID']['output'];
  order: Scalars['Int']['output'];
  url: Scalars['String']['output'];
};

/** スポットのソート対象 */
export enum SpotSortBy {
  CreatedAt = 'CREATED_AT',
  LikeCount = 'LIKE_COUNT',
  Title = 'TITLE'
}

export type SpotSortInput = {
  order?: SortOrder;
  sortBy?: SpotSortBy;
};

/** タグ検索モード: AND=全タグ一致, OR=いずれか一致 */
export enum TagSearchMode {
  /** すべてのタグを含むスポットを返す */
  And = 'AND',
  /** いずれかのタグを含むスポットを返す */
  Or = 'OR'
}

export type UpdateSpotInput = {
  address?: InputMaybe<Scalars['String']['input']>;
  attributeTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  businessHours?: InputMaybe<Scalars['String']['input']>;
  categoryId?: InputMaybe<Scalars['ID']['input']>;
  description?: InputMaybe<Scalars['String']['input']>;
  imageUrls?: InputMaybe<Array<Scalars['String']['input']>>;
  latitude?: InputMaybe<Scalars['Float']['input']>;
  longitude?: InputMaybe<Scalars['Float']['input']>;
  moodTagIds?: InputMaybe<Array<Scalars['ID']['input']>>;
  priceRange?: InputMaybe<PriceRange>;
  title?: InputMaybe<Scalars['String']['input']>;
};

export type User = {
  __typename?: 'User';
  avatarUrl?: Maybe<Scalars['String']['output']>;
  bio?: Maybe<Scalars['String']['output']>;
  createdAt: Scalars['DateTime']['output'];
  email: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  updatedAt: Scalars['DateTime']['output'];
};

export type GetCategoriesQueryVariables = Exact<{ [key: string]: never; }>;


export type GetCategoriesQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string }> };

export type CreateSpotMutationVariables = Exact<{
  input: CreateSpotInput;
}>;


export type CreateSpotMutation = { __typename?: 'Mutation', createSpot: { __typename?: 'Spot', id: string, title: string } };

export type UpdateSpotMutationVariables = Exact<{
  id: Scalars['ID']['input'];
  input: UpdateSpotInput;
}>;


export type UpdateSpotMutation = { __typename?: 'Mutation', updateSpot: { __typename?: 'Spot', id: string, title: string } };

export type DeleteSpotMutationVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type DeleteSpotMutation = { __typename?: 'Mutation', deleteSpot: boolean };

export type GetSpotQueryVariables = Exact<{
  id: Scalars['ID']['input'];
}>;


export type GetSpotQuery = { __typename?: 'Query', spot?: { __typename?: 'Spot', id: string, title: string, description?: string | null, address: string, priceRange?: PriceRange | null, businessHours?: string | null, likeCount: number, createdAt: any, images: Array<{ __typename?: 'SpotImage', id: string, url: string, order: number }>, category: { __typename?: 'Category', id: string, name: string }, user: { __typename?: 'User', id: string, name: string, avatarUrl?: string | null } } | null };

export type GetSpotsQueryVariables = Exact<{
  first?: InputMaybe<Scalars['Int']['input']>;
  after?: InputMaybe<Scalars['String']['input']>;
  sort?: InputMaybe<SpotSortInput>;
  filter?: InputMaybe<SpotFilterInput>;
}>;


export type GetSpotsQuery = { __typename?: 'Query', spots: { __typename?: 'SpotConnection', totalCount: number, edges: Array<{ __typename?: 'SpotEdge', cursor: string, node: { __typename?: 'Spot', id: string, title: string, address: string, likeCount: number, createdAt: any, images: Array<{ __typename?: 'SpotImage', id: string, url: string, order: number }>, category: { __typename?: 'Category', id: string, name: string }, user: { __typename?: 'User', id: string, name: string, avatarUrl?: string | null } } }>, pageInfo: { __typename?: 'PageInfo', hasNextPage: boolean, endCursor?: string | null } } };

export type GetAttributeTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAttributeTagsQuery = { __typename?: 'Query', attributeTags: Array<{ __typename?: 'AttributeTag', id: string, name: string, slug: string }> };

export type GetMoodTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMoodTagsQuery = { __typename?: 'Query', moodTags: Array<{ __typename?: 'MoodTag', id: string, name: string, slug: string }> };

export type GetAllTagsQueryVariables = Exact<{ [key: string]: never; }>;


export type GetAllTagsQuery = { __typename?: 'Query', categories: Array<{ __typename?: 'Category', id: string, name: string, slug: string }>, attributeTags: Array<{ __typename?: 'AttributeTag', id: string, name: string, slug: string }>, moodTags: Array<{ __typename?: 'MoodTag', id: string, name: string, slug: string }> };


export const GetCategoriesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetCategories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<GetCategoriesQuery, GetCategoriesQueryVariables>;
export const CreateSpotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateSpot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"CreateSpotInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createSpot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<CreateSpotMutation, CreateSpotMutationVariables>;
export const UpdateSpotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateSpot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"input"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"UpdateSpotInput"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateSpot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"input"},"value":{"kind":"Variable","name":{"kind":"Name","value":"input"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}}]}}]}}]} as unknown as DocumentNode<UpdateSpotMutation, UpdateSpotMutationVariables>;
export const DeleteSpotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteSpot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteSpot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}]}]}}]} as unknown as DocumentNode<DeleteSpotMutation, DeleteSpotMutationVariables>;
export const GetSpotDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSpot"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"ID"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spot"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"description"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"priceRange"}},{"kind":"Field","name":{"kind":"Name","value":"businessHours"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}}]}}]} as unknown as DocumentNode<GetSpotQuery, GetSpotQueryVariables>;
export const GetSpotsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetSpots"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"first"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"Int"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"after"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"sort"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SpotSortInput"}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"filter"}},"type":{"kind":"NamedType","name":{"kind":"Name","value":"SpotFilterInput"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"spots"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"first"},"value":{"kind":"Variable","name":{"kind":"Name","value":"first"}}},{"kind":"Argument","name":{"kind":"Name","value":"after"},"value":{"kind":"Variable","name":{"kind":"Name","value":"after"}}},{"kind":"Argument","name":{"kind":"Name","value":"sort"},"value":{"kind":"Variable","name":{"kind":"Name","value":"sort"}}},{"kind":"Argument","name":{"kind":"Name","value":"filter"},"value":{"kind":"Variable","name":{"kind":"Name","value":"filter"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"edges"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"node"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"title"}},{"kind":"Field","name":{"kind":"Name","value":"address"}},{"kind":"Field","name":{"kind":"Name","value":"likeCount"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"images"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"url"}},{"kind":"Field","name":{"kind":"Name","value":"order"}}]}},{"kind":"Field","name":{"kind":"Name","value":"category"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}}]}},{"kind":"Field","name":{"kind":"Name","value":"user"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"avatarUrl"}}]}}]}},{"kind":"Field","name":{"kind":"Name","value":"cursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"pageInfo"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"hasNextPage"}},{"kind":"Field","name":{"kind":"Name","value":"endCursor"}}]}},{"kind":"Field","name":{"kind":"Name","value":"totalCount"}}]}}]}}]} as unknown as DocumentNode<GetSpotsQuery, GetSpotsQueryVariables>;
export const GetAttributeTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAttributeTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"attributeTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<GetAttributeTagsQuery, GetAttributeTagsQueryVariables>;
export const GetMoodTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMoodTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"moodTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<GetMoodTagsQuery, GetMoodTagsQueryVariables>;
export const GetAllTagsDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetAllTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"categories"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"attributeTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}},{"kind":"Field","name":{"kind":"Name","value":"moodTags"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"slug"}}]}}]}}]} as unknown as DocumentNode<GetAllTagsQuery, GetAllTagsQueryVariables>;