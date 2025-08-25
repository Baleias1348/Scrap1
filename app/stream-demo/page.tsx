import dynamic from 'next/dynamic';

const StreamChatDemo = dynamic(() => import('../components/StreamChatDemo'), { ssr: false });

export default function Page() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-8">
        <h1 className="text-2xl font-semibold mb-4">Demo de Streaming ARIA</h1>
        <p className="text-gray-600 mb-6">Prueba respuestas en tiempo real con selección automática de modelo.</p>
        <StreamChatDemo />
      </div>
    </main>
  );
}
