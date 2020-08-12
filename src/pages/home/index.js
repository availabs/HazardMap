import React from "react"

const HomePage = () => (
	<div className="bg-gray-50">
  <div className="relative">
    <div className="block absolute inset-y-0 h-full w-full">
      <div className="relative h-full">
        <svg
          className="absolute right-full transform translate-y-1/3 translate-x-1/4 md:translate-y-1/2 sm:translate-x-1/2 lg:translate-x-full"
          width={404}
          height={784}
          fill="none"
          viewBox="0 0 404 784"
        >
          <defs>
            <pattern
              id="e229dbec-10e9-49ee-8ec3-0286ca089edf"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={0}
                y={0}
                width={4}
                height={4}
                className="text-gray-200"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect
            width={404}
            height={784}
            fill="url(#ad9a0a02-b58e-4a1d-8c36-1b649889af63)"
          />
        </svg>
        <svg
          className="absolute left-full transform -translate-y-3/4 -translate-x-1/4 sm:-translate-x-1/2 md:-translate-y-1/2 lg:-translate-x-3/4"
          width={404}
          height={784}
          fill="none"
          viewBox="0 0 404 784"
        >
          <defs>
            <pattern
              id="d2a68204-c383-44b1-b99f-42ccff4e5365"
              x={0}
              y={0}
              width={20}
              height={20}
              patternUnits="userSpaceOnUse"
            >
              <rect
                x={0}
                y={0}
                width={4}
                height={4}
                className="text-gray-200"
                fill="currentColor"
              />
            </pattern>
          </defs>
          <rect
            width={404}
            height={784}
            fill="url(#478e97d6-90df-4a89-8d63-30fdbb3c7e57)"
          />
        </svg>
      </div>
    </div>
    <div className="relative pt-6 pb-12 lg:pb-20">
      
     
      
      <div className="mt-10 mx-auto max-w-screen-xl px-4 sm:px-6 md:mt-16 lg:mt-20">
        <div className="text-center">
          <h2 className="text-4xl tracking-tight leading-10 font-extrabold text-gray-900 sm:text-5xl sm:leading-none md:text-6xl">
            Historic Hazard Data
            <br />
            <span className="text-indigo-600 text-2xl sm:text-3xl  md:text-5xl">for Understanding Risk</span>
          </h2>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Anim aute id magna aliqua ad ad non deserunt sunt. Qui irure qui
            lorem cupidatat commodo. Elit sunt amet fugiat veniam occaecat
            fugiat aliqua.
          </p>
        </div>
      </div>
    </div>
    <div className="relative">
      <div className="absolute inset-0 flex flex-col">
        <div className="flex-1" />
        <div className="flex-1 w-full bg-gray-800" />
      </div>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <img
          className="relative rounded-lg shadow-lg"
          src="/img/landing_2.png"
          alt="App screenshot"
        />
      </div>
    </div>
  </div>
  <div className="bg-gray-800">
    <div className="max-w-screen-xl mx-auto pt-16 pb-20 px-4 sm:px-6 md:pb-24 lg:px-8">
      <h3 className="text-center text-gray-400 text-sm font-semibold uppercase tracking-wide">
        Created in partnershiip with 
      </h3>
      <div className="mt-8 grid grid-cols-2 gap-8 md:grid-cols-6 lg:grid-cols-5">
        <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
          <img
            className="h-12"
            src="https://availabs.org/img/logo.png"
            alt="Tuple"
          />
        </div>
        <div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
          <img
            className="h-12"
            src="/img/fema_logo.svg"
            alt="FEMA"
          />
        </div>
        {/*<div className="col-span-1 flex justify-center md:col-span-2 lg:col-span-1">
          <img
            className="h-12"
            src="https://tailwindui.com/img/logos/statickit-logo.svg"
            alt="StaticKit"
          />
        </div>
        <div className="col-span-1 flex justify-center md:col-span-3 lg:col-span-1">
          <img
            className="h-12"
            src="https://tailwindui.com/img/logos/transistor-logo.svg"
            alt="Transistor"
          />
        </div>
        <div className="col-span-2 flex justify-center md:col-span-3 lg:col-span-1">
          <img
            className="h-12"
            src="https://tailwindui.com/img/logos/workcation-logo.svg"
            alt="Workcation"
          />
        </div>*/}
      </div>
    </div>
  </div>
</div>
)

export default {
  path: "/",
  exact: true,
  auth: false,
  name: 'Home',
  component: HomePage,
  layoutSettings: {
    fixed: false,
    headerBar: false,
    nav: 'top',
    theme: 'light'
  }
}
