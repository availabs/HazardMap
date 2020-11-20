import React from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from 'lodash.get';
import Table from '../../../components/avl-components/components/Table/index'
import {fnum} from "../../../utils/sheldusUtils";

var _ = require('lodash')
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
class SevereWeatherCountyTable extends React.Component{
    constructor(props) {
        super(props);
    }

    componentDidUpdate(prevProps,prevState,s){
        if(this.props.geoid !== prevProps.geoid){
            this.fetchFalcorDeps()
        }
    }

    async fetchFalcorDeps(){
        const cousubs = await this.props.falcor.get(['geo',this.props.geoid,'cousubs'])
        this.cousubs = get(cousubs,['json','geo',this.props.geoid,'cousubs'],null)
        this.hazards = hazards.reduce((a,c) =>{
            a.push(c.value)
            return a
        },[])

        if(this.cousubs){
            this.cousubs.unshift(this.props.geoid)
            const cousub_names = await this.props.falcor.get(['geo',this.cousubs,'name'])
            const severeWeather = await this.props.falcor.get(["severeWeather",this.cousubs,this.hazards,'allTime',['total_damage']])
            return {cousubs,cousub_names,severeWeather}
        }
    }


    processCousubData(){
        let graph = get(this.props.falcorCache,['geo'],null)
        let severeWeather = get(this.props.falcorCache,['severeWeather'],null)
        let data = []
        let wide_total = []
        if(graph && severeWeather){
            Object.keys(severeWeather).forEach(geo =>{
                if(geo.slice(0,2) === this.props.geoid.slice(0,2)){
                    let value = hazards.reduce((a,c) =>{

                        a[c.value] = get(severeWeather,[geo,c.value,'allTime','total_damage'],0)

                        return a
                    },{})
                    data.push({
                        'cousub' : get(graph,[geo,'name'],''),
                        ...value
                    })
                    }

            })
            let total = hazards.reduce((a,c) =>{
                a[c.value] = _.sumBy(data,c.value)
                return a
            },{})
            wide_total.push({
                'cousub' : 'Total Damage',
                ...total
            })
            let result = [...data,...wide_total]
            hazards.forEach((hazard =>{
                result = result.sort((a,b) => b[hazard.value] - a[hazard.value])
            }))
            return result

        }

    }

    processTableCols(){
        let tableCols = [{
            'Header' : (<div style={{fontSize: 12}}>Area</div>),
            'accessor':'cousub',
            disableFilters: true
        }]
        hazards.forEach(hazard =>{
            tableCols.push({
                'Header' : (<div style={{fontSize: 12}}>{hazard.name}</div>),
                'accessor':hazard.value,
                disableFilters: true,
                Cell: (data) => {
                    //let d = data.data.sort((a,b) => b[hazard.value] - a[hazard.value])
                    return <div style = {{ textAlign: 'right'}}>{fnum(get(data,`row.values.${hazard.value}`, ''))}</div>
                }
            })
        })
        return tableCols
    }

    render(){
        let tableCols = this.processTableCols()
        let data = this.processCousubData() ? this.processCousubData() : []
        data.forEach(d =>{
            if(d.cousub === 'Total Damage'){
                tableCols = tableCols.filter(col => d[col.accessor] !== 0)
            }
        })
        return (
            <div>
                {
                    tableCols ?
                        <Table
                            defaultPageSize={50}
                            showPagination={true}
                            columns={tableCols}
                            data = {data}
                            initialPageSize={50}
                            minRows={data.length}
                            sortBy={'wind'}
                            sortOrder={'desc'}
                        />
                        : null
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    return {
        activeAmount:state.femaDisasterDeclarations.activeAmount,
        activeStateGeoid : state.stormEvents.activeStateGeoid,
        activeStateAbbrev : state.stormEvents.activeStateAbbrev,
        graph: state.graph,
        hazards: get(state.graph, 'riskIndex.hazards.value', [])
    };
};
const mapDispatchToProps = {
};

export default connect(mapStateToProps,mapDispatchToProps)(reduxFalcor(SevereWeatherCountyTable))
