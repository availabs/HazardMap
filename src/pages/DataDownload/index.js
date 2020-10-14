import React from 'react'
import DataDownload from "./DataDownload";
import {shmp} from 'pages/components/shmp-theme.js'

const MetaData = () => (
<div className="bg-gray-50 mt-16 min-h-screen">
  <div className="relative max-w-screen-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
    <svg
      className="absolute top-0 left-full transform -translate-x-1/2 -translate-y-3/4 lg:left-auto lg:right-full lg:translate-x-2/3 lg:translate-y-1/4"
      width={404}
      height={784}
      fill="none"
      viewBox="0 0 404 784"
    >
      <defs>
        <pattern
          id="8b1b5f72-e944-4457-af67-0c6d15a99f38"
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
        fill="url(#8b1b5f72-e944-4457-af67-0c6d15a99f38)"
      />
    </svg>
    <div className="relative lg:grid lg:grid-cols-3 lg:col-gap-8">
      <div className="lg:col-span-1">
        <h3 className="text-3xl leading-9 font-extrabold tracking-tight text-gray-900 sm:text-4xl sm:leading-10">
          Download Data for Planning.
        </h3>
        <div className="mt-10 sm:grid sm:grid-cols-2 sm:col-gap-8 sm:row-gap-10 lg:col-span-2 lg:mt-0">
        <div className="mt-10 sm:mt-0 col-span-2">
          
          <div className="mt-5">
            <h4 className="text-lg leading-6 font-medium text-gray-900">
             
            </h4>
            <p className="mt-2 text-base leading-6 text-gray-500">
             This page allows users to download natural hazard loss data at a variety of geographies including the NCEI Storm Events Data, the SBA Disaster Loans, and the FEMA Public Assistance and Individual Assistance datasets. Below you can find instructions for setting specific parameters to download the data that works for you.

            </p>
          </div>
        </div>
        <div className='col-span-2'>
          {/*<div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>*/}
          <div className="mt-5">
            <h4 className="text-lg leading-6 font-medium text-gray-900">
              National Data
            </h4>
            <p className="mt-2 text-base leading-6 text-gray-500">
              To download national data simply the select the dataset of your choice and leave all filters unselected. Click export data.
            </p>
          </div>
        </div>
        <div className="mt-10 sm:mt-0 col-span-2">
          {/*<div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
              />
            </svg>
          </div>*/}
          <div className="mt-5 col">
            <h4 className="text-lg leading-6 font-medium text-gray-900">
              County Data
            </h4>
            <p className="mt-2 text-base leading-6 text-gray-500">
              You can pull any of the three datasets for any state or county the United States and Puerto Rico by using the State filter to select the state or county. You can also select the state first and the use the County filter to select all of the counties or a single county within that state.

            </p>
          </div>
        </div>
        <div className="mt-10 sm:mt-0 col-span-2">
          {/*<div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
            <svg
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>*/}
          <div className="mt-5">
            <h4 className="text-lg leading-6 font-medium text-gray-900">
              Local Data
            </h4>
            <p className="mt-2 text-base leading-6 text-gray-500">
              To download data at the municipal or census tract level, you must first select a county, then use the Geo Level filter to select Municipality or Tracts
            </p>
          </div>
        </div>
        </div>
      </div>
      <div className="mt-10 sm:grid sm:grid-cols-2 sm:col-gap-8 sm:row-gap-10 lg:col-span-2 lg:mt-0">
        
        <div className="w-full sm:grid sm:col-gap-8 sm:row-gap-10 lg:col-span-2 lg:mt-0">
          <DataDownload/>
        </div>

      </div>
    </div>
  </div>
</div>

)

export default {
  path: "/downloads",
  exact: true,
  auth: false,
  name: 'Download Data',
  mainNav: true,
  component: MetaData,
  layoutSettings: {
    fixed: true,
    headerBar: false,
    nav: 'top',
    theme: shmp
  }
}

