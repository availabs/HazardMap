export const MapSources = [{
                id: "composite",
                source: {
                    "url": "mapbox://lobenichou.albersusa,lobenichou.albersusa-points",
                    "type": "vector"
                }
            },
            {
                id: "albersusa",
                source: {
                    "url": "mapbox://lobenichou.albersusa",
                    "type": "vector"
                }
            },
            {
                id:'albersusa_cousubs',
                source:{
                    "url":"mapbox://am3081.8xwbxcmy",
                    "type":"vector"
                }
            },
            {
                id:'albersusa_zip_codes',
                source:{
                    "url":"mapbox://am3081.4jgx8fkw",
                    "type":"vector"
                }
            },
            {
                id:'albersusa_tracts',
                source:{
                    "url":"mapbox://am3081.2n3as7pn",
                    "type":"vector"
                }
            }]

export const MapStyles = [{
                "id": "counties",
                "type": "fill",
                "source": "albersusa",
                "source-layer": "albersusa",
                "filter": ["match", ["get", "type"], ["county_fips"], true, false],
                "layout": {},
                "paint": {
                    "fill-color": "hsl(0, 3%, 94%)",
                    /*"fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0,
                        1
                    ],
                    "fill-outline-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "rgba(0,0,0,100)",//"hsl(0, 0%, 100%)",
                        "rgba(0,0,0,0)"
                    ],*/
                }
            },
            {
                "id": "county-boundaries",
                "type": "line",
                "source": "albersusa",
                "source-layer": "albersusa",
                "layout": {},
                "paint": {
                    "line-color": 'rgba(0,0,0,0)',
                    'line-opacity':0.7,
                    'line-width':3
                    }
            },
            {
                "id": "cousubs",
                "type": "fill",
                "source": "albersusa_cousubs",
                "source-layer": "albersusa_cousubs",
                "filter": ["match", ["get", "type"],["geoid"],true, false],
                "layout": {},
                "paint": {
                    "fill-color": "hsl(0, 3%, 94%)",
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0,
                        1
                    ],
                    "fill-outline-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "hsl(0, 4%, 85%)",
                        "hsl(0, 4%, 85%)"
                    ],
                }
            },
            {
                "id": "tracts",
                "type": "fill",
                "source": "albersusa_tracts",
                "source-layer": "albersusa_tracts",
                "filter": ["match", ["get", "type"],["geoid"],true, false],
                "layout": {},
                "paint": {
                    "fill-color": "hsl(0, 3%, 94%)",
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0,
                        1
                    ],
                    "fill-outline-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "hsl(0, 4%, 85%)",
                        "hsl(0, 4%, 85%)"
                    ],
                }
            },
            {
                "id": "zipcodes",
                "type": "fill",
                "source": "albersusa_zip_codes",
                "source-layer": "albersusa_zip_codes",
                "filter": ["match", ["get", "type"],["ZCTA5CE10"],true, false],
                "layout": {},
                "paint": {
                    "fill-color": "hsl(0, 3%, 94%)",
                    "fill-opacity": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        0,
                        1
                    ],
                    "fill-outline-color": [
                        "case",
                        ["boolean", ["feature-state", "hover"], false],
                        "hsl(0, 4%, 85%)",
                        "hsl(0, 4%, 85%)"
                    ],
                }
            },
            {
                "id": "states",
                "type": "fill",
                "source": "albersusa",
                "source-layer": "albersusa",
                    "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {
                },
                "paint": {
                    "fill-color": "rgba(0,0,0,0)",
                }
            },
            {
                "id": "state-boundaries",
                "type": "line",
                "source": "composite",
                "source-layer": "albersusa",
                "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {},
                "paint": {"line-color": "hsl(0, 0%, 72%)", "line-width": 0.5}
            },
            {
                "id": "county-points",
                "type": "symbol",
                "source": "composite",
                "source-layer": "albersusa-points",
                "filter": ["match", ["get", "type"], ["county"], true, false],
                "layout": {
                    "text-field": ["to-string", ["get", "county_fips"]],
                    "text-font": ["Overpass Mono Bold", "Arial Unicode MS Regular"],
                    "visibility": "none"
                },
                "paint": {
                    "text-color": "hsl(0, 0%, 100%)",
                    "text-halo-color": "hsl(0, 0%, 6%)",
                    "text-halo-width": 1,
                    "text-opacity": ["step", ["zoom"], 0, 6, 1]
                }
            },
            {
                "id": "state-points",
                "type": "symbol",
                "source": "composite",
                "source-layer": "albersusa-points",
                "filter": ["match", ["get", "type"], ["state"], true, false],
                "layout": {
                    "text-field": ["to-string", ["get", "state_abbrev"]],
                    "text-font": ["Open Sans Regular", "Arial Unicode MS Regular"],
                },
                "paint": {
                    "text-color": "hsl(0, 0%, 25%)",
                    "text-opacity": ["step", ["zoom"], 1, 6, 0],
                    "text-halo-color": "hsl(0, 0%, 100%)",
                    "text-halo-width": 1
                }
            }]
