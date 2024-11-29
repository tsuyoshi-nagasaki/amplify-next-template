// types.ts
type AuthState = {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: {
    displayName: string;
  } | null;
};

// page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import { Amplify } from "aws-amplify";
import { signInWithRedirect, signOut, getCurrentUser, fetchUserAttributes } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';

// Amplifyの設定
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    error: null,
    user: null
  });
  const [todos, setTodos] = useState<any[]>([]);

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

  const createTodo = async () => {
    const content = window.prompt("Todoの内容を入力してください");
    if (!content) return;

    try {
      await client.models.Todo.create({ content });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Todoの作成に失敗しました'
      }));
    }
  };

  if (authState.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <main className="p-4">
      {authState.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {authState.error}
        </div>
      )}

      {authState.isAuthenticated && authState.user ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">ようこそ、{authState.user.displayName}さん！</h1>
            <button
              onClick={handleSignOut}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              サインアウト
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">マイTodo</h2>
            <button
              onClick={createTodo}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              + 新規作成
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <button
            onClick={handleSignIn}
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
          >
            <span>Microsoftでサインイン</span>
          </button>
        </div>
      )}
    </main>
  );
}