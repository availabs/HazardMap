import React, { useEffect, useRef } from "react";
import uPlot from "uplot";
import "./uPlot.min.css";
import hazardcolors from "../../../constants/hazardColors";

let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}

const hazards = [
    {value:'wind', name:'Wind'},
    {value:'wildfire', name:'Wildfire'},
    {value:'tsunami', name:'Tsunami/Seiche'},
    {value:'tornado', name:'Tornado'},
    {value:'riverine', name:'Flooding'},
    // {value:'lightning', name:'Lightning'},
    // {value:'landslide', name:'Landslide'},
    // {value:'icestorm', name:'Ice Storm'},
    // {value:'hurricane', name:'Hurricane'},
    // {value:'heatwave', name:'Heat Wave'},
    // {value:'hail', name:'Hail'},
    // {value:'earthquake', name:'Earthquake'},
    // {value:'drought', name:'Drought'},
    // {value:'avalanche', name:'Avalanche'},
    // {value:'coldwave', name:'Coldwave'},
    // {value:'winterweat', name:'Snow Storm'},
    // {value:'volcano', name:'Volcano'},
    // {value:'coastal', name:'Coastal Hazards'}
]

function seriesBarsPlugin(opts) {
    const labels   = opts.labels;
    const barWidth = Math.round(15 * devicePixelRatio);
    const font     = Math.round(10 * devicePixelRatio) + "px Arial";
    const margin   = 0.5;

    function drawThings(u, sidx, i0, i1, draw) {
        const s       = u.series[sidx];
        const xdata   = u.data[0];
        const ydata   = u.data[sidx];
        const scaleX  = 'x';
        const scaleY  = s.scale;

        const totalWidth = (u.series.length - 1) * barWidth;		//.show
        const offs	     = (sidx-1) * barWidth;

        for (let i = i0; i <= i1; i++) {
            let x0 = Math.round(u.valToPos(xdata[i], scaleX, true));
            let y0 = Math.round(u.valToPos(ydata[i], scaleY, true));

            draw(i, x0, y0, offs, totalWidth);
        }
    }

    function drawBars(u, sidx, i0, i1) {
        const scaleY  = u.series[sidx].scale;
        const zeroY = Math.round(u.valToPos(0, scaleY, true));
        const fill = new Path2D();
        drawThings(u, sidx, i0, i1, (i, x0, y0, offs, totalWidth) => {
            fill.rect(
                x0 - totalWidth/2 + offs,
                y0,
                barWidth,
                zeroY-y0
            );
        });
        return {fill};
    }

    function drawPoints(u, sidx, i0, i1) {
        u.ctx.font = font;
        u.ctx.textAlign = "center";
        u.ctx.textBaseline = "bottom";
        u.ctx.fillStyle = "black";

        drawThings(u, sidx, i0, i1, (i, x0, y0, offs, totalWidth) => {
            u.ctx.fillText(
                u.data[sidx][i],
                x0 - totalWidth/2 + offs + barWidth/2,
                y0
            );
        });
    }

    function range(u, dataMin, dataMax) {
        let [min, max] = uPlot.rangeNum(0, dataMax, 0.05, true);
        return [0, max];
    }

    return {
        opts: (u, opts) => {
            uPlot.assign(opts, {
                cursor: {show: false},
                select: {show: false},
                scales: {
                    x: {
                        time: false,
                        range: u => [
                            u.data[0][0]                    - margin,
                            u.data[0][u.data[0].length - 1] + margin,
                        ],
                    },
                    rend: {range},
                    size: {range},
                    mem:  {range},
                    inter:{range},
                    toggle:{range},
                }
            });

            uPlot.assign(opts.axes[0], {
                splits:     () => u.data[0],
                values:     () => labels(),
                gap:        5,
                size:       20,
                labelSize:  5,
                grid:       {show: false},
                ticks:      {show: false},
            });

            opts.series.forEach((s, i) => {
                if (i > 0) {
                    return uPlot.assign(s, {
                        width: 0,
                        paths: drawBars,
                        points: {
                            show: drawPoints
                        }
                    });
                }
            });
        }
    };
}

function enabled(){
    return Array(years.length).fill(true);
}

function processData(props){
    const opts = {
        width: 1800,
        height: 600,
        title: "Bar Charts",
        axes: [
            {
                grid: {show: false},
                //	rotate: -45,
            },
            {
                show: false,
            },
        ],
        gutters: {
            x: false,
        },
        series: hazards.reduce((a,c) =>{
            a.push({
                    label : c.name,
                    fill : hazardcolors[c.value],
                    scale : 'rend'
                })
            return a
        },[{}]),
        plugins: [
            seriesBarsPlugin({
                labels: () => years
            }),
        ],
    };
    return opts
}

function MyPlot(props) {
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


export default MyPlot
