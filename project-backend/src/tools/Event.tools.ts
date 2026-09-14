import { SchemaType } from "@google/generative-ai";
import type { FunctionDeclaration } from "@google/generative-ai";

export const eventTools: FunctionDeclaration[] = [
  {
    name: "list_events",
    description:
      "List the user's calendar events",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        from: {
          type: SchemaType.STRING,
          description: "Start date",
        },

        to: {
          type: SchemaType.STRING,
          description: "End date",
        },

        status: {
          type: SchemaType.STRING,
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          format: "enum",
        },

        priority: {
          type: SchemaType.NUMBER,
        },
      },
    },
  },


  {
    name: "create_event",
    description:
      "Create a new calendar event",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        title: {
          type: SchemaType.STRING,
          description: "Event title",
        },

        description: {
          type: SchemaType.STRING,
        },

        start_time: {
          type: SchemaType.STRING,
          description: "ISO datetime",
        },

        end_time: {
          type: SchemaType.STRING,
        },

        priority: {
          type: SchemaType.NUMBER,
        },
      },

      required: [
        "title",
        "start_time",
      ],
    },
  },


  {
    name: "update_event",
    description:
      "Update an existing event",

    parameters: {
      type: SchemaType.OBJECT,

      properties: {
        id: {
          type: SchemaType.STRING,
        },

        title: {
          type: SchemaType.STRING,
        },

        description: {
          type: SchemaType.STRING,
        },

        start_time: {
          type: SchemaType.STRING,
        },

        end_time: {
          type: SchemaType.STRING,
        },

        priority: {
          type: SchemaType.NUMBER,
        },

        status: {
          type: SchemaType.STRING,
          enum: ["TODO", "IN_PROGRESS", "DONE"],
          format: "enum",
        },
      },

      required:[
        "id"
      ],
    },
  },


  {
    name:"delete_event",

    description:
      "Delete an event",

    parameters:{
      type: SchemaType.OBJECT,

      properties:{
        id:{
          type: SchemaType.STRING
        }
      },

      required:[
        "id"
      ]
    }
  }
];