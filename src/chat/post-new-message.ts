import { z } from "zod";
import { makePostEndpoint } from "../middleware/validation/makePostEndpoint.js";
import { IDENTITY_HEADER, OPENAI_MODEL, RESPONSE_FORMAT, openai } from "./index.js";
import {ChatCompletionMessageParam } from "openai/resources/index.js";
import { addMessage, getMessages, getUserVisibleMessages } from "../util/messageStore.js";

const ChatCompletionRole = z.union([z.literal('user'), z.literal('system'), z.literal('assistant')]);
export type ChatCompletionRole = z.infer<typeof ChatCompletionRole>;

const MessageHistory = 
        z.object({
            role: ChatCompletionRole,
            content: z.string(),
        });
type MessageHistory = z.infer<typeof MessageHistory>;

const makeApiRequest = async (messages: ChatCompletionMessageParam[]) => {
    return await openai.chat.completions.create({
        messages,
        model: OPENAI_MODEL,
        response_format: RESPONSE_FORMAT,
    });
}

const processMessages = async (messages: ChatCompletionMessageParam[], response: any, identity: string) => {
    const completion = await makeApiRequest(messages);
    const chatResponse = completion.choices[0];
    console.log(chatResponse);
    if(!chatResponse){
        return response.status(500).send("Got no response from the bot");
    }
    addMessage(identity, chatResponse.message);
    return response.status(200).send(getUserVisibleMessages(identity));

}


export const newMessage = makePostEndpoint(MessageHistory, async (request, response) => {
    const message = request.body;
    console.log({
        message: message,
    });
    const identity = request.header(IDENTITY_HEADER);
    if (!identity) {
        return response.status(400).send(`Missing ${IDENTITY_HEADER} header.`)
    }
    addMessage(identity, message);
    const messages = getMessages(identity) ?? []; //TODO handle no messages
    return processMessages(messages, response, identity);
});
