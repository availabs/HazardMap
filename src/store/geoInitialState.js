const fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
let result = {}
let mesh = {"mesh":{}}
let merge = {"merge":{}}
fips.forEach((fip) =>{
    result[fip] = {
        "counties": {
            "type": "FeatureCollection",
            "features": []
        },
        "cousubs": {
            "type": "FeatureCollection",
            "features": []
        },
        "tracts": {
            "type": "FeatureCollection",
            "features": []
        },
        "zips": {
            "type": "FeatureCollection",
            "features": []
        }
    }
    mesh["mesh"][fip] = {
        "counties": {
            "type": "FeatureCollection",
            "features": []
        },
        "cousubs": {
            "type": "FeatureCollection",
            "features": []
        },
        "tracts": {
            "type": "FeatureCollection",
            "features": []
        },
        "zips": {
            "type": "FeatureCollection",
            "features": []
        }
    }
    merge["merge"][fip] = {
        "counties": {
            "type": "FeatureCollection",
            "features": []
        },
        "cousubs": {
            "type": "FeatureCollection",
            "features": []
        },
        "tracts": {
            "type": "FeatureCollection",
            "features": []
        },
        "zips": {
            "type": "FeatureCollection",
            "features": []
        }
    }
})
let InitialStateJSON = {}
InitialStateJSON = {...result,...merge,...mesh}
export default InitialStateJSON

