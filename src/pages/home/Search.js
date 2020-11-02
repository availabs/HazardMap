import React, {Fragment} from 'react';
import {connect} from 'react-redux';
import {reduxFalcor} from "utils/redux-falcor-new";
import get from "lodash.get";
import {asyncContainer, Typeahead} from 'react-bootstrap-typeahead';
import './style.css';

var _ = require('lodash')
const AsyncTypeahead = asyncContainer(Typeahead);
const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]

class Search extends React.Component{
    constructor(props) {
        super(props);
        this.state={
            isLoading : false,
            options: []
        }
        this.handleSearch = this.handleSearch.bind(this)
        this.onChangeFilter = this.onChangeFilter.bind(this)
    }


    async fetchFalcorDeps(){
        const geo_counties = await this.props.falcor.get(['geo',fips,'counties','geoid'])
        if(geo_counties){
            this.filtered_geographies = Object.values(geo_counties.json.geo)
                .reduce((out, state) => {
                    if (state.counties) {
                        out = [...out, ...state.counties]
                    }
                    return out
                }, [])
            const geo_names = await this.props.falcor.get(['geo',this.filtered_geographies,['name']])
            const fips_names = await this.props.falcor.get(['geo',fips,['state_abbr']])
            return {geo_names,fips_names}
        }
    }


    handleSearch(text){
        this.setState({isLoading: true});
        let graph = get(this.props.falcorCache,['geo'],null)
        let data = []
        if(this.filtered_geographies && graph){
            this.filtered_geographies.forEach(geoid =>{
                data.push({
                    geoid: geoid,
                    name: `${get(graph,[geoid,'name'],'')},${get(graph,[geoid.slice(0,2),'state_abbr'],'')}`,
                    fips: get(graph,[geoid.slice(0,2),'state_abbr'],'')
                })
            })
            let geoData = _.filter(data, _.method('name.match', new RegExp(`${text}.*`,'i')))
            this.setState({
                isLoading: false,
                options: geoData ? geoData : data.filter(d => d.includes(text))
            })
        }
    }

    onChangeFilter(selected){
        let geoid = selected.reduce((a,c) =>{
            return c.geoid
        },'')

        window.location = `/overview/${geoid}`

    }
    render(){
        return(
            <div className="max-w-3xl mx-auto py-4 lg:px-4 h-10 px-5 pr-16 text-3xl">
                <AsyncTypeahead
                    isLoading={this.state.isLoading}
                    onSearch={this.handleSearch}
                    minLength = {2}
                    id="my-typeahead-id"
                    placeholder="Search for a County..."
                    options={this.state.options}
                    labelKey={(option) => `${option.name}`}
                    onChange = {this.onChangeFilter.bind(this)}
                    renderMenuItemChildren={(option, props) => (
                        <Fragment>
                            <ul>
                                <span className='text-xl tracking-wide' >{option.name}</span>
                            </ul>
                        </Fragment>
                    )}
                />
            </div>

        )
    }
}

const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        activeStateGeoid : state.user.activeStateGeoid,
        geoid:ownProps.geoid,
        censusKey:ownProps.censusKey,
        graph: state.graph,
        severeWeatherData : get(state.graph,['severeWeather'])
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(Search))
