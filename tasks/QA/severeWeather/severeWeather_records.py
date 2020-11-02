# /*
# # for calculating the (#of records with geoid)/(# of total records)
# # for calculating the (sum of property damage with geoid)/(# sum of property damage for all records)
# */

import argparse, csv, io, psycopg2,sys,pandas,numpy as np

import database_config

EARLIEST_YEAR = 1996
LATEST_YEAR = 2018

def calculate(cursor):
    sql = """
         with t as
    ( select sum(property_damage) as total_property_damage,
	  count(*) as total_records
    from severe_weather.details
    WHERE year >= """+str(EARLIEST_YEAR)+"""
    )
select
count(*) as total_geoid_not_null_records,
t.total_records as total_geoid_records,
ROUND(count(*) * 100.0 / t.total_records, 2) as geoid_records_percentage,
sum(property_damage) as total_property_damage_geoid_not_null,
t.total_property_damage as total_property_damage,
ROUND(sum(property_damage) * 100.0 / t.total_property_damage, 2) as property_damage_records_percentage
from severe_weather.details,
	t
	WHERE geoid is not null and cousub_geoid is not null and tract_geoid is not null
	AND year >= """+str(EARLIEST_YEAR)+"""
	GROUP BY t.total_property_damage,t.total_records
    """
    cursor.execute(sql)
    results = pandas.DataFrame(np.array(cursor.fetchall()))
    results.to_csv("csv/severeWeather_records.csv", index=False,header=["total_geoid_not_null_records","total_geoid_records","geoid_records_percentage","total_property_damage_geoid_not_null","total_property_damage","property_damage_records_percentage"])



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
