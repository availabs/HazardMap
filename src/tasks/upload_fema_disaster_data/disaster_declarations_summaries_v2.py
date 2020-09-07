import psycopg2
import database_config
import csv

def upload(cursor):

    with open('./csvs/DisasterDeclarationsSummaries.csv', 'r') as f:
        next(f) # Skip the header row.
        cursor.copy_from(f, 'fema_disasters.disaster_declarations_summaries_v2', sep=',')


def main():

    conn = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
                            database=database_config.DATABASE_CONFIG['dbname'],
                            user=database_config.DATABASE_CONFIG['user'],
                            port=database_config.DATABASE_CONFIG['port'],
                            password=database_config.DATABASE_CONFIG['password'])
    cursor = conn.cursor()

    upload(cursor)

    conn.commit()
    cursor.close()
    conn.close()
