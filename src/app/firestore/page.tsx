'use client';

import { useState } from 'react';

export default function FirestorePage() {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [path, setPath] = useState('');
  const [collection, setCollection] = useState('');
  const [filterField, setFilterField] = useState('');
  const [filterValue, setFilterValue] = useState('');
  const [data, setData] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      let url = '/api/firestore';
      const params = new URLSearchParams();

      if (method === 'GET' || method === 'DELETE') {
        if (path) params.append('path', path);
        if (collection) params.append('collection', collection);
        if (filterField) params.append('filterField', filterField);
        if (filterValue) params.append('filterValue', filterValue);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer bridge-secret-2026-taka-jachai',
        },
        body: (method === 'POST' || method === 'PUT') ? JSON.stringify({
          path,
          data: data ? JSON.parse(data) : {},
        }) : undefined,
      });

      const responseData = await response.json();
      setResult(responseData);

      if (!response.ok) {
        setError(responseData.error || 'Request failed');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getMethodGradient = (m: string) => {
    switch (m) {
      case 'GET': return 'from-green-400 to-emerald-500';
      case 'POST': return 'from-yellow-400 to-amber-500';
      case 'PUT': return 'from-orange-400 to-red-500';
      case 'DELETE': return 'from-red-400 to-rose-500';
      default: return 'from-gray-400 to-gray-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Firestore API
          </h1>
          <p className="text-gray-400 text-lg">Test Firestore operations</p>
          <a href="/" className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 font-semibold">
            Back to Dashboard
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Request Form */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Make Request
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Method</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['GET', 'POST', 'PUT', 'DELETE'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setMethod(m)}
                      className={`px-4 py-2 rounded-xl font-bold transition-all ${
                        method === m
                          ? `bg-gradient-to-r ${getMethodGradient(m)} text-white shadow-lg`
                          : 'bg-white/10 text-gray-400 hover:bg-white/20'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Document Path</label>
                <input
                  type="text"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  placeholder="users/abc123"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Collection (for GET)</label>
                <input
                  type="text"
                  value={collection}
                  onChange={(e) => setCollection(e.target.value)}
                  placeholder="users"
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter Field</label>
                  <input
                    type="text"
                    value={filterField}
                    onChange={(e) => setFilterField(e.target.value)}
                    placeholder="email"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Filter Value</label>
                  <input
                    type="text"
                    value={filterValue}
                    onChange={(e) => setFilterValue(e.target.value)}
                    placeholder="test@example.com"
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500"
                  />
                </div>
              </div>

              {(method === 'POST' || method === 'PUT') && (
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Data (JSON)</label>
                  <textarea
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    placeholder='{"name": "John", "email": "john@example.com"}'
                    rows={4}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-gray-500 font-mono text-sm"
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Sending...' : 'Send Request'}
              </button>
            </div>
          </div>

          {/* Response */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
            <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              Response
            </h2>

            {error && (
              <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-4 backdrop-blur-sm">
                {error}
              </div>
            )}

            {result ? (
              <pre className="bg-black/30 p-4 rounded-xl overflow-x-auto text-sm text-green-400">
                {JSON.stringify(result, null, 2)}
              </pre>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No response yet
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
