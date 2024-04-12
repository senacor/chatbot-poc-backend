import express from "express";
import "dotenv/config";
import OpenAI from "openai";
import { ChatCompletionCreateParams, ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.js";
import { newMessage } from "./post-new-message.js";
import fileUpload from "./upload-file.js";

/**
 * Change the prompt file, the model or the response format here
 */
const OPENAI_MODEL: ChatCompletionCreateParamsBase["model"] = "gpt-4-turbo";
const RESPONSE_FORMAT: ChatCompletionCreateParams.ResponseFormat = {type: "text"};
const IDENTITY_HEADER = 'X-Identity';

const chatRouter = express.Router();
const openai = new OpenAI();

chatRouter.post('/newMessage', newMessage);
chatRouter.post('/fileUpload', fileUpload)

export { 
    OPENAI_MODEL,
    RESPONSE_FORMAT,
    IDENTITY_HEADER,
    chatRouter,
    openai,
}
