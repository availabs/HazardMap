import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "./uPlot.min.css";
import hazardcolors from "../../../constants/hazardColors";

let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i.toString())
}

const hazards = [
    {value:'wind', name:'Wind'},
    {value:'wildfire', name:'Wildfire'},
    {value:'tsunami', name:'Tsunami/Seiche'},
    {value:'tornado', name:'Tornado'},
    {value:'riverine', name:'Flooding'},
    {value:'lightning', name:'Lightning'},
    {value:'landslide', name:'Landslide'},
    {value:'icestorm', name:'Ice Storm'},
    {value:'hurricane', name:'Hurricane'},
    {value:'heatwave', name:'Heat Wave'},
    {value:'hail', name:'Hail'},
    {value:'earthquake', name:'Earthquake'},
    {value:'drought', name:'Drought'},
    {value:'avalanche', name:'Avalanche'},
    {value:'coldwave', name:'Coldwave'},
    {value:'winterweat', name:'Snow Storm'},
    {value:'volcano', name:'Volcano'},
    {value:'coastal', name:'Coastal Hazards'}
]

function processData(props){
    let msg = {
        servers: hazards.reduce((a,c) =>{
            a.push({
                name : c.name,
                color : hazardcolors[c.value],
                scale : 'PC'
            })
            return a
        },[]),
        timestamps : years,
        graphData: props.data
    };

    msg.graphData.forEach(counts => {
        counts.forEach((v, i) => {
            if (v === 0)
                counts[i] = 1;
        });
    });

    const optsLinear = {
        width: 1600,
        height: 600,
        title: "Linear Y Scale",
        axes: [
            {},
            {
                size: 60,
                space: 15,
            }
        ],
        scales: {
            x: {
                time: false,
            },
        },
        series: [
            {},
            ...msg.servers.map(s => ({
                label: s.name,
                stroke: s.color,
                spanGaps: true,
            }))
        ],
    };


    return optsLinear
}

function LogPlot(props) {
    const plotRef = useRef();
    const options = processData(props)
    useEffect(() => {
        new uPlot(options, props.data, plotRef.current)
    }, [props]);

    return (
        <div>
            <div ref={plotRef} />
        </div>
    );
}


export default LogPlot
