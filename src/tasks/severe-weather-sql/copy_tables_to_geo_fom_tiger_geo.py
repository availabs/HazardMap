import argparse, csv, os, psycopg2

import database_config

def copy_tables_tracts(cursor):
    print('IN COPY TABLE TRACTS....\n')
    fips = ["01", "02", "04", "05","06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
            "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35","36","37", "38", "39", "40", "41", "42", "44", "45", "46",
            "47", "48", "49", "50", "51", "53", "54", "55", "56"]
    for fip in fips:
        print(fip)
        tiger_geo_table_name = 'tiger_geo.tl_2017_' + fip + '_tract'
        geo_table_name = 'geo.tl_2017_' + fip + '_tract'
        sql = """
        DROP TABLE IF EXISTS  """+geo_table_name+""";
        
        CREATE TABLE """+geo_table_name+""" (like """+tiger_geo_table_name+""" including all);

        INSERT INTO """+geo_table_name+"""
        SELECT * 
        from """+tiger_geo_table_name+""";
        """
        cursor.execute(sql)
    print('END OF  COPY TABLE TRACTS....\n')


def copy_tables_cousubs(cursor):
    print('IN COPY TABLE COUSUBS....\n')
    fips = ["01", "02", "04", "05", "06", "08", "09", "10", "11", "12", "13", "15", "16", "17", "18", "19", "20", "21", "22", "23", "24",
            "25", "26", "27", "28", "29", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "40", "41", "42", "44", "45", "46",
            "47", "48", "49", "50", "51", "53", "54", "55", "56"]
    for fip in fips:
        print(fip)
        tiger_geo_table_name = 'tiger_geo.tl_2017_' + fip + '_cousub'
        geo_table_name = 'geo.tl_2017_' + fip + '_cousub'
        sql = """
            DROP TABLE IF EXISTS  """+geo_table_name+""";
            create table """+geo_table_name+""" (like """+tiger_geo_table_name+""" including all);
    
            insert into """+geo_table_name+"""
            select * 
            from """+tiger_geo_table_name+""";
        """
        cursor.execute(sql)
    print('END OF COPY TABLE COUSUBS....\n')
def main():
    conn = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
                            database=database_config.DATABASE_CONFIG['dbname'],
                            user=database_config.DATABASE_CONFIG['user'],
                            port=database_config.DATABASE_CONFIG['port'],
                            password=database_config.DATABASE_CONFIG['password'])
    cursor = conn.cursor()

    copy_tables_tracts(cursor)
    copy_tables_cousubs(cursor)
    conn.commit()
    cursor.close()
    conn.close()


# END main

if __name__ == "__main__":
    main()