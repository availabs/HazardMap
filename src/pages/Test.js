import React, { Component } from 'react';


class Test extends Component {
  render () {
    const { children, ...props } = this.props;
    return (
    	<div className='mn-h-screen'>
        <div className=" mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Test Page</h1>
        </div>
        <div className="mx-auto px-4 sm:px-6 md:px-8">
          <div className="py-4">
            <div className="border-4 border-dashed border-gray-200 rounded-lg">
              <pre className='text-xs'>
                <div>{ JSON.stringify(props, null, 3) }</div>
              </pre>
              <div>{ children }</div>
            </div>
          </div>
        </div>
      </div>

    )
  }
}

export default
{
  path: '/test',
  name: 'Test',
  mainNav: true,
  layoutSettings: {
    fixed: true,
    theme: 'light'
  },
  component: {
    type: Test,
    children: [
      "ONE ", "TWO ", Test,
      { type: "div",
        props: {
          className: "border-2 rounded p-2 m-2"
        },
        children: [
          "ONE ", "TWO ", "THREE ", { type: Test }
        ]
      }, "THREE "
    ]
  }
}
