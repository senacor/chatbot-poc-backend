import { z } from "zod";
import { makePostEndpoint } from "../middleware/validation/makePostEndpoint.js";
import { OPENAI_MODEL, RESPONSE_FORMAT, openai } from "./index.js";

const ChatCompletionRole = z.union([z.literal('user'), z.literal('system'), z.literal('assistant')]);
export type ChatCompletionRole = z.infer<typeof ChatCompletionRole>;

const MessageHistory = z.object({
    messages: z.array(
        z.object({
            role: ChatCompletionRole,
            content: z.string(),
        })
    ).nonempty()
});
type MessageHistory = z.infer<typeof MessageHistory>;

export const newMessage = makePostEndpoint(MessageHistory, async (request, response) => {
    const messages = request.body.messages;
    const completion = await openai.chat.completions.create({
        messages,
        model: OPENAI_MODEL,
        response_format: RESPONSE_FORMAT
    });
    const chatResponse = completion.choices[0];
    if(!chatResponse){
        return response.status(500).send("Got no response from the bot");
    }
    console.log(chatResponse);
    return response.status(200).send(chatResponse.message);
});
