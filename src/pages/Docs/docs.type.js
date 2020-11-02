


const pageSection = {
    app: "shmp",
    type: "method-section",
    attributes: [
        { key: "title",
            type: "text"
        },
        { key: "content",
            type: "richtext",
            required: true
        }
    ]
}

const shmpDoc = {
  app: "shmp",
  type: "method-page",
  registerFormats: [pageSection],
  attributes: [
    { key: "section",
      type: "text",
      required: true,
      default: "props:section",
      hidden: true
    },
    { key: "sectionLanding",
      type: "boolean",
      default: false,
      editable: false,
      hidden: true
    },
    { key: "index",
      type: "number",
      default: "props:index",
      editable: false,
      hidden: true
    },
    { key: "title",
      type: "text"
    },
    {
      key: 'url-slug',
      type: "text"
    },
    {
      key: 'sections',
        type: "dms-format",
        format: "shmp+method-section",
      isArray: true,
      editInPlace: true,
    }
  ]
}

export {
  shmpDoc,
  pageSection
}

