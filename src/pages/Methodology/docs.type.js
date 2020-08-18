const ctpDoc = {
    app: "ctp",
    type: "doc-page",
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
        { key: "content",
            type: "richtext",
            required: true
        },
        { key: "tags",
            type: "text",
            isArray: true
        }
    ]
}


export {
    ctpDoc
}