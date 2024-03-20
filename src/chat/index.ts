import express, { Request, Response} from "express";
import "dotenv/config";
import OpenAI from "openai";
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.js";
import { fileReader, hasErrors } from "../util/fileReader.js";

const PROMPT_FILE_NAME = "Chatbot Qonto.docx"
const OPENAI_MODEL: ChatCompletionCreateParamsBase["model"] = "gpt-3.5-turbo";

export const chatRouter = express.Router();

export const openai = new OpenAI();


chatRouter.post('/newMessage', async (request: Request, response: Response) => {
    const messages = request.body.messages;
    const completion = await openai.chat.completions.create({
        messages: messages,
        model: OPENAI_MODEL,
    });
    const choice = completion.choices[0];
    if(choice === undefined){
        response.status(500).send({
            status: 500,
            message: "Expected an answer from the bot but got none."
        })
    }
    else{
        response.status(200).send(choice.message);
    }
});

chatRouter.get('/init', async (_request: Request, response: Response) => {
    const fileContent = await fileReader(PROMPT_FILE_NAME);
    if(hasErrors(fileContent)){
        console.log(fileContent.error.stack);
        response.status(500).json({
            status: 500,
            message: 'Something went wrong'
        });
    }
    else{
        await openai.chat.completions.create({
            messages: [{role: "system", content: fileContent.data}],
            model: OPENAI_MODEL,
        });
        response.status(200).send([
            {
                role: "system", 
                content: fileContent.data
            },
            {
                role: "assistant",
                content: "Hi, ich bin der virtuelle Assistent von Qonto und kann alles rund um Qonto und unsere Leistungen beantworten. Bitte fragen Sie mich etwas"
            }
        ]);
    }
});

