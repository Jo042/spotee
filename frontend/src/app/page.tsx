export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50">
      
      {/* ヒーローセクション */}
      <section className="flex flex-col items-center justify-center py-20 px-4">
        
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Spotee
        </h1>
        
        <p className="text-xl text-gray-600 mb-8 text-center max-w-md">
          すべての人が、次の `行きたい場所` に出会えるサービス
        </p>
        
        <div className="flex gap-4">
          
          <button className="bg-primary-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-600 transition-colors">
            ログイン
          </button>
          
          <button className="border border-primary-500 text-primary-500 px-6 py-3 rounded-lg font-medium hover:bg-primary-50 transition-colors">
            新規登録
          </button>
        </div>
      </section>
    </main>
  );
}