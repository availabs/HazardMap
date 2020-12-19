let years = []
const start_year = 1996
const end_year = 2019
for(let i = start_year; i <= end_year; i++) {
    years.push(i)
}
const Hazards = [
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

let hazards = Hazards.reduce((a,c) =>{
    a.push(c.value)
    return a
},[])

const config = {
    'fips': ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"],
    'years': years,
    'hazards': hazards,
    'Hazards': Hazards,
    'stormevents' : {
        data_columns: ['total_damage', 'num_episodes','property_damage','crop_damage','num_episodes','num_events','state','state_fips','annualized_damage'],
        sort: 'annualized_damage',
        graph_column : ['total_damage'],
        table_column : ['total_damage', 'annualized_damage', 'num_episodes'],
        table_header : ['Damage','Yearly Avg Damage','# Episodes'],
        map_column: ['total_damage'],
        fetch_url : 'severeWeather',
        popover : [
            {
                'name' : 'Property Damage',
                'value' : 'property_damage',
                type: 'fnum'
            },
            {
                'name' : 'Crop Damage',
                'value' : 'crop_damage',
                type: 'fnum'
            },
            {
                'name' : 'Injuries',
                'value' : 'injuries',
                type: 'fmt'
            },
            {
                'name' : 'Property Damage',
                'value' : 'property_damage',
                type: 'fnum'
            },
            {
                'name' : 'Fatalities',
                'value' : 'fatalities',
                type : 'fmt'
            },
        ],
        measure : 'total_damage',
        counties_domain : [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000],
        other_domain : [10000, 50000, 100000, 1000000, 10000000, 100000000]

    },
    'sba':{
        data_columns: ['total_loss','loan_total','num_loans','state_abbrev'],
        sort: 'total_loss',
        graph_column : ['total_loss'],
        table_column : ['total_loss', 'loan_total', 'num_loans'],
        table_header: ['Total Loss',' $ Loan','# Loans'],
        fetch_url : 'sba.all',
        popover : [
            {
                'name' : 'Total Loss',
                'value' : 'total_loss',
                //type: fnum
            },
            {
                'name' : 'Total Loan',
                'value' : 'loan_total',
                //type: fnum
            },
            {
                'name' : '# Loans',
                'value' : 'num_loans',
                //type: fmt
            },

        ],
        measure: 'total_loss',
        counties_domain : [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000],
        other_domain : [10000, 50000, 100000, 1000000, 10000000, 100000000]
    },
    'fema' :{
        data_columns: [
            'ia_ihp_amount',
            'ia_ihp_count',
            'pa_project_amount',
            'pa_federal_share_obligated',
            'hma_prop_actual_amount_paid',
            'hma_prop_number_of_properties',
            'hma_proj_project_amount',
            'hma_proj_project_amount_count',
            'hma_proj_federal_share_obligated',
            'hma_proj_federal_share_obligated_count',
            'total_cost',
            "total_cost_summaries",
            "total_disasters"
        ],
        sort: 'total_cost',
        graph_column : ['total_cost'],
        table_column : ["total_cost","total_cost_summaries"],
        table_header: ['$ Total Cost','$ Total Cost Summaries'],
        fetch_url: 'fema.disasters',
        popover : [
            {
                'name' : 'Total Cost',
                'value' : 'total_cost',
                //type: fnum
            },
            {
                'name' : '# Episodes',
                'value' : 'total_disasters',
                //type: fmt
            },

        ],
        measure: 'total_cost',
        counties_domain: [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000],
        other_domain : [1000000, 5000000, 10000000, 100000000, 1000000000, 10000000000]
    }
}

module.exports = config
