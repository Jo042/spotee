export type SpotImageFields = {
  id: string;
  url: string;
  order: number;
};

export type SpotNodeFields = {
  id: string;
  title: string;
  address: string;
  likeCount: number;
  createdAt: string;
  images: SpotImageFields[];
  category: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
};

export type GetSpotsResponse = {
  spots: {
    edges: {
      node: SpotNodeFields;
      cursor: string;
    }[];
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string | null;
    };
    totalCount: number;
  };
};

export type GetSpotsVariables = {
  first: number;
  after?: string;
};
