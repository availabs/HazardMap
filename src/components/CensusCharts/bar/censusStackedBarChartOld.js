import React, { Component } from 'react';
import { connect } from 'react-redux';
import { reduxFalcor} from "utils/redux-falcor";
import {falcorGraph} from "store/falcorGraph";
import {ResponsiveBar} from '@nivo/bar'
var numeral = require('numeral')

class CensusStackedBarChart extends React.Component {
    _isMounted = false;
    constructor(props) {
        super(props);

        this.state = {
            value: 2014,
            temp:2014,
            graphData1: [],
            graphData2: [],
            graphData3: [],
            graphData4: []
        }
        this.handleChange = this.handleChange.bind(this)
    }
    handleChange(event) {
        this.setState({value: event.target.value});
    }
    fetchFalcorDeps() {
        let year = [2010,2011,2012,2013,2014,2015,2016]
        let census_var = this.props.censusKey;
        let censusConfig ={}
        let census_subvars = []
        return falcorGraph.get(['acs','config'])
            .then(res=> {
            Object.values(res.json.acs).forEach(function (config, i) {
                censusConfig = config
            })

            Object.keys(censusConfig).forEach(function (censvar, i) {
                if (census_var.includes(censvar)) {
                    Object.values(censusConfig[censvar].variables).forEach(function (subvar, i) {
                        census_subvars.push(subvar.value)
                    })
                }
            })
            return falcorGraph.get(['acs',[...this.props.geoid,...this.props.compareGeoid],year,[...census_subvars]],['acs','config'])
    .then(response =>{
            return response
        })
    })
    }

    componentDidUpdate(oldProps){
        if (this.state.value !== this.state.temp){
            this.transformData().then(res =>{
                this.setState({
                    graphData1 : res[1],
                    temp : this.state.value
                });
        })
        }

        if (oldProps.geoid !== this.props.geoid){
            this.transformData().then(res =>{
                this.setState({
                    graphData1 : res[1],
                })
            })
        }

    }

    componentWillMount()
    {
        this._isMounted = true;
        this.transformData().then(res =>{
            this.setState({
                graphData1 : res[1],
            })
        })

    }

    componentWillUnmount() {
        this._isMounted = false;
    }

    transformData() {
        return new Promise((resolve,reject) => {
            this.fetchFalcorDeps().then(response => {
                if(this.props.PopulationByAge) {
                    let year = parseFloat(this.state.value);
                    let geoid = this.props.geoid;
                    let cenKey_age = this.props.censusKey;
                    let censusConfig = {};
                    let responseData_age = {};
                    let axisData_m = [];
                    let axisData_f = [];
                    let axisData = [];
                    let stackData_m = [];
                    let stackData_f = [];
                    let stackData = [];
                    let obj = {};


                    censusConfig = response.json.acs.config
                    responseData_age = response.json.acs[geoid][year]
                    //----------------------------- For the age by population graph -----------------------------
                    Object.keys(responseData_age).forEach(function (res, index) {
                        if (index > 2 && index !== 26) {
                            Object.keys(censusConfig).forEach(function (config, i) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar, i) {
                                        if (res === subvar.value) {
                                            if (subvar.name.includes('Male')) {
                                                axisData_m.push({
                                                    "age": subvar.name.slice(5),
                                                    "Male": responseData_age[res],
                                                    "MaleColor1": "#4C24A2"
                                                })

                                                stackData_m.push({
                                                    "age": subvar.name.slice(5),
                                                    "Male": responseData_age[res],
                                                    "MaleColor1": "#4C24A2"
                                                })


                                            } else if (subvar.name.includes('Female')) {
                                                axisData_f.push({
                                                    "Female": responseData_age[res],
                                                    "FemaleColor1": "#E5945D"
                                                })

                                                stackData_f.push({
                                                    "Female": -(parseFloat(responseData_age[res])),
                                                    "FemaleColor1": "#E5945D"
                                                })

                                            }
                                        }
                                    })
                                }
                            })
                        }

                    })
                    Object.values(axisData_f).forEach(function (axis_f, i) {
                        obj = {...axisData_m[i], ...axis_f}
                        axisData.push(obj)
                    })

                    Object.values(stackData_f).forEach(function (stack_f, i) {
                        obj = {...stackData_m[i], ...stack_f}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])
                }

                if(this.props.PovertyPopulationBySex) {
                    let year = parseFloat(this.state.value);
                    let responseData_sex = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataPoverty_m = []
                    let axisDataPoverty_m = []
                    let stackDataNotPoverty_m = []
                    let axisDataNotPoverty_m = []
                    let stackDataPoverty_f = []
                    let axisDataPoverty_f = []
                    let stackDataNotPoverty_f = []
                    let axisDataNotPoverty_f = []
                    let stackDataMale = []
                    let axisDataMale = []
                    let stackDataFemale = []
                    let axisDataFemale = []
                    let axisData = []
                    let stackData = [];
                    Object.keys(responseData_sex).forEach(function (res, index) {
                        if (index >= 4 && index <= 16) {
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar) {
                                        if (res === subvar.value) {
                                            axisDataPoverty_m.push({
                                                "age": subvar.name.slice(5),
                                                "MaleNumber": responseData_sex[res],
                                                "MaleColorP": "#82BDCF"
                                            })
                                            stackDataPoverty_m.push({
                                                "age": subvar.name.slice(5),
                                                "MaleNumber": parseFloat(responseData_sex[res]),
                                                "MaleColorP": "#82BDCF"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        if (index >= 32 && index <= 44) {
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar) {
                                        if (res === subvar.value) {
                                            axisDataNotPoverty_m.push({
                                                "age": subvar.name.slice(5),
                                                "MaleNumber": responseData_sex[res],
                                                "MaleColorNP": "#2A738A"
                                            })
                                            stackDataNotPoverty_m.push({
                                                "age": subvar.name.slice(5),
                                                "MaleNumber": responseData_sex[res],
                                                "MaleColorNP": "#2A738A"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        if (index >= 18 && index <= 30) {
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar) {
                                        if (res === subvar.value) {
                                            axisDataPoverty_f.push({
                                                "age": subvar.name.slice(6),
                                                "FemaleNumber": responseData_sex[res],
                                                "FemaleColorP": "#E295A0"
                                            })
                                            stackDataPoverty_f.push({
                                                "age": subvar.name.slice(6),
                                                "FemaleNumber": -parseFloat(responseData_sex[res]),
                                                "FemaleColorP": "#E295A0"
                                            })
                                        }
                                    })
                                }
                            })
                        }
                        if (index >= 46 && index <= 59) {
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar) {
                                        if (res === subvar.value) {
                                            axisDataNotPoverty_f.push({
                                                "age": subvar.name.slice(6),
                                                "FemaleNumber": responseData_sex[res],
                                                "FemaleColorNP": "#EF2642"
                                            })
                                            stackDataNotPoverty_f.push({
                                                "age": subvar.name.slice(6),
                                                "FemaleNumber": -(parseFloat(responseData_sex[res])),
                                                "FemaleColorNP": "#EF2642"
                                            })
                                        }
                                    })
                                }
                            })
                        }

                    })

                    axisDataPoverty_m.forEach(function (axis, i) {
                        axisDataMale.push({
                            'age': axis.age,
                            'MalePoverty': parseFloat(axis.MaleNumber),
                            'MaleColorP': axis.MaleColorP,
                            'MaleNotPoverty': parseFloat(axisDataNotPoverty_m[i].MaleNumber),
                            'MaleColorNP': axisDataNotPoverty_m[i].MaleColorNP


                        })
                        stackDataMale.push({
                            'age': axis.age,
                            'MaleColorP': axis.MaleColorP,
                            'MalePoverty': parseFloat(stackDataPoverty_m[i].MaleNumber),
                            'MaleNotPoverty': parseFloat(stackDataNotPoverty_m[i].MaleNumber),
                            'MaleColorNP': stackDataNotPoverty_m[i].MaleColorNP
                        })

                    })

                    axisDataPoverty_f.forEach(function (axis, i) {
                        axisDataFemale.push({
                            'age': axis.age,
                            'FemalePoverty': parseFloat(axis.FemaleNumber),
                            'FemaleColorP': axis.FemaleColorP,
                            'FemaleNotPoverty': parseFloat(axisDataNotPoverty_f[i].FemaleNumber),
                            'FemaleColorNP': axisDataNotPoverty_f[i].FemaleColorNP

                        })
                        stackDataFemale.push({
                            'age': axis.age,
                            'FemaleColorP': axis.FemaleColorP,
                            'FemalePoverty': (parseFloat(stackDataPoverty_f[i].FemaleNumber)),
                            'FemaleNotPoverty': parseFloat(stackDataNotPoverty_f[i].FemaleNumber),
                            'FemaleColorNP': stackDataNotPoverty_f[i].FemaleColorNP
                        })
                    })
                    Object.values(axisDataFemale).forEach(function (axis_f, i) {
                        let obj = {...axisDataMale[i], ...axis_f}
                        axisData.push(obj)
                    })
                    Object.values(stackDataFemale).forEach(function (stack_f, i) {
                        let obj = {...stackDataMale[i], ...stack_f}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])

                }

                if(this.props.CivilianStatus) {
                    let year = parseFloat(this.state.value);
                    let responseData_vet = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataVeteran_m =[]
                    let axisDataVeteran_m = []
                    let stackDataVeteran_f = []
                    let axisDataVeteran_f = []
                    let stackDataNotVeteran_m =[]
                    let axisDataNotVeteran_m = []
                    let stackDataNotVeteran_f = []
                    let axisDataNotVeteran_f = []
                    let stackDataMale = []
                    let axisDataMale = []
                    let stackDataFemale = []
                    let axisDataFemale = []
                    let axisData = []
                    let stackData =[];
                    Object.keys(responseData_vet).forEach(function (res, index) {
                        if (index >= 7 && index <= 21) {
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>5 && i <21){
                                            if(subvar.name.includes('non')){
                                                if (res === subvar.value) {
                                                    axisDataNotVeteran_m.push({
                                                        "age": subvar.name.slice(5,-10),
                                                        "MaleNumber": responseData_vet[res],
                                                        "MaleColorNV": "#82BDCF"
                                                    })
                                                    stackDataNotVeteran_m.push({
                                                        "age": subvar.name.slice(5,-10),
                                                        "MaleNumber": responseData_vet[res],
                                                        "MaleColorNV": "#82BDCF"
                                                    })
                                                }
                                            }
                                            else if (subvar.name.includes('veteran') && !subvar.name.includes('Total') && !subvar.name.includes('non')){
                                                if (res === subvar.value) {
                                                    axisDataVeteran_m.push({
                                                        "age": subvar.name.slice(5,-10),
                                                        "MaleNumber": responseData_vet[res],
                                                        "MaleColorV": "#2A738A"
                                                    })
                                                    stackDataVeteran_m.push({
                                                        "age": subvar.name.slice(5,-10),
                                                        "MaleNumber": responseData_vet[res],
                                                        "MaleColorV": "#2A738A"
                                                    })
                                                }
                                            }
                                        }

                                    })
                                }
                            })
                        }
                        if(index >=25){
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>=24){
                                            if(subvar.name.includes('non')){
                                                if (res === subvar.value) {
                                                    axisDataNotVeteran_f.push({
                                                        "age": subvar.name.slice(6,-8),
                                                        "FemaleNumber": responseData_vet[res],
                                                        "FemaleColorNV": "#E295A0"
                                                    })
                                                    stackDataNotVeteran_f.push({
                                                        "age": subvar.name.slice(6,-8),
                                                        "FemaleNumber": -(parseFloat(responseData_vet[res])),
                                                        "FemaleColorNV": "#E295A0"
                                                    })
                                                }
                                            }
                                            else if(subvar.name.includes('veteran') && !subvar.name.includes('Total') && !subvar.name.includes('non')){
                                                if (res === subvar.value) {
                                                    axisDataVeteran_f.push({
                                                        "age": subvar.name.slice(6,-8),
                                                        "FemaleNumber": responseData_vet[res],
                                                        "FemaleColorV": "#EF2642"
                                                    })
                                                    stackDataVeteran_f.push({
                                                        "age": subvar.name.slice(6,-8),
                                                        "FemaleNumber": -(parseFloat(responseData_vet[res])),
                                                        "FemaleColorV": "#EF2642"
                                                    })
                                                }
                                            }
                                        }

                                    })
                                }
                            })
                        }

                    })

                    axisDataVeteran_m.forEach(function (axis, i) {
                        axisDataMale.push({
                            'age': axis.age,
                            'MaleVeteran': parseFloat(axis.MaleNumber),
                            'MaleColorV': axis.MaleColorV,
                            'MaleNotVeteran': parseFloat(axisDataNotVeteran_m[i].MaleNumber),
                            'MaleColorNV': axisDataNotVeteran_m[i].MaleColorNV


                        })
                        stackDataMale.push({
                            'age': axis.age,
                            'MaleColorV': axis.MaleColorV,
                            'MaleVeteran': parseFloat(stackDataVeteran_m[i].MaleNumber),
                            'MaleNotVeteran': parseFloat(stackDataNotVeteran_m[i].MaleNumber),
                            'MaleColorNV': stackDataNotVeteran_m[i].MaleColorNV
                        })

                    })

                    axisDataVeteran_f.forEach(function (axis, i) {
                        axisDataFemale.push({
                            'age': axis.age,
                            'FemaleVeteran': parseFloat(axis.FemaleNumber),
                            'FemaleColorV': axis.FemaleColorV,
                            'FemaleNotVeteran': parseFloat(axisDataNotVeteran_f[i].FemaleNumber),
                            'FemaleColorNV': axisDataNotVeteran_f[i].FemaleColorNV

                        })
                        stackDataFemale.push({
                            'age': axis.age,
                            'FemaleColorV': axis.FemaleColorV,
                            'FemaleVeteran': (parseFloat(stackDataVeteran_f[i].FemaleNumber)),
                            'FemaleNotVeteran': parseFloat(stackDataNotVeteran_f[i].FemaleNumber),
                            'FemaleColorNV': stackDataNotVeteran_f[i].FemaleColorNV
                        })
                    })

                    Object.values(axisDataFemale).forEach(function (axis_f, i) {
                        let obj = {...axisDataMale[i], ...axis_f}
                        axisData.push(obj)
                    })
                    Object.values(stackDataFemale).forEach(function (stack_f, i) {
                        let obj = {...stackDataMale[i], ...stack_f}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])
                }


                if(this.props.schoolEnrollmentAge){
                    let year = parseFloat(this.state.value);
                    let responseData_schoolAge = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataPrivate_m =[]
                    let axisDataPrivate_m = []
                    let stackDataPrivate_f = []
                    let axisDataPrivate_f = []
                    let stackDataPublic_m =[]
                    let axisDataPublic_m = []
                    let stackDataPublic_f = []
                    let axisDataPublic_f = []
                    let stackDataMale = []
                    let axisDataMale = []
                    let stackDataFemale = []
                    let axisDataFemale = []
                    let axisData = []
                    let stackData =[];
                    Object.keys(responseData_schoolAge).forEach(function (res, index) {
                        if (index >=3){
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>2 && i <11){
                                                if (res === subvar.value) {
                                                    axisDataPublic_m.push({
                                                        "age": subvar.name,
                                                        "MaleNumber": responseData_schoolAge[res],
                                                        "MaleColorPublic": "#82BDCF"
                                                    })
                                                    stackDataPublic_m.push({
                                                        "age": subvar.name,
                                                        "MaleNumber": responseData_schoolAge[res],
                                                        "MaleColorPublic": "#82BDCF"
                                                    })
                                                }
                                        }
                                        if (i>11 && i <20){
                                            if (res === subvar.value) {
                                                axisDataPrivate_m.push({
                                                    "age": subvar.name,
                                                    "MaleNumber": (responseData_schoolAge[res]),
                                                    "MaleColorPrivate": "#2A738A"
                                                })
                                                stackDataPrivate_m.push({
                                                    "age": subvar.name,
                                                    "MaleNumber": (responseData_schoolAge[res]),
                                                    "MaleColorPrivate": "#2A738A"
                                                })
                                            }
                                        }
                                        if(i>30 && i<39){
                                            if (res === subvar.value) {
                                                axisDataPublic_f.push({
                                                    "age": subvar.name,
                                                    "FemaleNumber": -(responseData_schoolAge[res]),
                                                    "FemaleColorPublic": "#E295A0"
                                                })
                                                stackDataPublic_f.push({
                                                    "age": subvar.name,
                                                    "FemaleNumber": -(responseData_schoolAge[res]),
                                                    "FemaleColorPublic": "#E295A0"
                                                })
                                            }
                                        }
                                        if(i>39 && i <48){
                                            if (res === subvar.value) {
                                                axisDataPrivate_f.push({
                                                    "age": subvar.name,
                                                    "FemaleNumber": -(responseData_schoolAge[res]),
                                                    "FemaleColorPrivate": "#EF2642"
                                                })
                                                stackDataPrivate_f.push({
                                                    "age": subvar.name,
                                                    "FemaleNumber": -(responseData_schoolAge[res]),
                                                    "FemaleColorPrivate": "#EF2642"
                                                })
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    })

                    axisDataPrivate_m.forEach(function (axis, i) {
                        axisDataMale.push({
                            'age': axis.age,
                            'Males in Private school': parseFloat(axis.MaleNumber),
                            'MaleColorPrivate': axis.MaleColorPrivate,
                            'Males in Public school': parseFloat(axisDataPublic_m[i].MaleNumber),
                            'MaleColorPublic': axisDataPublic_m[i].MaleColorPublic


                        })
                        stackDataMale.push({
                            'age': axis.age,
                            'MaleColorPrivate': axis.MaleColorPrivate,
                            'Males in Private school': parseFloat(stackDataPrivate_m[i].MaleNumber),
                            'Males in Public school': parseFloat(stackDataPublic_m[i].MaleNumber),
                            'MaleColorPublic': stackDataPublic_m[i].MaleColorPublic
                        })

                    })

                    axisDataPrivate_f.forEach(function (axis, i) {
                        axisDataFemale.push({
                            'age': axis.age,
                            'Females in Private school': parseFloat(axis.FemaleNumber),
                            'FemaleColorPrivate': axis.FemaleColorPrivate,
                            'Females in Public school': parseFloat(axisDataPublic_f[i].FemaleNumber),
                            'FemaleColorPublic': axisDataPublic_f[i].FemaleColorPublic


                        })
                        stackDataFemale.push({
                            'age': axis.age,
                            'FemaleColorPrivate': axis.FemaleColorPrivate,
                            'Females in Private school': parseFloat(stackDataPrivate_f[i].FemaleNumber),
                            'Females in Public school': parseFloat(stackDataPublic_f[i].FemaleNumber),
                            'FemaleColorPublic': stackDataPublic_f[i].FemaleColorPublic
                        })

                    })

                    Object.values(axisDataFemale).forEach(function (axis_f, i) {
                        let obj = {...axisDataMale[i], ...axis_f}
                        axisData.push(obj)
                    })
                    Object.values(stackDataFemale).forEach(function (stack_f, i) {
                        let obj = {...stackDataMale[i], ...stack_f}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])

                }

                if(this.props.TenureHouseholdIncome){
                    let year = parseFloat(this.state.value);
                    let responseData = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataOwner =[]
                    let axisDataOwner = []
                    let stackDataRenter = []
                    let axisDataRenter = []
                    let axisData = []
                    let stackData =[];
                    Object.keys(responseData).forEach(function (res, index) {
                        if (index >=2){
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>1 && i <14){
                                            if (res === subvar.value) {
                                                axisDataOwner.push({
                                                    "Tenure": subvar.name,
                                                    "HouseholdIncomeOwner": responseData[res],
                                                    "OwnerColor": "#82BDCF"
                                                })
                                                stackDataOwner.push({
                                                    "Tenure": subvar.name,
                                                    "HouseholdIncomeOwner": responseData[res],
                                                    "OwnerColor": "#82BDCF"
                                                })
                                            }
                                        }
                                        if (i>13){
                                            if (res === subvar.value) {
                                                axisDataRenter.push({
                                                    "Tenure": subvar.name,
                                                    "HouseholdIncomeRenter": -(responseData[res]),
                                                    "RenterColor": "#E295A0"
                                                })
                                                stackDataRenter.push({
                                                    "Tenure": subvar.name,
                                                    "HouseholdIncomeRenter": -(responseData[res]),
                                                    "RenterColor": "#E295A0"
                                                })
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    })


                    Object.values(axisDataRenter).forEach(function (axis_r, i) {
                        let obj = {...axisDataOwner[i], ...axis_r}
                        axisData.push(obj)
                    })
                    Object.values(stackDataRenter).forEach(function (stack_r, i) {
                        let obj = {...stackDataOwner[i], ...stack_r}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])

                }
                if(this.props.MortgageStatus){
                    let year = parseFloat(this.state.value);
                    let responseData = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataMortgage =[]
                    let axisDataMortgage = []
                    let stackDataNoMortgage = []
                    let axisDataNoMortgage = []
                    let axisData = []
                    let stackData =[];
                    Object.keys(responseData).forEach(function (res, index) {
                        if (index >=2){
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>1 && i <20){
                                            if (res === subvar.value) {
                                                axisDataMortgage.push({
                                                    "Cost": subvar.name,
                                                    "MortgageUnits": responseData[res],
                                                    "MortgageColor": "#82BDCF"
                                                })
                                                stackDataMortgage.push({
                                                    "Cost": subvar.name,
                                                    "MortgageUnits": responseData[res],
                                                    "MortgageColor": "#82BDCF"
                                                })
                                            }
                                        }
                                        if (i>19){
                                            if (res === subvar.value) {
                                                axisDataNoMortgage.push({
                                                    "Cost": subvar.name,
                                                    "NoMortgageUnits": -(responseData[res]),
                                                    "NoMortgageColor": "#E295A0"
                                                })
                                                stackDataNoMortgage.push({
                                                    "Cost": subvar.name,
                                                    "NoMortgageUnits": -(responseData[res]),
                                                    "NoMortgageColor": "#E295A0"
                                                })
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    })


                    Object.values(axisDataNoMortgage).forEach(function (axis_n, i) {
                        let obj = {...axisDataMortgage[i], ...axis_n}
                        axisData.push(obj)
                    })
                    Object.values(stackDataNoMortgage).forEach(function (stack_n, i) {
                        let obj = {...stackDataMortgage[i], ...stack_n}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])

                }
                if(this.props.MortgageStatusPercent){
                    let year = parseFloat(this.state.value);
                    let responseData = response.json.acs[this.props.geoid][year];
                    let censusConfig = response.json.acs.config;
                    let stackDataMortgage =[]
                    let axisDataMortgage = []
                    let stackDataNoMortgage = []
                    let axisDataNoMortgage = []
                    let axisData = []
                    let stackData =[];

                    Object.keys(responseData).forEach(function (res, index) {
                        if (index >=2){
                            Object.keys(censusConfig).forEach(function (config) {
                                if (res.slice(0, -5) === config) {
                                    Object.values(censusConfig[config].variables).forEach(function (subvar,i) {
                                        if (i>1 && i <11){
                                            if (res === subvar.value) {
                                                axisDataMortgage.push({
                                                    "Percent": subvar.name,
                                                    "MortgageUnits": responseData[res],
                                                    "MortgageColor": "#82BDCF"
                                                })
                                                stackDataMortgage.push({
                                                    "Percent": subvar.name,
                                                    "MortgageUnits": responseData[res],
                                                    "MortgageColor": "#82BDCF"
                                                })
                                            }
                                        }
                                        if (i>12 && i <21){
                                            if (res === subvar.value) {
                                                axisDataNoMortgage.push({
                                                    "Percent": subvar.name,
                                                    "NoMortgageUnits": responseData[res],
                                                    "NoMortgageColor": "#E295A0"
                                                })
                                                stackDataNoMortgage.push({
                                                    "Percent": subvar.name,
                                                    "NoMortgageUnits": responseData[res],
                                                    "NoMortgageColor": "#E295A0"
                                                })
                                            }
                                        }

                                    })
                                }
                            })
                        }
                    })
                    Object.values(axisDataNoMortgage).forEach(function (axis_n, i) {
                        let obj = {...axisDataMortgage[i], ...axis_n}
                        axisData.push(obj)
                    })
                    Object.values(stackDataNoMortgage).forEach(function (stack_n, i) {
                        let obj = {...stackDataMortgage[i], ...stack_n}
                        stackData.push(obj)
                    })

                    resolve([axisData,stackData])

                }




                })
            })



    }


    render () {
        const style={
            height: "100%"
        }

        if (this.props.PopulationByAge === true) {
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.FemaleColor1,d.MaleColor1))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="age"
            keys={["Male","Female"]}
            padding={0.3}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-12000}
            maxValue={12000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'FEMALE POPULATION',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'MALE POPULATION',
                        legendPosition: 'bottom-right',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'Age',
                        legendPosition: 'bottom-right',
                        legendOrientation: 'horizontal',
                        legendOffsetX: 300,
                        legendOffsetY: -300
                    }
                    ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 2,
                        "symbolSize": 20
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>
        )
        }

        if(this.props.PovertyPopulationBySex){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.MaleColorP,d.MaleColorNP,d.FemaleColorP,d.FemaleColorNP))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="age"
            keys={["MalePoverty","MaleNotPoverty","FemalePoverty","FemaleNotPoverty"]}
            padding={0.5}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-30000}
            maxValue={30000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'FEMALES',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
            {
                axis: 'x',
                    value: 0,
                legend: 'MALES',
                    legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetY: 420,
            },
            {
                axis: 'x',
                    value: 0,
                legend: 'Age',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetX: 300,
                legendOffsetY: -300
            }
        ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 5,
                        "symbolSize": 20
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>
        )
        }

        if(this.props.CivilianStatus){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.MaleColorV,d.MaleColorNV,d.FemaleColorV,d.FemaleColorNV))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="age"
            keys={["MaleVeteran","MaleNotVeteran","FemaleVeteran","FemaleNotVeteran"]}
            padding={0.8}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-45000}
            maxValue={45000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'FEMALES',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
            {
                axis: 'x',
                    value: 0,
                legend: 'MALES',
                    legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetY: 420,
            },
            {
                axis: 'x',
                    value: 0,
                legend: 'Age',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetX: 300,
                legendOffsetY: -300
            }
        ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 5,
                        "symbolSize": 20
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>

            )
        }

        if(this.props.schoolEnrollmentAge){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.MaleColorPrivate,d.MaleColorPublic,d.FemaleColorPrivate,d.FemaleColorPublic))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="age"
            keys={["Males in Private school","Males in Public school","Females in Private school","Females in Public school"]}
            padding={0.8}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-10000}
            maxValue={10000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'FEMALES enrolled in school',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
            {
                axis: 'x',
                    value: 0,
                legend: 'MALES enrolled in school',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetY: 420,
            },
            {
                axis: 'x',
                    value: 0,
                legend: 'Age',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetX: 300,
                legendOffsetY: -300
            }
        ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 40,
                        "symbolSize": 10
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>

        )
        }

        if(this.props.TenureHouseholdIncome){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.RenterColor,d.OwnerColor))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="Tenure"
            keys={["HouseholdIncomeRenter","HouseholdIncomeOwner"]}
            padding={0.8}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-20000}
            maxValue={20000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'Renter Occupied',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
            {
                axis: 'x',
                    value: 0,
                legend: 'Owner Occupied',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetY: 420,
            },
            {
                axis: 'x',
                    value: 0,
                legend: 'Tenure',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetX: 300,
                legendOffsetY: -300
            }
        ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 40,
                        "symbolSize": 10
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>

        )
        }
        if(this.props.MortgageStatus){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.NoMortgageColor,d.MortgageColor))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="Cost"
            keys={["NoMortgageUnits","MortgageUnits"]}
            padding={0.8}
            layout = "horizontal"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={-15000}
            maxValue={15000}
            enableGridX = {true}
            enableGridY={false}
            axisTop={{tickSize: 0,
                tickPadding: 12,
                format: v => `${Math.abs(v)}`
            }}
            axisBottom={{
                legendOffset: 50,
                    tickSize: 0,
                    tickPadding: 12,
                    format: v => `${Math.abs(v)}`
            }}
            axisLeft={{
                "orient": "left",
                    "tickSize": 5,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            markers={[
                    {
                        axis: 'x',
                        value: 0,
                        legend: 'No Mortgage Units',
                        legendPosition: 'bottom-left',
                        legendOrientation: 'horizontal',
                        legendOffsetY: 420,
                    },
            {
                axis: 'x',
                    value: 0,
                legend: 'Mortgage Units',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetY: 420,
            },
            {
                axis: 'x',
                    value: 0,
                legend: 'Tenure',
                legendPosition: 'bottom-right',
                legendOrientation: 'horizontal',
                legendOffsetX: 300,
                legendOffsetY: -300
            }
        ]}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "bottom",
                        "direction": "row",
                        "translateX": 30,
                        "translateY": 65,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 40,
                        "symbolSize": 10
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>

        )
        }
        if(this.props.MortgageStatusPercent){
            let colors = [];
            if(this.props.colorRange !== undefined && this.props.colorRange.length > 0){
                colors = this.props.colorRange;
            }else{
                this.state.graphData1.map(d => colors.push(d.MortgageColor,d.NoMortgageColor))
            }
            return(
                <div style={style}>
                <ResponsiveBar
            data={this.state.graphData1}
            margin={{
                top: 60,
                    right: 80,
                    bottom: 60,
                    left: 80
            }}
            indexBy="Percent"
            keys={["MortgageUnits","NoMortgageUnits"]}
            padding={0.5}
            layout = "vertical"
            groupMode="grouped"
            labelTextColor="inherit:darker(1.6)"
            labelSkipWidth={16}
            labelSkipHeight={16}
            labelFormat= ".0s"
            minValue={0}
            maxValue={15000}
            enableGridX = {true}
            enableGridY={false}
            enableLabel={false}
            axisBottom={{
                "orient": "bottom",
                    "tickSize": 2,
                    "tickPadding": 5,
                    "tickRotation": -27,
                    "legendPosition": "middle",
                    "legendOffset": -50,

            }}
            axisLeft={{
                "tickSize": 2,
                    "tickPadding": 5,
                    "tickRotation": 0,
                    "legend": 'Housing Units by Selected Monthly Owner Costs as a Percent of Household Income',
                    "legendPosition": 'middle',
                    "legendOffset": -50
            }}
            legends={[
                    {
                        "dataFrom": "keys",
                        "anchor": "right",
                        "direction": "column",
                        "translateX": 70,
                        "translateY": 0,
                        "itemWidth": 100,
                        "itemHeight": 20,
                        "itemsSpacing": 40,
                        "symbolSize": 10
                    }
                    ]}
            tooltipFormat={value => `${Math.abs(value)}`
        }
            colors={colors}
            />
            <label><h4>{this.state.value}</h4>
            <input
            id="typeinp"
            type="range"
            min='2010'max='2016'
            value={this.state.value}
            onChange={this.handleChange}
            step="1" />
                </label>
                </div>

        )
        }
        }


    static defaultProps = {
        censusKey: [],
        geoid: [],
        compareGeoid: [],
        PopulationByAge: false,
        PovertyPopulationBySex: false,
        CivilianStatus: false,
        MortgageStatusPercent:false,
        MortgageStatus:false,
        schoolEnrollmentAge:false,
        TenureHouseholdIncome:false,
        colorRange:[]

    }

}


const mapDispatchToProps = { };

const mapStateToProps = (state,ownProps) => {
    return {
        geoid:ownProps.geoid,
        graph: state.graph // so componentWillReceiveProps will get called.
    };
};
export default connect(mapStateToProps, mapDispatchToProps)(reduxFalcor(CensusStackedBarChart))
