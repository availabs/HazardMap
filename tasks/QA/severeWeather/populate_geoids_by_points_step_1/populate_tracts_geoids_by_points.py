import argparse, csv, io, psycopg2,sys,pandas,numpy as np,sys

import database_config

EARLIEST_YEAR = 1996
LATEST_YEAR = 2018
fips = ["01", "02", "04", "05","06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
        "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35","36","37", "38", "39", "40", "41", "42", "44", "45", "46",
        "47", "48", "49", "50", "51", "53", "54", "55", "56","72"]
new_fips =['81','84','85','86','87','88','89','90','91','92','93','94','95','96','97','98','99']
print(len(fips))

def calculate(cursor):
    fip = sys.argv[1]
    print(fip)
    geo_table_name = 'geo.tl_2017_' + fip + '_tract'
    sql="""
        with t as (
              SELECT event_id,begin_lat,begin_lon,geoid,cousub_geoid,tract_geoid,state_fips,year
              FROM severe_weather.details
              where begin_lat is not null and begin_lon is not null
              and state_fips = """+str(fip)+"""
              and year >= """+str(EARLIEST_YEAR)+"""
              ),
		s as (
		SELECT t.event_id as event_id,a.geoid as geoid
        FROM """+geo_table_name+""" as a
        JOIN t on ST_CONTAINS(a.geom,ST_SetSRID(ST_Point(t.begin_lon,t.begin_lat), 4326))
        WHERE t.state_fips = """+str(fip)+"""
		and t.year >= """+str(EARLIEST_YEAR)+"""
		)
		
		UPDATE severe_weather.details as b
		SET tract_geoid = s.geoid
		FROM s
		WHERE b.event_id = s.event_id
        """
    cursor.execute(sql)

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
