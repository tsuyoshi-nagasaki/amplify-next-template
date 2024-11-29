"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import { getCurrentUser, signInWithRedirect, signOut, fetchUserAttributes } from 'aws-amplify/auth';
import outputs from '@/amplify_outputs.json';

// Amplifyの設定は必要
Amplify.configure(outputs);

const client = generateClient<Schema>();

export default function App() {
  const [username, setUsername] = useState<string | null>(null);
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    checkUserAuthentication();
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setUsername(null);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  async function checkUserAuthentication() {
    try {
      const currentUser = await getCurrentUser();
      if (currentUser) {
        const attributes = await fetchUserAttributes();        
        const displayName = attributes.email || currentUser.username || currentUser.userId;
        setUsername(displayName);
        return true;
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      setUsername(null);
      return false;
    }
  }

  async function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      try {
        await client.models.Todo.create({
          content,
        });
      } catch (error) {
        console.error("Error creating todo:", error);
      }
    }
  }

  const handleMicrosoftSignIn = async () => {
    try {
      await signInWithRedirect({
        provider: { custom: "MicrosoftEntraIDSAML" }
      });
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  return (
    <main>
      {username ? (
        <div>
          <h1>Welcome, {username}!</h1>
          <h1>My Todos</h1>
          <button onClick={createTodo}>+ new</button>

          <div>
            🥳 App successfully hosted. Try creating a new todo.
            <br/>
            <button onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <button onClick={handleMicrosoftSignIn}>
          Sign in with Microsoft
        </button>
      )}
    </main>
  );
}