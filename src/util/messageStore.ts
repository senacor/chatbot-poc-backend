import { ChatCompletionMessageParam } from "openai/resources";
import TTLCache from '@isaacs/ttlcache';

const sessionStore = new TTLCache<string, ChatCompletionMessageParam[]>({ max: 10000, ttl: 50 * 60 * 1000 });

export const addMessage = (key: string, message: ChatCompletionMessageParam) => {
    const value = sessionStore.get(key) ?? [];
    sessionStore.set(key, [...value, message]);
}

export const addMessages = (key: string, messages: ChatCompletionMessageParam[]) => {
    const value = sessionStore.get(key) ?? [];
    sessionStore.set(key, value.concat(messages));
}

export const getMessages = (key: string) => {
    return sessionStore.get(key);
}

export const getUserVisibleMessages = (key: string) => {
    return getMessages(key)?.filter(message => message.role === 'user' || message.role === 'assistant' && !message.tool_calls);
}