import React from 'react'


const Header = ({toggle,open,title,body, ...props}) => (
  <header className="space-y-1 py-6 px-4 sm:px-6">
    <div className="flex items-center justify-between space-x-3">
      <h2 className="text-lg leading-7 font-medium ">
        {title}
      </h2>
      
    </div>
    <div>
      {body}
    </div>
  </header>
)


const SlideOver = ({children,...props}) => {
  const [open, toggle] = React.useState(true)

  return (
    <div className='h-full pt-12 w-full sm:w-1/4'>
      <div className="h-full flex flex-col shadow-xl z-50 w-full bg-white mt-8">
        <Header open={open} toggle={toggle} title={props.HeaderTitle} body={props.HeaderBody}/>
        <div className="relative flex-1 py-6 px-4 sm:px-6 z-50 hidden sm:block">
         {/* <!-- Replace with your content -->*/}
          {children}
          {/*<!-- /End replace -->*/}
        </div>
      </div>
    </div>
            
       
  )
}

export default SlideOver
