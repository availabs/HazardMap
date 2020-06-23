export const DMS_DOCS = {
  app: "dms",
  type: "dms-docs",

  attributes: [
    { key: "title",
      type: "text",
      required: true,
      wizardPage: "Main Page"
    },
    { key: "body",
      type: "textarea",
      required: true
    },
    { key: "chapter",
      type: "text",
      required: true,
      verify: "^\\d+([.]\\d+)*$"
    },
    { key: 'tags',
      type: 'text-array',
      wizardBreak: true
    },


    { key: "test-editor",
      type: "rich-text",
      wizardPage: "Editor Page",
      wizardBreak: true
    },

    { key: "test-number",
      type: "number",
      wizardPage: "Number Page",
      // min: 0,
      // max: 10
    },
    { key: "test-number-array",
      type: "number-array",
      // min: 0,
      // max: 10,
      wizardBreak: true
    },

    { key: "test-date-array",
      type: 'date-array',
      required: true,
      wizardPage: "Random Page"
    },
    { key: 'test-select',
      type: "text",
      searchable: false,
      domain: "props:domain"
    },
    { key: 'test-multi-select',
      type: "text-array",
      domain: "props:domain",
      wizardBreak: true
    },

    { key: "test-image",
      type: "img",
      wizardPage: "Image Page"
    }
  ]
}
