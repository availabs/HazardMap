import argparse, csv, os, psycopg2

import database_config


def get_state_fips_code(cursor):
    sql = """
		SELECT statefp,stusps
	FROM geo.tl_2017_us_state
	"""
    cursor.execute(sql)
    fips_data = [{'fips': t[0], 'state_code': t[1]} for t in cursor.fetchall()]

    return fips_data


def add_tracts(cursor):
    '''
    Steps :
    1) Remove columns if exist
    2) Add columns
    3) Check for tract geoids from geo.tl_2017_fips_tract
    '''
    fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46", "47", "48", "49", "50", "51", "53", "54", "55", "56"]
    print (len(fips))
    for fip in fips[40:len(fips)-1]:
        print (fip)
        geo_table_name = 'tiger_geo.tl_2017_' + fip + '_tract'
        sql = """
        UPDATE severe_weather.details
        SET tract_geoid= (
            SELECT geotl.geoid
            FROM """+geo_table_name+""" AS geotl    
            WHERE ST_Contains(ST_TRANSFORM(geotl.geom,4326),
							  ST_TRANSFORM(severe_weather.details.begin_coords_geom,4326))
        )
        WHERE tract_geoid IS NULL
        AND (state_fips = """+fip+""")
        AND begin_coords_geom IS NOT NULL;
        """
        cursor.execute(sql)

def check_for_county_fips(cursor):
    fips = get_state_fips_code(cursor)
    for fip in fips:
        sql = """
        UPDATE severe_weather.details
        SET geoid = LPAD(state_fips::TEXT, 2, '0') || LPAD(cz_fips::TEXT, 3, '0')
        WHERE geoid IS NULL
        AND state_fips = """+fip["fips"]+"""
        """
        cursor.execute(sql)

def check_for_state_fips(cursor):
    fips = get_state_fips_code(cursor)
    for fip in fips:
        sql = """
        UPDATE severe_weather.details
        SET geoid = state_fips::TEXT
        WHERE geoid IS NULL
        AND state_fips = """+fip["fips"]+"""
        """
        cursor.execute(sql)

def add_cousubs(cursor):
    fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
            "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46",
            "47", "48", "49", "50", "51", "53", "54", "55", "56"]
    print (len(fips))
    for fip in fips:
        geo_table_name = 'tiger_geo.tl_2017_' + fip + '_cousub'
        sql = """
        
        UPDATE severe_weather.details
        SET cousub_geoid = (
            SELECT geotl.geoid
            FROM """+geo_table_name+""" AS geotl
            WHERE ST_Contains(ST_TRANSFORM(geotl.geom,4326),
							  ST_TRANSFORM(severe_weather.details.begin_coords_geom,4326))
        )
        WHERE cousub_geoid IS NULL
        AND (state_fips = """+fip+""")
        AND begin_coords_geom IS NOT NULL;
        """
        cursor.execute(sql)

def main():
    conn = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
                            database=database_config.DATABASE_CONFIG['dbname'],
                            user=database_config.DATABASE_CONFIG['user'],
                            port=database_config.DATABASE_CONFIG['port'],
                            password=database_config.DATABASE_CONFIG['password'])
    cursor = conn.cursor()

    #add_tracts(cursor)
    add_cousubs(cursor)
    #check_for_state_fips(cursor)
    #check_for_county_fips(cursor)


    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()