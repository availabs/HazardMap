import argparse, csv, io, psycopg2,sys,pandas,numpy as np

import database_config

EARLIEST_YEAR = 1996
LATEST_YEAR = 2018
fips = ['01', '02', '04', '05','06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
        '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35','37', '38', '39', '40', '41', '42', '44', '45', '46',
        '47', '48', '49', '50', '51', '53', '54', '55', '56','72']

def calculate(cursor):
    fip = sys.argv[1]
    print(fip)
    geo_table_name = 'geo.tl_2017_' + fip + '_cousub'
    sql="""
        with t as (
              SELECT event_id,begin_lat,begin_lon,geoid,cousub_geoid,tract_geoid,state_fips,year
              FROM severe_weather.details
              where begin_lat is not null and begin_lon is not null
              and state_fips = """+str(fip)+"""
              and year >= """+str(EARLIEST_YEAR)+"""
              ),
		s as (
		SELECT t.event_id as event_id,
			a.geoid as cousub_geoid,
			substring(a.geoid,1,5) as geoid
        FROM """+geo_table_name+""" as a
        JOIN t on ST_CONTAINS(a.geom,ST_SetSRID(ST_Point(t.begin_lon,t.begin_lat), 4326))
        WHERE t.state_fips = """+str(fip)+"""
		and t.year >="""+str(EARLIEST_YEAR)+""")
		
		UPDATE severe_weather.details as b
		SET cousub_geoid = s.cousub_geoid,
		geoid = substring(s.cousub_geoid,1,5)
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

'''
SELECT geoid,cousub_geoid,begin_lat,begin_lon
from severe_weather.details 
WHERE begin_lat is not null and begin_lon is not null
and (geoid is null or cousub_geoid is null)
and year >='1996'
and state_fips in ('01', '02', '04', '05','06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
        '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35',,'37', '38', '39', '40', '41', '42', '44', '45', '46',
        '47', '48', '49', '50', '51', '53', '54', '55', '56','72')
'''

'''
SELECT state_fips,
count(geoid) as geoid,
count(cousub_geoid) as cousub_geoid
from severe_weather.details 
WHERE begin_lat is not null and begin_lon is not null
and geoid is not null and cousub_geoid is not null
and year >='1996'
and state_fips in ('01', '02', '04', '05','06', '08', '09', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '24',
        '25', '26', '27', '28', '29', '30', '31', '32', '33', '34', '35','37', '38', '39', '40', '41', '42', '44', '45', '46',
        '47', '48', '49', '50', '51', '53', '54', '55', '56','72')
GROUP BY state_fips
'''

'''
with t as (
              SELECT event_id,begin_lat,begin_lon,geoid,cousub_geoid,state_fips,year
              FROM severe_weather.details
              where begin_lat is not null and begin_lon is not null
              and state_fips = '02'
              and year >= '1996'
              ),
		s as (
		SELECT t.event_id as event_id,
			a.geoid as cousub_geoid,
			substring(a.geoid,1,5) as geoid
        FROM geo.tl_2017_02_cousub as a
        JOIN t on ST_CONTAINS(a.geom,ST_SetSRID(ST_Point(t.begin_lon,t.begin_lat), 4326))
        WHERE t.state_fips = '02'
		and t.year >= '1996'
		)
		
		UPDATE severe_weather.details as b
		SET cousub_geoid = s.cousub_geoid,
		geoid = substring(s.cousub_geoid,1,5)
		FROM s
		WHERE b.event_id = s.event_id
'''
