import { z } from "zod";
import { makePostEndpoint } from "../middleware/validation/makePostEndpoint.js";
import { IDENTITY_HEADER, OPENAI_MODEL, RESPONSE_FORMAT, openai } from "./index.js";
import tools from "./tools.js";
import {ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionToolMessageParam } from "openai/resources/index.js";
import { addMessage, addMessages, getMessages, getUserVisibleMessages } from "../util/messageStore.js";

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
        tools: Object.values(tools).map(val => val.definition),
    });
}

//check if all required arguments provided by openai api are present and are numbers
const validateArguments = (args: any, definition?: ChatCompletionTool) => {
    return undefined === Object.keys(definition?.function?.parameters?.['properties'] as any)
        ?.map(property => args[property])
        ?.find(value => value == null || typeof value !== 'number');
}

const processMessages = async (messages: ChatCompletionMessageParam[], response: any, identity: string) => {
    const completion = await makeApiRequest(messages);
    const chatResponse = completion.choices[0];
    if(!chatResponse){
        return response.status(500).send("Got no response from the bot");
    }
    addMessage(identity, chatResponse.message);
    if (chatResponse?.finish_reason === 'tool_calls') {
        const toolCalls: ChatCompletionToolMessageParam[] = chatResponse.message.tool_calls?.map(call => {
            let content: string;
            try {
                const choosenFunction = tools[call.function.name]?.fn;
                if (!choosenFunction) {
                    content = 'Failed to calculate - unknown function'
                } else {
                    const args = JSON.parse(call.function.arguments);
                    if (validateArguments(args, tools[call.function.name]?.definition)) {
                        console.log(`Running function ${call.function.name} with arguments ${JSON.stringify(args)}.`);
                        const result = choosenFunction(args);
                        content = isNaN(result) ? 'Unable to calculate for given arguments, change arguments and try again.' : result?.toString();
                    } else {
                        content = 'Failed to calculate due to incorrect arguments'
                    }

                }
            } catch (error) {
                console.error(error);
                content = 'Failed to calculate due to an error';
            }
            console.log(`Executing ${call.function.name}. Result: ${content}`);
            return ({
                role: 'tool',
                content: content,
                tool_call_id: call.id,
            })
        }) ?? [];
        addMessages(identity, toolCalls);
        processMessages(getMessages(identity) ?? [], response, identity)
    } else {
        console.log(chatResponse);
        
        return response.status(200).send(getUserVisibleMessages(identity));
    }
}

export const newMessage = makePostEndpoint(MessageHistory, async (request, response) => {
    const message = request.body;
    const identity = request.header(IDENTITY_HEADER);
    if (!identity) {
        return response.status(400).send(`Missing ${IDENTITY_HEADER} header.`)
    }
    addMessage(identity, message);
    const messages = getMessages(identity) ?? []; //TODO handle no messages
    processMessages(messages, response, identity);
});
