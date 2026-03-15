"use client";

import { useQuery } from "@apollo/client/react";
import { gql } from "@apollo/client";

const GET_CATEGORIES = gql`
  query GetCategories {
    categories {
      id
      name
      slug
    }
  }
`;

type Category = {
  id: string;
  name: string;
  slug: string;
};

type GetCategoriesData = {
  categories: Category[];
};

export default function Home() {
  const { loading, error, data } = useQuery<GetCategoriesData>(GET_CATEGORIES);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* ヒーローセクション */}
      <section className="flex flex-col items-center justify-center py-20 px-4">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Spotee</h1>

        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          すべての人が、次の `行きたい場所` に出会えるサービス
        </p>

        <div className="w-full max-w-md">
          <h2 className="text-lg font-semibold mb-4">カテゴリ一覧</h2>

          {loading && <p className="text-gray-500">読み込み中...</p>}

          {error && <p className="text-red-500">エラー: {error.message}</p>}

          {data && (
            <ul className="space-y-2">
              {data.categories.map((category) => (
                <li
                  key={category.id}
                  className="bg-white p-3 rounded-lg shadow-sm"
                >
                  {category.name}
                  <span className="text-gray-400 text-sm ml-2">
                    ({category.slug})
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
