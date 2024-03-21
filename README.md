# chatbot-poc-backend

## Running

You can run this project locally either directly in the command line with the command
```
npm run dev
``` 
or in a docker container with
```
docker compose up
```

## How to change the context Prompt

Currently the context prompt is provided by a Word Document in the [prompts/](./prompts/) Folder.
Upload or replace a new Word File, parseable formats are:
```
 docx, pptx, xlsx, odt, odp, ods, pdf
```

Remember to update the name in [index.ts](./src/chat/index.ts).

For more information on the parser see [npm officeparser](https://www.npmjs.com/package/officeparser).