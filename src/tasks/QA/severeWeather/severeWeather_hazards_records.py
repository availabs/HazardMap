'''
run this file using the command python3 severeWeather_hazards_records.py wind riverine
give as many hazards as needed
'''

import argparse, csv, io, psycopg2,sys,pandas,numpy as np

import database_config

hazards2severeWeather = {
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
    "THUNDERSTORM WINDS/ FLOOD",
    'Coastal Flood',
    'Lakeshore Flood'

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
    "Tropical Depression",
    "Marine Tropical Depression",
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
'earthquake': [''],
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
    "Sneakerwave",
    "Storm Surge/Tide",
    "Rip Current"
]
}

EARLIEST_YEAR = 1996
LATEST_YEAR = 2018

def calculate(cursor):
    hazards = sys.argv[1:]
    results = []
    for hazard in hazards:
        sql = """
                with t as
            ( select sum(property_damage) as total_property_damage,
              count(*) as total_records
            from severe_weather.details
            where event_type IN """+"("+str(hazards2severeWeather[hazard]).strip('[]')+")"+"""
            )
            select
            """+"'"+str(hazard)+"'"+""" as hazard,
            count(geoid) as total_geoid_not_null_records,
            t.total_records as total_geoid_records,
            ROUND(count(*) * 100.0 / t.total_records, 2) as geoid_records_percentage,
            sum(property_damage) as total_property_damage_geoid_not_null,
            t.total_property_damage as total_property_damage,
            ROUND(sum(property_damage) * 100.0 / t.total_property_damage, 2) as property_damage_records_percentage
            from severe_weather.details,
            t
            WHERE geoid is not null and cousub_geoid is not null and tract_geoid is not null
            and event_type IN """+"("+str(hazards2severeWeather[hazard]).strip('[]')+")"+"""
            AND year >= """+str(EARLIEST_YEAR)+"""
            GROUP BY t.total_property_damage,t.total_records
        """
        cursor.execute(sql)
        test = cursor.fetchall()
        print(test)
        if len(test) == 0:
            results.append([(hazard,"0","0","0","0","0","0")])
        else:
            results.append(test)

    output = pandas.DataFrame(data=np.concatenate(results),
                           index=None,
                           columns=["hazard", "total_geoid_not_null_records","total_geoid_records","geoid_records_percentage","total_property_damage_geoid_not_null","total_property_damage","property_damage_records_percentage"])

    output.to_csv("csv/hazards_data_output.csv")


def main():

    connection = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
                                  database=database_config.DATABASE_CONFIG['dbname'],
                                  user=database_config.DATABASE_CONFIG['user'],
                                  port=database_config.DATABASE_CONFIG['port'],
                                  password=database_config.DATABASE_CONFIG['password'])
    cursor = connection.cursor()

    calculate(cursor)

    cursor.close()
    connection.close()

if __name__ == "__main__":
    main()
