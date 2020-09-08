import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import { fnum } from "utils/sheldusUtils"
import hazardcolors from "constants/hazardColors";
import * as d3 from "d3";
import Table from "../../components/avl-components/components/Table";
var format =  d3.format("~s")
const fmt = (d) => d < 1000 ? d : format(d)
let years = []
const start_year = 1996
const end_year = 2019
for (let i = start_year; i <= end_year; i++) {
    years.push(i)
}
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
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
];
const tableCols = [
    {
        Header: 'State',
        accessor: 'state',
    },
    {
        Header: 'Year',
        accessor: 'year',
        disableFilters: true
    },
    {
        Header: 'Hazard',
        accessor: 'hazard',
        disableFilters: true
    },
    {
        Header: 'Declaration Title',
        accessor: 'declaration_title',
        disableFilters: true
    },
    {
        Header: 'Declaration Request Number',
        accessor: 'declaration_request_number',
        disableFilters: true
    },
    {
        Header : 'Declaration Type',
        accessor: 'declaration_type',
        disableFilters: true
    },
    {
        Header : 'Declaration Date',
        accessor: 'declaration_date',
        disableFilters: true
    }
];
class FemaDisasters extends React.Component {
    constructor(props) {
        super(props);
        // Don't call this.setState() here!
        this.state = {
            data : []
        };
        this.handleChange = this.handleChange.bind(this)
    }
    componentDidMount(){
        document.body.classList.add("overflow-y-hidden")
    }
    componentWillUnmount(){
        this.setState = (state,callback)=>{
            return;
        };
    }

    componentDidUpdate(prevProps){

    }


    fetchFalcorDeps() {
        return this.props.falcor.get(['femaDisasters',fips,hazards.map(d => d.value),[{from:start_year,to:end_year}],['declaration_title', 'declaration_request_number', 'state', 'declaration_type', 'declaration_date']])
            .then(response =>{
                let fd = get(response, 'json.femaDisasters', {})
                let data = []
                Object.keys(fd).filter(d =>  d !== '$__path').forEach(item =>{
                    Object.keys(fd[item]).filter(d =>  d !== '$__path').forEach(hazard =>{
                        years.forEach(year =>{
                            console.log('check',get(fd, [item,hazard,year,'state'],''))
                            data.push({
                                hazard : hazard,
                                year : year,
                                state : get(fd, [item,hazard,year,'state'],'None'),
                                declaration_title : get(fd, [item,hazard,year,'declaration_title'],'None'),
                                declaration_request_number : get(fd,[item,hazard,year,'declaration_request_number'],'None'),
                                declaration_type: get(fd,[item,hazard,year,'declaration_type'],'None'),
                                declaration_date : get(fd,[item,hazard,year,'declaration_date'],'')
                            })
                        })

                    })
                })
                data = data.sort((a,b) => b.declaration_date - a.declaration_date)
                this.setState({
                    data : data
                })
            })
    }
    handleChange(e) {
    }


    render() {
        return (
            <div>
                {this.state.data.length > 0 ? <Table
                    defaultPageSize={10}
                    showPagination={false}
                    columns={tableCols}
                    data={this.state.data}
                    initialPageSize={10}
                    minRows={this.state.data.length}
                /> : <div> Loading</div>}
            </div>
            /*<div className='flex flex-col lg:flex-row h-full box-border overflow-hidden'>
                {/!*<div className='flex-auto h-full order-last lg:order-none overflow-hidden'>
                    <div className='h-full'>
                        <div className="relative top-0 right-auto h-8 w-2/6">
                        </div>
                        <div className='relative bottom-40 h-40 z-90 w-full'>
                        </div>
                    </div>
                </div>
                <div className='h-56 lg:h-auto lg:w-1/4 p-2 lg:min-w-64 overflow-auto'>
                    <div className='bg-white rounded h-full w-full shadow'>

                    </div>
                </div>*!/}


            </div>*/
        )
    }
}
const mapStateToProps = (state, ownProps) => {
    return {
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {

};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(FemaDisasters))
