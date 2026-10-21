import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { 
  testSupabaseConnection, 
  getSupabaseSQLScript 
} from '../services/supabase';
import { 
  Cloud, 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Check, 
  RefreshCw, 
  ExternalLink, 
  GitBranch, 
  Globe, 
  Key, 
  ShieldCheck, 
  Server
} from 'lucide-react';

export const SupabaseSettingsView: React.FC = () => {
  const { supabaseConfig, updateSupabaseConfig, syncWithSupabase, isSyncing } = useData();
  const { permissions } = useAuth();

  const [url, setUrl] = useState(supabaseConfig.url || '');
  const [anonKey, setAnonKey] = useState(supabaseConfig.anonKey || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSQL, setCopiedSQL] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const res = await testSupabaseConnection(url.trim(), anonKey.trim());
      setTestResult(res);
      if (res.success) {
        updateSupabaseConfig({
          url: url.trim(),
          anonKey: anonKey.trim(),
          isConnected: true
        });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || 'Connection failed' });
    } finally {
      setIsTesting(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig({
      url: url.trim(),
      anonKey: anonKey.trim()
    });
    alert('Supabase project configuration saved.');
  };

  const handleManualSync = async () => {
    setSyncMessage(null);
    const res = await syncWithSupabase();
    setSyncMessage(res.message);
  };

  const handleCopySQL = () => {
    const sql = getSupabaseSQLScript();
    navigator.clipboard.writeText(sql);
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight flex items-center gap-2">
          <Cloud className="w-6 h-6 text-emerald-400" />
          <span>Supabase Integration &amp; Cloud Deployment</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Synchronize budget and supplies data with Supabase PostgreSQL, and deploy to Vercel, Netlify, or GitHub
        </p>
      </div>

      {/* Connection Status Box */}
      <div className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
        supabaseConfig.isConnected
          ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
          : 'bg-slate-900 border-slate-800 text-slate-300'
      }`}>
        <div className="flex items-start sm:items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
            supabaseConfig.isConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
          }`}>
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="text-sm font-bold flex items-center gap-2">
              <span>Cloud Database Status:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                supabaseConfig.isConnected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {supabaseConfig.isConnected ? 'CONNECTED TO SUPABASE' : 'STANDALONE / LOCAL OFFLINE MODE'}
              </span>
            </div>
            <div className="text-xs text-slate-400 mt-0.5">
              {supabaseConfig.isConnected
                ? `Active URL: ${supabaseConfig.url} · Last synced: ${supabaseConfig.lastSync ? new Date(supabaseConfig.lastSync).toLocaleString() : 'Just now'}`
                : 'Currently running on encrypted browser storage. Configure your project below to sync with team cloud.'}
            </div>
          </div>
        </div>

        {supabaseConfig.isConnected && (
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer shrink-0 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync All Records Now</span>
          </button>
        )}
      </div>

      {syncMessage && (
        <div className="p-3 rounded-xl bg-blue-500/15 border border-blue-500/30 text-blue-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

      {/* Supabase Credentials Form */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Key className="w-4 h-4 text-blue-400" />
              <span>Supabase Project Credentials</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Found in your Supabase project dashboard under <strong>Settings &gt; API</strong>
            </div>
          </div>

          <a
            href="https://supabase.com/dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <span>Open Supabase</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project URL (e.g. https://xyzcompany.supabase.co)
            </label>
            <input
              type="url"
              placeholder="https://your-project.supabase.co"
              value={url}
              onChange={e => setUrl(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Project Anon / Public API Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={e => setAnonKey(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs outline-none focus:border-blue-500"
            />
          </div>

          {testResult && (
            <div className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
              testResult.success
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/15 border-rose-500/30 text-rose-300'
            }`}>
              {testResult.success ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{testResult.message}</span>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting || !url || !anonKey}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all cursor-pointer"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>

      {/* SQL Migration Script Copy Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Server className="w-4 h-4 text-purple-400" />
              <span>Supabase Database Schema (SQL Script)</span>
            </h2>
            <div className="text-xs text-slate-400 mt-0.5">
              Copy and execute this SQL query in your Supabase SQL Editor to provision all tables and security policies
            </div>
          </div>

          <button
            onClick={handleCopySQL}
            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
          >
            {copiedSQL ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSQL ? 'Copied to Clipboard!' : 'Copy SQL Script'}</span>
          </button>
        </div>

        <div className="relative">
          <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-[11px] leading-relaxed max-h-64 overflow-y-auto select-all">
            {getSupabaseSQLScript()}
          </pre>
        </div>
      </div>

      {/* Team Deployment & Hosting Guide */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-md space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
          <Globe className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Hosting Platform Deployment Guide (Vercel, Netlify &amp; GitHub)
            </h2>
            <div className="text-xs text-slate-400">
              Recommended instructions to allow your team to access this system from any device
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          
          {/* Step 1: GitHub */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 text-blue-400 font-bold flex items-center justify-center">
              1
            </div>
            <div className="font-bold text-white">Upload to GitHub</div>
            <div className="text-slate-400 leading-relaxed">
              Push this repository to your GitHub account (public or private):
              <div className="mt-2 p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300">
                git init<br/>
                git add .<br/>
                git commit -m &quot;Initial OACSAS System&quot;<br/>
                git push -u origin main
              </div>
            </div>
          </div>

          {/* Step 2: Vercel / Netlify */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 font-bold flex items-center justify-center">
              2
            </div>
            <div className="font-bold text-white">Connect to Vercel or Netlify</div>
            <div className="text-slate-400 leading-relaxed">
              Import the GitHub repo in Vercel or Netlify:
              <ul className="mt-2 space-y-1 list-disc list-inside text-slate-300">
                <li>Framework: <strong>Vite</strong></li>
                <li>Build Command: <strong>npm run build</strong></li>
                <li>Output Directory: <strong>dist</strong></li>
              </ul>
            </div>
          </div>

          {/* Step 3: Environment Variables */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center">
              3
            </div>
            <div className="font-bold text-white">Configure Environment Vars</div>
            <div className="text-slate-400 leading-relaxed">
              In Vercel or Netlify project settings, add:
              <div className="mt-2 p-2 rounded bg-slate-900 font-mono text-[10px] text-slate-300 space-y-1">
                <div>VITE_SUPABASE_URL=https://...</div>
                <div>VITE_SUPABASE_ANON_KEY=eyJ...</div>
              </div>
              <div className="mt-2 text-emerald-400 font-medium">
                Your team can now log in securely via your custom domain!
              </div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
