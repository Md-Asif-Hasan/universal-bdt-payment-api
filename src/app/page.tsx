'use client';

import { useEffect, useState } from 'react';

export const dynamic = 'force-dynamic';

interface HealthData {
  status: string;
  timestamp: string;
  uptime: string;
  metrics: {
    requestCount: number;
    lastRequestTime: string | null;
    errors: number;
    lastErrorTime: string | null;
  };
  firebase: {
    status: string;
    latency: string;
  };
  environment: {
    projectId: string;
    nodeEnv: string;
  };
}

export default function Dashboard() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchHealth = async () => {
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch health data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    
    if (autoRefresh) {
      const interval = setInterval(fetchHealth, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return 'from-green-400 to-emerald-600';
      case 'error':
        return 'from-red-400 to-rose-600';
      default:
        return 'from-yellow-400 to-amber-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'healthy':
      case 'ok':
        return 'bg-green-500/20 border-green-500/30';
      case 'error':
        return 'bg-red-500/20 border-red-500/30';
      default:
        return 'bg-yellow-500/20 border-yellow-500/30';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Taka Jachai API Monitor
          </h1>
          <p className="text-gray-400 text-lg">Real-time health monitoring dashboard</p>
          
          <div className="flex justify-center items-center gap-4 mt-6">
            <button
              onClick={fetchHealth}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 font-semibold"
            >
              Refresh
            </button>
            <label className="flex items-center gap-2 cursor-pointer bg-white/10 px-4 py-3 rounded-xl backdrop-blur-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="w-5 h-5 rounded accent-purple-500"
              />
              <span className="font-medium">Auto-refresh (5s)</span>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-8 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Status Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Overall Status</h2>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getStatusGradient(health.status)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold capitalize">{health.status}</span>
                </div>
                <p className="text-gray-400 text-center">Last updated: {new Date(health.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Uptime Card */}
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Uptime</h2>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {health.uptime}
                </div>
                <p className="text-gray-400">Since deployment</p>
              </div>
            </div>

            {/* Firebase Status */}
            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Firebase Connection</h2>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getStatusGradient(health.firebase.status)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold capitalize">{health.firebase.status}</span>
                </div>
                <p className="text-gray-400 text-center">Latency: {health.firebase.latency}</p>
              </div>
            </div>

            {/* Request Metrics */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/10 backdrop-blur-lg rounded-2xl p-6 border border-green-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Request Metrics</h2>
              <div className="space-y-4 text-center">
                <div>
                  <div className="text-4xl font-bold text-green-400">{health.metrics.requestCount}</div>
                  <div className="text-gray-400 text-sm">Total Requests</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-red-400">{health.metrics.errors}</div>
                  <div className="text-gray-400 text-sm">Errors</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-emerald-400">
                    {health.metrics.requestCount > 0
                      ? ((health.metrics.requestCount - health.metrics.errors) / health.metrics.requestCount * 100).toFixed(1)
                      : '100'}%
                  </div>
                  <div className="text-gray-400 text-sm">Success Rate</div>
                </div>
              </div>
            </div>

            {/* Environment */}
            <div className="bg-gradient-to-br from-purple-500/20 to-violet-500/10 backdrop-blur-lg rounded-2xl p-6 border border-purple-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Environment</h2>
              <div className="space-y-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-400 font-mono">{health.environment.projectId}</div>
                  <div className="text-gray-400 text-sm">Project ID</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-violet-400 capitalize">{health.environment.nodeEnv}</div>
                  <div className="text-gray-400 text-sm">Environment</div>
                </div>
              </div>
            </div>

            {/* Last Activity */}
            <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/10 backdrop-blur-lg rounded-2xl p-6 border border-pink-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Last Activity</h2>
              <div className="space-y-4 text-center">
                <div>
                  <div className="text-lg font-bold text-pink-400">
                    {health.metrics.lastRequestTime
                      ? new Date(health.metrics.lastRequestTime).toLocaleString()
                      : 'Never'}
                  </div>
                  <div className="text-gray-400 text-sm">Last Request</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-rose-400">
                    {health.metrics.lastErrorTime
                      ? new Date(health.metrics.lastErrorTime).toLocaleString()
                      : 'None'}
                  </div>
                  <div className="text-gray-400 text-sm">Last Error</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoints Info */}
        <div className="mt-8 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 shadow-xl">
          <h2 className="text-2xl font-semibold mb-6 text-center bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            API Endpoints
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a href="/health" className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center hover:bg-green-500/20 transition-all cursor-pointer">
              <span className="inline-block bg-gradient-to-r from-green-400 to-emerald-500 text-white px-3 py-1 rounded-lg text-sm font-bold mb-2">GET</span>
              <code className="text-gray-300 block text-lg">/api/health</code>
              <span className="text-gray-400 text-sm">Health check →</span>
            </a>
            <a href="/firestore" className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6 text-center hover:bg-blue-500/20 transition-all cursor-pointer">
              <span className="inline-block bg-gradient-to-r from-blue-400 to-cyan-500 text-white px-3 py-1 rounded-lg text-sm font-bold mb-2">CRUD</span>
              <code className="text-gray-300 block text-lg">/api/firestore</code>
              <span className="text-gray-400 text-sm">Firestore operations →</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
