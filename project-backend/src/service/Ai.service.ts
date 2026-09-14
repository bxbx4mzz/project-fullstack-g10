import { gemini, CHAT_MODEL } from "../lib/Gemini.js";
import { eventTools } from "../tools/Event.tools.js";
import * as eventService from "./event.service.js";
import { getHistory, saveMessage } from "./chat.service.js";

const SYSTEM_PROMPT = `
You are a calendar assistant.

You help users add, edit, delete and review calendar events.

When user wants to create, update or delete an event,
you MUST use the provided functions.

Never claim an event was changed unless the function succeeds.

If you need an event's id before you can update or delete it
(e.g. the user only gave a title/date), call list_events first,
then call update_event or delete_event with the id you found —
in the SAME turn, without waiting for the user to ask again.

Priority:
1 highest
5 lowest
Default priority is 3.

Status must be one of: TODO, IN_PROGRESS, DONE.
Default status for new events is TODO.

Always use tools for calendar changes.
`;

const MAX_TOOL_ROUNDS = 5; // safety cap so a confused model can't loop forever

async function runTool(
  userId: string,
  name: string,
  input: any
) {
  console.log("RUN TOOL:", name, input);

  switch (name) {

    case "list_events":
      return eventService.listEvents(
        userId,
        input
      );


    case "create_event":
      return eventService.createEvent(
        userId,
        input
      );


    case "update_event":
      return eventService.updateEvent(
        userId,
        input.id,
        input
      );


    case "delete_event":
      return eventService.deleteEvent(
        userId,
        input.id
      );


    default:
      throw new Error(
        `Unknown tool ${name}`
      );
  }
}

function safeText(response: any): string {
  try {
    return response.text();
  } catch {
    return "";
  }
}

export async function chat(
  userId: string,
  userMessage: string
): Promise<string> {


  // save user message
  await saveMessage(
    userId,
    "user",
    userMessage
  );


  // load history
  const history = await getHistory(
    userId
  );


  const model =
    gemini.getGenerativeModel({

      model: CHAT_MODEL,

      systemInstruction:
        SYSTEM_PROMPT,


      tools: [
        {
          functionDeclarations: eventTools 
        }
      ]
    });



  const chatSession =
    model.startChat({

      history:
        history
          .filter(
            (m) =>
              m.role !== "tool"
          )
          .map((m)=>({

            role:
              m.role === "assistant"
                ? "model"
                : "user",

            parts:[
              {
                text:m.content
              }
            ]

          }))

    });


  let result = await chatSession.sendMessage(userMessage);
  let response = result.response;

  let finalText = "";
  let round = 0;

  while (round < MAX_TOOL_ROUNDS) {
    round++;

    const calls = response.functionCalls();
    console.log("FUNCTION CALLS:", calls);

    if (!calls || calls.length === 0) {
      finalText = safeText(response);
      break;
    }

    const functionResponses: any[] = [];

    for (const call of calls) {
      const toolResult = await runTool(
        userId,
        call.name,
        call.args
      );

      functionResponses.push({
        functionResponse: {
          name: call.name,
          response: {
            result: toolResult,
          },
        },
      });
    }

    result = await chatSession.sendMessage(functionResponses);
    response = result.response;
  }

  if (!finalText) {
    finalText = "Done.";
  }

  console.log(
    "AI RESPONSE:",
    finalText
  );



  await saveMessage(
    userId,
    "assistant",
    finalText
  );


  return finalText;

}