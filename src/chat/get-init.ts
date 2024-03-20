import { z } from "zod";
import { makeGetEndpoint } from "../middleware/validation/makeGetEndpoint.js";
import { fileReader, parseFileReaderResponse } from "../util/fileReader.js";
import { OPENAI_MODEL, PROMPT_FILE_NAME, RESPONSE_FORMAT, openai } from "./index.js";

//TODO: Rework type inference of fileReader
export const init = makeGetEndpoint(z.any(), async (_request, response) => {
    let messages: string[] = []
    const promptFile = await fileReader(PROMPT_FILE_NAME);
    let jsonPrompt;

    if(RESPONSE_FORMAT.type === "json_object"){

        jsonPrompt = await fileReader('json-format-prompt.docx');
        if(parseFileReaderResponse(jsonPrompt)){
            messages.push(jsonPrompt.content);
        }
        else{
            return response.status(500).send({
                status: 500,
                message: jsonPrompt.error
            })
        }
    }

    if(parseFileReaderResponse(promptFile)){
        messages.push(promptFile.content);
    }
    else{
        return response.status(500).send({
            status: 500,
            message: promptFile.error
        })
    }
    

    const completion = await openai.chat.completions.create({
        messages: messages.map(message => ({role: "system", content: message})),
        model: OPENAI_MODEL,
        response_format: RESPONSE_FORMAT
    });
    console.log(completion.choices[0]?.message);
    return response
        .status(200)
        .send([
        {
            role: "system", 
            content: promptFile.content
        },
        {
            role: "system",
            content: jsonPrompt?.content !== undefined ? jsonPrompt.content : ""
        },
        {
            role: "assistant",
            content: "Hi, ich bin der virtuelle Assistent von Qonto und kann alles rund um Qonto und unsere Leistungen beantworten. Bitte fragen Sie mich etwas"
        }
    ]);
});