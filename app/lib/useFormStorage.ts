// app/lib/useFormStorage.ts
import { useState, useEffect } from "react";
import { FormData } from "./types";

const STORAGE_KEY = "ai-spend-audit-form";

const defaultFormData: FormData = {
  tools: [
    {
      id: "cursor",
      name: "cursor",
      enabled: false,
      plan: "Pro",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "copilot",
      name: "github-copilot",
      enabled: false,
      plan: "Individual",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "claude",
      name: "claude",
      enabled: false,
      plan: "Pro",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "chatgpt",
      name: "chatgpt",
      enabled: false,
      plan: "Plus",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "anthropic-api",
      name: "anthropic-api",
      enabled: false,
      plan: "API direct",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "openai-api",
      name: "openai-api",
      enabled: false,
      plan: "API direct",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "gemini",
      name: "gemini",
      enabled: false,
      plan: "Pro",
      monthlySpend: 0,
      seats: 1,
    },
    {
      id: "windsurf",
      name: "windsurf",
      enabled: false,
      plan: "Free",
      monthlySpend: 0,
      seats: 1,
    },
  ],
  teamSize: 1,
  primaryUseCase: "coding",
};

export function useFormStorage() {
  const [formData, setFormData] = useState<FormData>(defaultFormData);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setFormData(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse stored form", e);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    }
  }, [formData, isLoaded]);

  return { formData, setFormData, isLoaded };
}
