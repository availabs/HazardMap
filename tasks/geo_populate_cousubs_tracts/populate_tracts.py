import argparse, csv, os, psycopg2

import database_config

def populate_tracts(cursor):
    #"36" already there
    fips = ["01", "02", "04", "05","06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
            "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35","37", "38", "39", "40", "41", "42", "44", "45", "46",
            "47", "48", "49", "50", "51", "53", "54", "55", "56"]
    for fip in fips:
        print(fip)
        geo_table_name = 'geo.tl_2017_' + fip + '_tract'
        sql = """
        INSERT INTO geo.tl_2017_tract(
	    geom, statefp, countyfp, geoid, name, namelsad)
        SELECT
          ST_Transform(a.geom,4269) as geom,
          a.statefp as statefp,
          a.countyfp as countyfp,
          a.geoid AS geoid,
          a.name as name,
          a.namelsad as namelsad
          FROM """+geo_table_name+""" as a
        """
        cursor.execute(sql)
def main():
    conn = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
                            database=database_config.DATABASE_CONFIG['dbname'],
                            user=database_config.DATABASE_CONFIG['user'],
                            port=database_config.DATABASE_CONFIG['port'],
                            password=database_config.DATABASE_CONFIG['password'])
    cursor = conn.cursor()
    populate_tracts(cursor)
    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()