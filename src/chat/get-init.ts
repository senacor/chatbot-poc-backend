import { z } from "zod";
import { makeGetEndpoint } from "../middleware/validation/makeGetEndpoint.js";
import { fileReader, parseFileReaderResponse } from "../util/fileReader.js";
import { IDENTITY_HEADER, OPENAI_MODEL, PROMPT_FILE_NAME, RESPONSE_FORMAT, openai } from "./index.js";
import { addMessages, getMessages, getUserVisibleMessages } from "../util/messageStore.js";

//TODO: Rework type inference of fileReader
export const init = makeGetEndpoint(z.any(), async (_request, response) => {
    const identity = _request.header(IDENTITY_HEADER);
    if (!identity) {
        return response.status(400).send(`Missing ${IDENTITY_HEADER} header.`)
    }
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
    addMessages(identity, [
        {
            role: "system", 
            content: promptFile.content
        },
        {
            role: "system",
            content: jsonPrompt?.content !== undefined ? jsonPrompt.content : ""
        },
        {
            role: 'system',
            content: "Don't make assumptions about what values to plug into functions. Ask for clarification if a user request is ambiguous. Do not call functions until all arguments are provided by the user. Include all arguments in the response."
        },
        {
            role: "assistant",
            content: "Hallo! Als virtueller Assistent beantworte ich gerne Ihre Fragen rund um die Baufinanzierung und helfe Ihnen bei der Berechnung der Kreditsumme anhand des Zeitpunkts und der Höhe der monatlichen Rate bzw. der Kreditlaufzeit anhand der Höhe und der Höhe der monatlichen Rate."
        }
    ]);
    return response
        .status(200)
        .send(getUserVisibleMessages(identity));
});