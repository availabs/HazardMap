import argparse, csv, io, psycopg2

import database_config

UNCONVERTED_BUSINESS_FILE = 'sba_disaster_loan_data_business_FY01-17.csv'
BUSINESS_FILE = 'sba_business_FY01-17.csv'

UNCONVERTED_HOME_FILE = 'sba_disaster_loan_data_home_FY01-17.csv'
HOME_FILE = 'sba_home_FY01-17.csv'

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

def toZip(string):
	try:
		if len(string) is 0:
			return None
		return string.zfill(5)
	except:
		print("toZip ERROR:", string)
		return None

def toInt(string):
	try:
		if len(string) is 0:
			return None
		return int(string)
	except:
		print("toInt ERROR:", string)
		return None

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

def convert(meta, v):
	return meta["convert"](v)

BUSINESS_META = [
	{ "convert": toInt,		"type": "INTEGER"},
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toZip,		"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toString,	"type": "VARCHAR" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC" },
	{ "convert": toFloat,	"type": "NUMERIC"},
	{"type": "VARCHAR", "name": "loan_type"}
]

def get_state_fips_code(cursor):
	sql = """
		SELECT statefp,stusps
	FROM geo.tl_2017_us_state
	"""
	cursor.execute(sql)
	fips_data = [{'fips': t[0], 'state_code': t[1]} for t in cursor.fetchall()]

	return fips_data

def createTable(cursor):
	sql = """
		DROP TABLE IF EXISTS public.sba_disaster_loan_data;

		CREATE TABLE public.sba_disaster_loan_data (
			{},

			incidenttype VARCHAR DEFAULT NULL,
			geoid VARCHAR(10) DEFAULT NULL,
			fema_date DATE DEFAULT NULL,
			entry_id SERIAL PRIMARY KEY
		)
	"""

	columns = []
	for meta in BUSINESS_META:
		columns.append("{} {}".format(meta["name"], meta["type"]))
	cursor.execute(sql.format(",".join(columns)))

def prepareStatement(cursor):
	columns = ",".join(map(lambda meta: meta["name"], BUSINESS_META))
	variables = ",".join(map(lambda i: "${}".format(i + 1), range(len(BUSINESS_META))))

	sql = """
		INSERT INTO public.sba_disaster_loan_data({})
		VALUES ({})
	""".format(columns, variables)

	cursor.execute("PREPARE stmt AS {}".format(sql))

def deallocateStatement(cursor):
	cursor.execute("DEALLOCATE stmt")

def populateIncidentTypes(cursor):
	sql = """
		UPDATE public.sba_disaster_loan_data AS sba
		SET incidenttype = (
			SELECT fema.incidenttype 
			FROM public.fema_disaster_declarations AS fema
			WHERE fema.disasternumber::TEXT = sba.fema_disaster_number
		)
		WHERE fema_disaster_number IS NOT NULL
	"""

	print("STARTING POPULATION OF INCIDENT TYPES...")
	print("THIS COULD TAKE A FEW MINUTES...")

	cursor.execute(sql)

	print("COMPLETED POPULATION OF INCIDENT TYPES.\n")

def populateFemaDates(cursor):
	sql = """
		UPDATE public.sba_disaster_loan_data
		SET fema_date = (
			SELECT incidentbegindate
			FROM public.fema_disaster_declarations
			WHERE disasternumber::TEXT = fema_disaster_number
		)
		WHERE fema_disaster_number IS NOT NULL
	"""

	print("STARTING POPULATION OF FEMA DATES...")
	print("THIS COULD TAKE A FEW MINUTES...")

	cursor.execute(sql)

	print("COMPLETED POPULATION OF FEMA DATES.\n")

def populateStateGeoids(cursor):
	print("POPULATING STATE GEOIDS")
	fips_data = get_state_fips_code(cursor)
	for item in fips_data:
		sql = """
			UPDATE public.sba_disaster_loan_data
			SET geoid = """+"'"+str(item["fips"])+"'"+"""
			WHERe damaged_property_state_code = """ +"'"+str(item["state_code"])+"'"+"""
			AND geoid IS NULL;
		"""
		cursor.execute(sql)
# END populateStateGeoids

def populateCountyGeoids(cursor):
	print("POPULATING COUNTY GEOIDS")
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
	
			UPDATE public.sba_disaster_loan_data
			SET geoid = temp(damaged_property_county_or_parish_name::TEXT)
			WHERE damaged_property_county_or_parish_name IS NOT NULL
			AND damaged_property_state_code = """ +"'"+str(item["state_code"])+"'"+"""
			AND geoid IS NULL;
	
			DROP FUNCTION temp(TEXT);
		"""
		cursor.execute(sql);
# END populateCountyGeoids

def populateCousubGeoids(cursor):
	print("POPULATING COOUSUB GEOIDS")
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
	
			UPDATE public.sba_disaster_loan_data
			SET geoid = temp(damaged_property_city_name::TEXT)
			WHERE damaged_property_city_name IS NOT NULL
			AND damaged_property_state_code = """ +"'"+str(item["state_code"])+"'"+"""
			AND geoid IS NULL;
	
			DROP FUNCTION temp(TEXT);
		"""
		cursor.execute(sql)
# END populateCousubGeoids

def clearGeoids(cursor):
	sql = """
		UPDATE public.sba_disaster_loan_data
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

def loadTable(cursor, businessIn, homeIn, **rest):

	inserts = ",".join(["%s"] * len(BUSINESS_META))
	sql = """
		EXECUTE stmt({})
	""".format(inserts)

	print("LOADING BUSINESS DATA...")
	firstLineRead = False
	META_DATA = []
	with open(businessIn, 'r') as businessData:
		reader = csv.reader(businessData, delimiter=',', dialect='excel')
		for row in reader:
			if firstLineRead:
				row = list(map(convert, META_DATA, tryTransformRow(row)))
				row.append("business")
				cursor.execute(sql, row)
			else:
				for i, column in enumerate(row):
					BUSINESS_META[i]["name"] = column.replace(" ", "_").replace("/", "_or_").lower()
				createTable(cursor)
				prepareStatement(cursor)

				META_DATA = BUSINESS_META[0:len(row)]
				firstLineRead = True
			# end if
		# end for
	# end with
	print("BUSINESS DATA LOADED.\n")

	print("LOADING HOME DATA...")
	firstLineRead = False
	with open(homeIn) as homeData:
		reader = csv.reader(homeData, delimiter=',', dialect='excel')
		for row in reader:
			if firstLineRead:
				row = list(map(convert, META_DATA, tryTransformRow(row)))
				row.append(None)
				row.append("home")
				cursor.execute(sql, row)

			else:
				META_DATA = BUSINESS_META[0:len(row)]
				firstLineRead = True
			# end if
		# end for
	# end with
	print("HOME DATA LOADED.\n")

	deallocateStatement(cursor)

def convertFile(inFile, outFile, inFormat, outFormat):
	with io.open(inFile, encoding=inFormat, buffering=1024) as in_fp:
		with io.open(outFile, 'w', encoding=outFormat) as out_fp:
			out_fp.write(in_fp.read())

def convertFiles(ucBusiness, businessIn, ucHome, homeIn, inFormat, outFormat, **rest):
	convertFile(ucBusiness, businessIn, inFormat, outFormat)
	convertFile(ucHome, homeIn, inFormat, outFormat)

parser = argparse.ArgumentParser(description='SBA Data Tools.')
parser.add_argument('-c', '--convert',
				action='store_true',
				default=False,
				dest='convert',
				help='Convert files before loading tables.')

parser.add_argument('-t', '--no-table',
				action='store_true',
				default=False,
				dest='noTable',
				help='Skip table creation and population.')

parser.add_argument('-j', '--no-incident-types',
				action='store_true',
				default=False,
				dest='noIncidentTypes',
				help='Skip population of FEMA incident types.')

parser.add_argument('-d', '--no-dates',
				action='store_true',
				default=False,
				dest='noDates',
				help='Skip population of FEMA dates.')

parser.add_argument('-g', '--no-geoids',
				action='store_true',
				default=False,
				dest='noGeoids',
				help='Skip population of geoids.')

parser.add_argument('-u', '--unconverted-business',
				default=UNCONVERTED_BUSINESS_FILE,
				dest='ucBusiness', metavar='<URL>',
				help='URL for unconverted business file. Defaults to: {}.'.format(UNCONVERTED_BUSINESS_FILE))
parser.add_argument('-b', '--business-in',
				default=BUSINESS_FILE,
				dest='businessIn', metavar='<URL>',
				help='URL for input business file. When converting, this file will become the output of the converter. Defaults to: {}.'.format(BUSINESS_FILE))

parser.add_argument('-n', '--unconverted-home',
				default=UNCONVERTED_HOME_FILE,
				dest='ucHome', metavar='<URL>',
				help='URL for unconverted home file. Defaults to: {}.'.format(UNCONVERTED_HOME_FILE))
parser.add_argument('-m', '--home-in',
				default=HOME_FILE,
				dest='homeIn', metavar='<URL>',
				help='URL for input home file. When converting, this file will become the output of the converter. Defaults to: {}.'.format(HOME_FILE))

DEFAULT_INPUT_FORMAT = 'utf-8-sig'
parser.add_argument('-i', '--input-format',
				default=DEFAULT_INPUT_FORMAT,
				dest='inFormat', metavar='<FORMAT>',
				help="Input file encoding used when converting. Defaults to: '{}'.".format(DEFAULT_INPUT_FORMAT))
DEFAULT_OUTPUT_FORMAT = 'utf-8'
parser.add_argument('-o', '--output-format',
				default=DEFAULT_OUTPUT_FORMAT,
				dest='outFormat', metavar='<FORMAT>',
				help="Output file encoding used when converting. Defaults to: '{}'.".format(DEFAULT_OUTPUT_FORMAT))

def main():
	args = vars(parser.parse_args())
	connection = psycopg2.connect(host=database_config.DATABASE_CONFIG['host'],
								  database=database_config.DATABASE_CONFIG['dbname'],
								  user=database_config.DATABASE_CONFIG['user'],
								  port=database_config.DATABASE_CONFIG['port'],
								  password=database_config.DATABASE_CONFIG['password'])
	cursor = connection.cursor()


	if args["convert"]:
		convertFiles(**args)

	if not args["noTable"]:
		loadTable(cursor, **args)
		connection.commit()

	if not args["noIncidentTypes"]:
		populateIncidentTypes(cursor)
		connection.commit()

	if not args["noDates"]:
		populateFemaDates(cursor)
		connection.commit()

	if not args["noGeoids"]:
		populateGeoids(cursor)
		connection.commit()

	cursor.close()
	connection.close()

if __name__ == "__main__":
	main()