import React from "react"

import { DMS_DOCS } from "components/DMS/docs/dms-docs.type"

class Component extends React.Component {
  render() {
    return (
      <div className="relative">
        { this.props.children }
      </div>
    )
  }
}
const SideBar = ({ children, ...props }) =>
  <div className="absolute left-0 top-0 p-5"
    style={ { width: "250px" } }>
    <ul>
      { children }
    </ul>
  </div>
const SideBarItem = ({ children, active, level, ...props }) =>
  <li { ...props } style={ { marginLeft: `${ level * 3 / 4 }rem` } }
    className={ `
      px-5 cursor-pointer border-2 border-gray-300 hover:border-gray-400 hover:bg-gray-200 rounded
      ${ active ? "bg-gray-300" : "" }
    ` }>
    { children }
  </li>

const Content = ({ title, content, children }) =>
  <div className="absolute left-0 top-0 p-5"
    style={ { marginLeft: "250px" } }>
    <div className="text-2xl font-bold">{ title }</div>
    <div className="p-5 rounded-lg border-2">{ content }</div>
    <div>
      { children }
    </div>
  </div>

export default {
  path: '/test-wrapper',
  name: 'Test Wrapper',
  mainNav: true,
  auth: true,
  layoutSettings: {
    fixed: true,
    theme: 'light'
  },
  component: {
    type: Component,
    props: {
      format: DMS_DOCS
    },
    wrappers: [
      "dms-provider",
      "show-loading",
      "dms-falcor"
    ],
    children: [
      { type: SideBar,
        children: ["TESTING!!!!!!!!!", () => <div>TESTING!!!!!!!</div>],
        wrappers: [
          { type: "dms-consumer",
            options: {
              interactOnMount: "props:dataItems-->data.chapter==0->id", // --> ararray reduce
              mapDataToProps: {
                children: [ // children will be merged with config children
                  { path: "props:dataItems", // since dataItems is an Array
                                              // the following self: args are retreived from array items
                    filter: {
                      args: ["self:data.chapter", "item:data.chapter"],
                      comparator: (self, item) => {
                        const length = self.split(".").length,
                          args = item.split(".").slice(0, length);
                        do {
                          const arg = [...args, "\\d+"].join("[.]"),
                            regex = new RegExp(`^${ arg }$`);
                          if (regex.test(self)) return true;
                        } while (args.pop());
                        return false;
                      }
                    },
                    sortBy: "data.chapter",
                    props: {
                      active: "props:item.id==self:id",
                      level: {
                        args: ["self:data.chapter"],
                        func: chapter => chapter.split(".").length - 1
                      }
                    },
                    type: SideBarItem,
                    key: "self:id",
                    value: "self:data.title",
                    interact: "self:id"
                  }, // END CHILD 1

                  { type: "div",
                    props: {
                      className: "border-b-4 border-black my-5 text-center"
                    },
                    value: "TESTS BELOW"
                  },
                  { path: "item:data.chapter", // if no value is supplied then the resolved path is used
                    type: "div",
                    props: {
                      className: "border-2 p-2 rounded"
                    }
                  },
                  { path: "props:top.dmsAction", // if no value is supplied then the resolved path is used
                    type: "div",
                    props: {
                      className: "border-2 p-2 rounded"
                    }
                  },
                  { path: "item:data.title", // this item refers to the active dms item, if it exists
                    type: "div",
                    props: {
                      className: "border-2 p-2 rounded"
                    }
                  },
                  { path: "item:data->body", // -> get, equivalent to item:data.body
                    type: "div",
                    props: {
                      className: "border-2 p-2 rounded"
                    }
                  },
                  "props:dataItems>>>data.title", // >>> array map
                  { path: "props:dataItems->5.data.title", // -> get from array
                    type: "div",
                    props: {
                      className: "rounded border-2 p-2"
                    }
                  },
                  { path: "props:dataItems==>data.chapter==0", // ==> array filter
                    type: "div",
                    props: {
                      className: "rounded border-2 p-2"
                    },
                    value: "item:data.title"
                  },
                  { path: "props:dataItems-->data.chapter==0->data.title", // --> array reduce
                                                                        // the get operator is required here due to the array reduce
                    type: "div",
                    props: {
                      className: "rounded border-2 p-2"
                    }
                  }
                ]
              }
            }
          }
        ] // END SIDEBAR WRAPPERS
      }, // END SIDEBAR

      { type: Content,
        wrappers: [
          { type: "dms-share",
            options: {
              mapDataToProps: {
                test1: "props:item.data",
                test2: 2,
                test3: "3==4",
                test4: "4==4"
              },
              propsToShare: ["item.data.title"]
            }
          },
          { type: "dms-consumer",
            options: {
              mapDataToProps: {
                title: "props:item.data.title",
                content: "props:item.data.body"
              }
            }
          }
        ],
        children: [
          ({ children, ...props }) => <div className="border-2 rounded p-2 my-2">SHARED!!!<div>{ JSON.stringify(props) }</div></div>,
          { type: ({ children, ...props }) => <div><div>{ JSON.stringify(props) }</div><div>{ children }</div></div>,
            children: [
              { type: "div",
                children: [
                  { type: ({ className, ...props }) => <div className={ className }>{ JSON.stringify(props) }</div>,
                    wrappers: ["dms-consumer"],
                    props: {
                      className: "border-2 rounded p-2 my-2"
                    }
                  }
                ]
              }
            ]
          }
        ]
      }

    ]
  }
}
