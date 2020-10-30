let topojson = require('topojson')
const HOST = '/';


class geoApi {
    constructor () {
        this.data = {}
    }

    getData (geoid) {
        return new Promise((resolve, reject) => {
            if(this.data[geoid]) {
                resolve(this.data[geoid]);
            }
            else {
                fetch(`${HOST}geo/counties-10m.json`, {
                    headers: { 'Content-Type':'application/json' }
                })
                    .then(response => {
                        return response.json()
                    })
                    .then(geoResponse => {
                        let geo = {
                            type: "Topology",
                            bbox : geoResponse['bbox'],
                            transform : geoResponse['transform'],
                            objects : {
                                counties: {type:"GeometryCollection",geometries:geoResponse.objects.counties.geometries.filter( d => d.id.slice(0,2) === geoid)},
                                states:{type:"GeometryCollection",geometries: geoResponse.objects.states.geometries.filter(d => d.id === geoid)},
                                nation:geoResponse.objects.nation
                            },
                            arcs: geoResponse["arcs"]
                        }
                        this.data[geoid] = geo
                        resolve(geo);
                    })
            }

        })
    }

    getChildGeo (geoid, type) {
        return new Promise((resolve, reject) => {
            this.getData(geoid).then(topology  => {
                resolve(
                    topojson.feature(topology, topology.objects[type])
                )
            })
        })
    }

    getGeoMesh (geoid, type) {
        return new Promise((resolve, reject) => {
            this.getData(geoid).then(topology  => {
                resolve({
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        properties: { geoid },
                        geometry: topojson.mesh(topology, topology.objects[type])
                    }]
                })
            })
        })
    }

    getGeoMerge (geoid, type) {
        return new Promise((resolve, reject) => {
            this.getData(geoid).then(topology  => {
                resolve({
                    type: "FeatureCollection",
                    features: [{
                        type: "Feature",
                        properties: { geoid },
                        geometry: topojson.merge(topology, topology.objects[type].geometries)
                    }]
                })
            })
        })
    }


}

export default geoApi
