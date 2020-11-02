import argparse, csv, os, psycopg2

import database_config

HMAP_FILE = "./HazardMitigationAssistanceMitigatedProperties.csv"

def toFloat(string):
	try:
		if len(string) is 0:
			return None
		return float(string.replace(",", ""))
	except:
		print("toFloat ERROR:", string)
		return None

def toString(string):
	try:
		if len(string) is 0:
			return None
		return string
	except:
		print("toString ERROR:", string)
		return None

def toInt(string):
	try:
		if len(string) is 0:
			return None
		return int(string)
	except:
		print("toInt ERROR:", string)
		return None

def zfillString(string, num):
	try:
		if len(string) is 0:
			return None
		return string.zfill(num)
	except:
		print("zfillString ERROR:", string)
		return None

def toState(string):
	return zfillString(string, 2)
def toCounty(string):
	return zfillString(string, 5)

def toCousub(string):
	return zfillString(string,10)

def toZip(string):
	try:
		if len(string) is 0:
			return None
		return string.zfill(5)
	except:
		print("toZip ERROR:", string)
		return None

def convert(meta, v):
	return meta["convert"](v)

META = [
	{ "convert": toString,	"type": "VARCHAR" }, # disasterNumber

	{ "convert": toString,	"type": "VARCHAR" }, #region

	{ "convert": toState,	"type": "VARCHAR" }, #stateNumberCode
	{ "convert": toString,	"type": "VARCHAR" }, #state

	{ "convert": toCounty,	"type": "VARCHAR" }, #countyCode
	{ "convert": toString,	"type": "VARCHAR" }, #county

	{ "convert": toString,	"type": "VARCHAR" }, #city
	{ "convert": toZip,		"type": "VARCHAR" }, #zipCode
	{ "convert": toString,	"type": "VARCHAR" }, #projectIdentifier
	{ "convert": toString,	"type": "VARCHAR" }, #propertyAction
	{ "convert": toString,	"type": "VARCHAR" }, #structureType

	{ "convert": toString,	"type": "VARCHAR" }, #typeOfResidency
	{ "convert": toFloat,	"type": "NUMERIC" }, #actualAmountPaid

	{ "convert": toInt,	    "type": "INTEGER" }, #programFy
	{ "convert": toString,	"type": "TIMESTAMP" }, #dateInitiallyApproved

	{ "convert": toString,	"type": "TIMESTAMP" }, #dateApproved
	{ "convert": toString,	"type": "TIMESTAMP" }, #dateClosed
	{ "convert": toString,	"type": "VARCHAR" }, #status

	{ "convert": toString,	"type": "VARCHAR" }, #programArea

	{ "convert": toString,	"type": "VARCHAR" }, #title
	{ "convert": toString,	"type": "VARCHAR" }, #tribalIndicator
	{ "convert": toString,	"type": "VARCHAR" }, #type

	{ "convert": toInt,	"type": "INTEGER" }, #numberOfProperties
	{ "convert": toString,	"type": "VARCHAR" }, #damageCategory
	{"convert" :toString ,"type":"VARCHAR"} #id

]

'''
META = [
	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toState,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toCounty,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toInt,		"type": "INTEGER" },
	{ "convert": toInt,		"type": "INTEGER" },

	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },

	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },

	{ "convert": toInt,		"type": "INTEGER" },

	{ "convert": toString,	"type": "TIMESTAMP" },
	{ "convert": toString,	"type": "TIMESTAMP" },
	{ "convert": toString,	"type": "TIMESTAMP" },

	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" }
]
'''

def get_state_fips_code(cursor):
	sql = """
		SELECT statefp,stusps
	FROM geo.tl_2017_us_state
	"""
	cursor.execute(sql)
	fips_data = [{'fips': t[0], 'state_code': t[1]} for t in cursor.fetchall()]

	return fips_data

def createTable(cursor):
	print('CREATING TABLE ...')
	sql = """
		DROP TABLE IF EXISTS public.fema_hmap_v1;

		CREATE TABLE public.fema_hmap_v1 (
			{},

			incidenttype VARCHAR DEFAULT NULL,
			geoid VARCHAR(10) DEFAULT NULL,
			fema_date DATE DEFAULT NULL
		)
	"""

	columns = []
	for meta in META:
		columns.append("{} {}".format(meta["name"], meta["type"]))

	cursor.execute(sql.format(",".join(columns)))

	print('FINISHED CREATING TABLE ...')
# END createTable

def prepareStatement(cursor):
	print('INSERTING DATA')
	columns = ",".join(map(lambda meta: meta["name"], META))
	variables = ",".join(map(lambda i: "${}".format(i + 1), range(len(META))))

	sql = """
		INSERT INTO public.fema_hmap_v1({})
		VALUES ({})
	""".format(columns, variables)

	cursor.execute("PREPARE stmt AS {}".format(sql))
# END prepareStatement

def deallocateStatement(cursor):
	cursor.execute("DEALLOCATE stmt")
# END deallocateStatement

def tryTransformRow(row):
	# This transform is required because some rows
	# have their zip code (row[6]) and
	# city name (row[5]) switched.
	# If row[6] cannot be converted to an integer
	# and is not length 0, then swap rows 5 and 6.
	try:
		int(row[6])
	except:
		if len(row[6]) > 0:
			temp = row[5]
			row[5] = row[6]
			row[6] = temp
	finally:
		return row

def loadTable(cursor, inputURL, **rest):

	inserts = ",".join(["%s"] * len(META))
	sql = """
		EXECUTE stmt({})
	""".format(inserts)

	print("LOADING CSV DATA...")
	firstLineRead = False
	with open(inputURL, 'r') as data:
		reader = csv.reader(data, delimiter=',', dialect='excel')
		for row in reader:
			if firstLineRead:
				row = list(map(convert,META,row))
				cursor.execute(sql, row)
			else:
				for i, column in enumerate(row):
					META[i]["name"] = column.lower()

				createTable(cursor)
				prepareStatement(cursor)

				firstLineRead = True
		# end if
	# end for
	# end with

	print("CSV DATA LOADED.\n")

	deallocateStatement(cursor)
# END loadTable

def populateCountyGeoids(cursor):
	print("STARTING POPULATION OF COUNTY LEVEL GEOIDs...")

	fips_data = get_state_fips_code(cursor)
	for item in fips_data:
		sql = """
			CREATE OR REPLACE FUNCTION temp(TEXT) RETURNS TEXT
				AS $$ SELECT geotl.geoid
				FROM geo.tl_2017_us_county AS geotl
				WHERE lower(geotl.name) = lower($1)
				AND geotl.statefp = """+"'"+str(item["fips"])+"'"+"""
				GROUP BY geotl.geoid $$
			LANGUAGE SQL
			IMMUTABLE
			RETURNS NULL ON NULL INPUT;
	
			UPDATE public.fema_hmap_v1
			SET geoid = temp(county::TEXT)
			WHERE county IS NOT NULL
			AND statenumbercode = """ +"'"+str(item["fips"])+"'"+"""
			AND geoid IS NULL;
	
			DROP FUNCTION temp(TEXT);
		"""
		cursor.execute(sql);

	print("COMPLETED POPULATION OF COUNTY LEVEL GEOIDs.\n")
# END populateCountyGeoids

def populateStateGeoids(cursor):
	print("POPULATING STATE GEOIDS")
	fips_data = get_state_fips_code(cursor)
	for item in fips_data:
		sql = """
			UPDATE public.fema_hmap_v1	
			SET geoid = """+"'"+str(item["fips"])+"'"+"""
			WHERe statenumbercode = """ +"'"+str(item["fips"])+"'"+"""
			AND geoid IS NULL;
		"""
		cursor.execute(sql)
	print("COMPLETED POPULATION OF STATE LEVEL GEOIDs.\n")
# END populateCountyGeoids

def populateCousubGeoids(cursor):
	print("POPULATING COUSUB GEOIDS")
	fips_data = get_state_fips_code(cursor)
	for item in fips_data:
		sql = """
			CREATE OR REPLACE FUNCTION temp(TEXT) RETURNS TEXT
				AS $$ SELECT geotl.geoid
				FROM geo.tl_2017_36_cousub AS geotl
				WHERE lower(geotl.name) = lower($1)
				AND geotl.statefp = """+"'"+str(item["fips"])+"'"+"""
				GROUP BY geotl.geoid $$
			LANGUAGE SQL
			IMMUTABLE
			RETURNS NULL ON NULL INPUT;
	
			UPDATE public.fema_hmap_v1
			SET geoid = temp(city::TEXT)
			WHERE city IS NOT NULL
			AND statenumbercode = """ +"'"+str(item["fips"])+"'"+"""
			AND geoid IS NULL;
	
			DROP FUNCTION temp(TEXT);
		"""

		cursor.execute(sql)
	print("COMPLETED POPULATION OF COUSUB LEVEL GEOIDs.\n")
# END populateCousubGeoids

def clearGeoids(cursor):
	sql = """
		UPDATE public.fema_hmap_v1
		SET geoid = NULL;
	"""
	cursor.execute(sql)

def populateGeoids(cursor):
	print("STARTING POPULATION OF GEO IDs...")

	clearGeoids(cursor)
	populateCousubGeoids(cursor)
	populateCountyGeoids(cursor)
	populateStateGeoids(cursor)

	print("COMPLETED POPULATION OF GEO IDs.\n")
# END populateGeoids

def populateIncidentTypes(cursor):
	sql = """
		UPDATE public.fema_hmap_v1 AS hmap
		SET incidenttype = (
			SELECT fema.incidenttype 
			FROM public.fema_disaster_declarations AS fema
			WHERE fema.disasternumber::TEXT = hmap.disasternumber
		)
		WHERE disasternumber IS NOT NULL
	"""

	print("STARTING POPULATION OF INCIDENT TYPES...")

	cursor.execute(sql)

	print("COMPLETED POPULATION OF INCIDENT TYPES.\n")
# END populateIncidentTypes

def populateFemaDates(cursor):
	sql = """
		UPDATE public.fema_hmap_v1 AS hmap
		SET fema_date = (
			SELECT incidentbegindate
			FROM public.fema_disaster_declarations AS fema
			WHERE fema.disasternumber::TEXT = hmap.disasternumber
		)
		WHERE disasternumber IS NOT NULL
	"""

	print("STARTING POPULATION OF FEMA DATES...")

	cursor.execute(sql)

	print("COMPLETED POPULATION OF FEMA DATES.\n")
# END populateFemaDates

parser = argparse.ArgumentParser(description='HMAP table loader.')

parser.add_argument('-i', '--input-url',
				default=HMAP_FILE,
				dest='inputURL', metavar='<URL>',
				help='URL for HMAP input file. Defaults to: {}.'.format(HMAP_FILE))

def main():
	args = vars(parser.parse_args())

	conn = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
									 database=database_config.DATABASE_CONFIG['dbname'],
									 user=database_config.DATABASE_CONFIG['user'],
									 port=database_config.DATABASE_CONFIG['port'],
									 password=database_config.DATABASE_CONFIG['password'])
	cursor = conn.cursor()

	#loadTable(cursor, **args)

	#populateFemaDates(cursor)
	#populateIncidentTypes(cursor)
	# populateCousubGeoids(cursor)
	# populateCountyGeoids(cursor)
	# populateStateGeoids(cursor)
	populateGeoids(cursor)


	conn.commit()
	cursor.close()
	conn.close()
# END main

if __name__ == "__main__":
	main()