import { z } from "zod";
import { makePostEndpoint } from "../middleware/validation/makePostEndpoint.js";
import { OPENAI_MODEL, RESPONSE_FORMAT, openai } from "./index.js";
import tools from "./tools.js";
import {ChatCompletionMessageParam, ChatCompletionTool, ChatCompletionToolMessageParam } from "openai/resources/index.js";

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

const processMessages = async (messages: ChatCompletionMessageParam[], response: any) => {
    const completion = await makeApiRequest(messages);
    const chatResponse = completion.choices[0];
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
        const msgs = messages.concat([chatResponse.message, ...toolCalls]);
        processMessages(msgs, response)
    } else {
        //console.log(chatResponse);
        if(!chatResponse){
            return response.status(500).send("Got no response from the bot");
        }
        return response.status(200).send(chatResponse.message);
    }
}

export const newMessage = makePostEndpoint(MessageHistory, async (request, response) => {
    const messages = request.body.messages;
    processMessages(messages, response);
});
