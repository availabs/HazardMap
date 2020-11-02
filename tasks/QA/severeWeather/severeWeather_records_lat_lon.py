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
    ( select
    count(*) as total_records
    from severe_weather.details
    WHERE year >= """+str(EARLIEST_YEAR)+"""
    )
		select
		count(*) as records_with_lat_lon,
		t.total_records as total_records,
		ROUND(count(*) * 100.0 / t.total_records, 2) as records_with_lat_lon_percentage
		from severe_weather.details,
		t
		WHERE begin_lat is not null and begin_lon is not null
		AND geoid is not null and cousub_geoid is not null and tract_geoid is not null 
		AND year  >= """+str(EARLIEST_YEAR)+"""
		GROUP BY t.total_records
    """
    cursor.execute(sql)
    results = pandas.DataFrame(np.array(cursor.fetchall()))
    results.to_csv("csv/severeWeather_records_lat_lon.csv", index=False,header=["records_with_lat_lon","total_records","records_with_lat_lon_percentage"])



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
