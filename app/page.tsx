"use client";

import React, { useState, useEffect } from "react";
import { Amplify } from "aws-amplify";
import { signInWithRedirect, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';
import { post } from 'aws-amplify/api';

Amplify.configure(outputs);

type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    displayName: string;
  } | null;
};

type AccountResult = {
  account_number: string;
  obic_id: string;
  assigned_at: string;
} | null;

type ApiResponse = {
  error?: string;
  account_number?: string;
  obic_id?: string;
  assigned_at?: string;
};

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  });
  const [obicId, setObicId] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AccountResult>(null);
  const [accountError, setAccountError] = useState<string | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const attributes = await fetchUserAttributes();
        setAuthState({
          isAuthenticated: true,
          isLoading: false,
          error: null,
          user: {
            displayName: attributes.email || currentUser.username || currentUser.userId
          }
        });
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          error: null,
          user: null
        });
      }
    } catch (error) {
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '認証に失敗しました',
        user: null
      });
    }
  };

  const handleSignIn = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await signInWithRedirect({
        provider: { custom: "MicrosoftEntraIDSAML" }
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'サインインに失敗しました'
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
      await signOut();
      setAuthState({
        isAuthenticated: false,
        isLoading: false,
        error: null,
        user: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'サインアウトに失敗しました'
      }));
    }
  };

  const handleAssignment = async () => {
    if (!obicId) {
      setAccountError('代理店IDを入力してください');
      return;
    }
    setLoading(true);
    setAccountError(null);
    setResult(null);
  
    try {
      const restOperation = await post({
        apiName: 'myRestApi',
        path: 'items',
        options: {
          body: {
            message: 'Mow the lawn'
          }
        }
      });
      
      const { body } = await restOperation.response;
      const data: ApiResponse = await body.json();
      
      if (data.error) {
        setAccountError(data.error);
      } else if (data.account_number && data.obic_id && data.assigned_at) {
        setResult({
          account_number: data.account_number,
          obic_id: data.obic_id,
          assigned_at: data.assigned_at
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (err: any) {
      console.error('API Error Details:', {
        message: err.message,
        name: err.name,
        stack: err.stack
      });
      setAccountError(err.message || 'システムエラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!authState.isAuthenticated || !authState.user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-white rounded-lg p-6 shadow-sm w-full max-w-md">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">バーチャル口座管理システム</h1>
          <button
            onClick={handleSignIn}
            className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 
                     transition-colors duration-200 font-medium"
          >
            Microsoftでサインイン
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <nav className="bg-white border-b">
        <div className="max-w-5xl mx-auto px-4 py-2 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-600">ようこそ</p>
            <p className="text-sm font-medium">{authState.user.displayName}</p>
          </div>
          <button
            onClick={handleSignOut}
            className="px-3 py-1.5 bg-gray-50 text-gray-700 text-sm rounded hover:bg-gray-100"
          >
            サインアウト
          </button>
        </div>
      </nav>

      {/* メインコンテンツ */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg p-6 shadow-sm mb-4">
          <h1 className="text-xl font-bold mb-2">バーチャル口座管理</h1>
          <p className="text-sm text-gray-600 mb-4">代理店IDを入力して口座を払い出します</p>
          
          <div className="flex gap-2">
            <input
              type="text"
              value={obicId}
              onChange={(e) => setObicId(e.target.value)}
              placeholder="代理店ID（例：1000123456）"
              className="flex-1 px-3 py-1.5 border rounded text-sm"
              disabled={loading}
            />
            <button
              onClick={handleAssignment}
              disabled={loading}
              className="px-4 py-1.5 bg-blue-500 text-white text-sm rounded hover:bg-blue-600
                       disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "処理中..." : "払い出し"}
            </button>
          </div>

          {accountError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <p className="font-medium">エラー</p>
              <p>{accountError}</p>
            </div>
          )}

          {result && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded">
              <h3 className="text-sm font-bold text-green-800 mb-3">口座払い出し完了</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="text-gray-600">バーチャル口座番号</div>
                <div className="font-mono font-medium">{result.account_number}</div>
                <div className="text-gray-600">代理店ID</div>
                <div className="font-mono font-medium">{result.obic_id}</div>
                <div className="text-gray-600">処理日時</div>
                <div>{new Date(result.assigned_at).toLocaleString('ja-JP')}</div>
              </div>
            </div>
          )}
        </div>

        {/* 注意事項 */}
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-bold mb-3">注意事項</h2>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex gap-2">
              <span>•</span>
              <span>口座番号の払い出しは取り消しできません</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>システムエラーが発生した場合は管理者に連絡してください</span>
            </li>
            <li className="flex gap-2">
              <span>•</span>
              <span>払い出された口座情報は確実にOBIC7代理店画面に入力してください</span>
            </li>
          </ul>
        </div>
      </main>
    </div>
  );
}