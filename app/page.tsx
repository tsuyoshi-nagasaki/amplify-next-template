"use client";

import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import config from "@/amplify/config.js";

// Amplifyの設定は必要
Amplify.configure(config);

const client = generateClient<Schema>();

export default function App() {
  return (
    <Authenticator>
      {({ signOut }) => (
        <main>
          <h1>My todos</h1>
          <TodoList />
          <button onClick={signOut}>Sign out</button>
        </main>
      )}
    </Authenticator>
  );
}

function TodoList() {
  const [todos, setTodos] = useState<Array<Schema["Todo"]["type"]>>([]);

  useEffect(() => {
    client.models.Todo.observeQuery().subscribe({
      next: ({ items }) => setTodos([...items]),
    });
  }, []);

  async function createTodo() {
    const content = window.prompt("Todo content");
    if (content) {
      await client.models.Todo.create({
        content,
      });
    }
  }

  return (
    <>
      <button onClick={createTodo}>+ new</button>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id}>{todo.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new todo.
        <br />
        <a href="https://docs.amplify.aws/nextjs/start/quickstart/nextjs-app-router-client-components/">
          Review next steps of this tutorial.
        </a>
      </div>
    </>
  );
}