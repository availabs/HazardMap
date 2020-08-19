import argparse, csv, os, psycopg2

from config import host

HAZARDS = [
    'wind',
    'wildfire',
    'tsunami',
    'tornado',
    'riverine',
    'lightning',
    'landslide',
    'icestorm',
    'hurricane',
    'heatwave',
    'hail',
    'earthquake',
    'drought',
    'avalanche',
    'coldwave',
    'winterweat',
    'volcano',
    'coastal'
]

HAZARDS_TO_SEVERE_WEATHER = {
# Uncategorized:
# "Marine Dense Fog"
# "OTHER"
# "Dust Storm"
# "Astronomical Low Tide"
# "Northern Lights"
# "Dense Smoke"
# "Freezing Fog"
# "Dust Devil"
# "HAIL FLOODING"
# "Heavy Rain"
# "Dense Fog"
    'wind': [
        'High Wind',
        'Strong Wind',
        'Marine High Wind',
        'Marine Strong Wind',
        'Marine Thunderstorm Wind',
        'Thunderstorm Wind',
        'THUNDERSTORM WINDS LIGHTNING',
        'TORNADOES, TSTM WIND, HAIL',
        'THUNDERSTORM WIND/ TREES',
        'THUNDERSTORM WINDS HEAVY RAIN',
        "Heavy Wind",
        "THUNDERSTORM WINDS/FLASH FLOOD",
        "THUNDERSTORM WINDS/ FLOOD",
        "THUNDERSTORM WINDS/HEAVY RAIN",
        "THUNDERSTORM WIND/ TREE",
        "THUNDERSTORM WINDS FUNNEL CLOU",
        "THUNDERSTORM WINDS/FLOODING"
    ],
    'wildfire': ['Wildfire'],
    'tsunami': [
        'Tsunami',
        "Seiche"
    ],
    'tornado': [
        'Tornado',
        'TORNADOES, TSTM WIND, HAIL',
        "TORNADO/WATERSPOUT",
        "Funnel Cloud",
        "Waterspout"
    ],
    'riverine': [
        'Flood',
        'Flash Flood',
        "THUNDERSTORM WINDS/FLASH FLOOD",
        "THUNDERSTORM WINDS/ FLOOD"
    ],
    'lightning': [
        'Lightning',
        'THUNDERSTORM WINDS LIGHTNING',
        "Marine Lightning"
    ],
    'landslide': [
        'Landslide',
        "Debris Flow"
    ],
    'icestorm': ['Ice Storm', "Sleet"],
    'hurricane': [
        'Hurricane',
        'Hurricane (Typhoon)',
        "Marine Hurricane/Typhoon",
        "Marine Tropical Storm",
        "Tropical Storm",
        'Hurricane Flood'
    ],
    'heatwave': [
        'Heat',
        'Excessive Heat'
    ],
    'hail': [
        'Hail',
        'Marine Hail',
        'TORNADOES, TSTM WIND, HAIL',
        'HAIL/ICY ROADS',
        "HAIL FLOODING"
    ],
    'earthquake': [],
    'drought': ['Drought'],
    'avalanche': ['Avalanche'],
    'coldwave': [
        'Cold/Wind Chill',
        'Extreme Cold/Wind Chill',
        "Frost/Freeze",
        "Cold/Wind Chill"
        
    ],
    'winterweat': [
        'Winter Weather',
        'Winter Storm',
        'Heavy Snow',
        'Blizzard',
        "High Snow",
        "Lake-Effect Snow"
    ],
    'volcano': [
        'Volcanic Ash',
        'Volcanic Ashfall'
    ],
    'coastal': [
        'High Surf',
        "Marine Tropical Storm",
        "Sneakerwave",
        "Storm Surge/Tide",
        "Tropical Depression",
        "Marine Tropical Depression",
        "Rip Current",
        'Coastal Flood',
        'Lakeshore Flood'
    ]
} # END HAZARDS_TO_SEVERE_WEATHER
SEVERE_WEATHER_TO_HAZARDS = {}
for hazard in HAZARDS_TO_SEVERE_WEATHER:
    sw = HAZARDS_TO_SEVERE_WEATHER[hazard]
    for h in sw:
        if h not in SEVERE_WEATHER_TO_HAZARDS:
            SEVERE_WEATHER_TO_HAZARDS[h] = []
        SEVERE_WEATHER_TO_HAZARDS[h].append(hazard)

TRACTS_PER_COUNTY = {}
COUNTY_TOTALS = {}
TRACT_TOTALS = {}

def getTracts(cursor):
	print "RETRIEVING TRACTS..."
	sql = """
		SELECT geoid
		FROM geo.tl_2017_tract
		WHERE geoid LIKE '36%';
	"""
	cursor.execute(sql)
	print "RETRIEVED TRACKS.\n"
	return [r[0] for r in cursor]

def getEvents(cursor):
	print "RETRIEVING EVENTS..."
	sql = """
		SELECT geoid, event_type, sum(property_damage + crop_damage)
  		FROM severe_weather.details
  		WHERE geoid LIKE '36%'
  		GROUP BY 1, 2;
	"""
	cursor.execute(sql)
	print "RETRIEVED EVENTS.\n"
	return [[r[0], r[1], float(r[2])] for r in cursor]

def createTable(cursor):
	print "CREATING TABLE..."
	sql = """
		DROP TABLE IF EXISTS severe_weather.total_damage_by_tract;
		CREATE TABLE severe_weather.total_damage_by_tract (
			geoid VARCHAR(11),
			{}
		)
	""".format(", ".join(map(lambda h: "{} NUMERIC".format(h), HAZARDS)))
	cursor.execute(sql)
	print "TABLE CREATED.\n"

def prepareStatement(cursor):
	columns = ",".join(["geoid"] + HAZARDS)
	variables = ",".join(['$' + str(i + 1) for i in range(len(HAZARDS) + 1)])
	sql = """
		INSERT INTO severe_weather.total_damage_by_tract({})
		VALUES ({})
	""".format(columns, variables)
	cursor.execute("PREPARE stmt AS {}".format(sql))

def deallocateStatement(cursor):
	cursor.execute("DEALLOCATE stmt")

def main():
    connection = psycopg2.connect(host)
    cursor = connection.cursor()
    
    for tract in getTracts(cursor):
        county = tract[0:5]
        if not county in TRACTS_PER_COUNTY:
            TRACTS_PER_COUNTY[county] = 0

        TRACTS_PER_COUNTY[county] += 1

        if not county in COUNTY_TOTALS:
            COUNTY_TOTALS[county] = {}
            for hazard in HAZARDS:
                COUNTY_TOTALS[county][hazard] = 0

        TRACT_TOTALS[tract] = {}
        for hazard in HAZARDS:
            TRACT_TOTALS[tract][hazard] = 0

    for event in getEvents(cursor):
        geoid = event[0]
        sw = event[1]
        total = event[2]
        if not sw in SEVERE_WEATHER_TO_HAZARDS:
            continue

        for hazard in SEVERE_WEATHER_TO_HAZARDS[sw]:
            if (len(geoid) == 5) and (geoid in COUNTY_TOTALS):
                COUNTY_TOTALS[geoid][hazard] += total
            elif geoid in TRACT_TOTALS:
                TRACT_TOTALS[geoid][hazard] += total

    for k in COUNTY_TOTALS:
        for h in HAZARDS:
            COUNTY_TOTALS[k][h] /= TRACTS_PER_COUNTY[k]

    for k in TRACT_TOTALS:
        for h in HAZARDS:
            TRACT_TOTALS[k][h] += COUNTY_TOTALS[k[0:5]][h]

    createTable(cursor)

    prepareStatement(cursor)

    inserts = ",".join(["%s" for i in range(len(HAZARDS) + 1)])
    sql = """
		EXECUTE stmt({})
	""".format(inserts)

    print "INSERTING DATA INTO TABLE..."
    for geoid in TRACT_TOTALS:
        row = [geoid]
        for hazard in HAZARDS:
            row.append(round(TRACT_TOTALS[geoid][hazard], 2))
        
        cursor.execute(sql, row)
    print "COMPLETED DATA INSERTS.\n"

    deallocateStatement(cursor)

    connection.commit()

    cursor.close()
    connection.close()
# END main

if __name__ == "__main__":
	main()