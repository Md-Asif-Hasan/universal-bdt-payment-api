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
    error: string | null;
  };
  environment: {
    projectId: string;
    nodeEnv: string;
    hasServiceAccount: boolean;
  };
}

export default function HealthPage() {
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    const interval = setInterval(fetchHealth, 5000);
    return () => clearInterval(interval);
  }, []);

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
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Health Check
          </h1>
          <p className="text-gray-400 text-lg">API health monitoring endpoint</p>
          <button
            onClick={fetchHealth}
            className="mt-6 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 font-semibold"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-400 px-6 py-4 rounded-xl mb-8 text-center backdrop-blur-sm">
            {error}
          </div>
        )}

        {health && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/10 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Overall Status</h2>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getStatusGradient(health.status)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold capitalize">{health.status}</span>
                </div>
                <p className="text-gray-400 text-center">Last updated: {new Date(health.timestamp).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/10 backdrop-blur-lg rounded-2xl p-6 border border-blue-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Uptime</h2>
              <div className="text-center">
                <div className="text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                  {health.uptime}
                </div>
                <p className="text-gray-400">Since deployment</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-500/20 to-amber-500/10 backdrop-blur-lg rounded-2xl p-6 border border-orange-500/30 shadow-xl">
              <h2 className="text-lg font-semibold mb-4 text-center text-gray-300">Firebase Connection</h2>
              <div className="flex flex-col items-center gap-4">
                <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${getStatusGradient(health.firebase.status)} flex items-center justify-center shadow-lg`}>
                  <span className="text-3xl font-bold capitalize">{health.firebase.status}</span>
                </div>
                <p className="text-gray-400 text-center">Latency: {health.firebase.latency}</p>
                {health.firebase.error && (
                  <p className="text-red-400 text-xs text-center mt-2">{health.firebase.error}</p>
                )}
              </div>
            </div>

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
                <div>
                  <div className="text-2xl font-bold text-purple-400">{health.environment.hasServiceAccount ? 'Yes' : 'No'}</div>
                  <div className="text-gray-400 text-sm">Service Account</div>
                </div>
              </div>
            </div>

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

        <div className="mt-8 text-center">
          <a href="/" className="inline-block px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-purple-500/25 font-semibold">
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}
