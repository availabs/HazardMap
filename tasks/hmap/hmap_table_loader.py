import argparse, csv, os, psycopg2

from config import host

HMAP_FILE = "./HazardMitigationAssistanceProjects.csv"

def toFloat(string):
    try:
        if len(string) is 0:
            return None
        return float(string.replace(",", ""))
    except:
        print "toFloat ERROR:", string
        return None

def toString(string):
    try:
        if len(string) is 0:
            return None
        return string
    except:
        print "toString ERROR:", string
        return None

def toInt(string):
    try:
        if len(string) is 0:
            return None
        return int(string)
    except:
        print "toInt ERROR:", string
        return None

def zfillString(string, num):
    try:
        if len(string) is 0:
            return None
        return string.zfill(num)
    except:
        print "zfillString ERROR:", string
        return None

def toState(string):
    return zfillString(string, 2)
def toCounty(string):
    return zfillString(string, 3)

def convert(meta, v):
    return meta["convert"](v)

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

def createTable(cursor):
    sql = """
		DROP TABLE IF EXISTS public.hazard_mitigation_assistance_projects;
		CREATE TABLE public.hazard_mitigation_assistance_projects (
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
# END createTable

def prepareStatement(cursor):
    columns = ",".join(map(lambda meta: meta["name"], META))
    variables = ",".join(map(lambda i: "${}".format(i + 1), range(len(META))))

    sql = """
		INSERT INTO public.hazard_mitigation_assistance_projects({})
		VALUES ({})
	""".format(columns, variables)

    cursor.execute("PREPARE stmt AS {}".format(sql))
# END prepareStatement

def deallocateStatement(cursor):
    cursor.execute("DEALLOCATE stmt")
# END deallocateStatement

def loadTable(cursor, inputURL, **rest):

    inserts = ",".join(["%s"] * len(META))
    sql = """
		EXECUTE stmt({})
	""".format(inserts)

    print "LOADING CSV DATA..."

    firstLineRead = False
    with open(inputURL, 'rb') as data:
        reader = csv.reader(data, delimiter=',', dialect='excel')
        for row in reader:
            if firstLineRead:
                row = map(convert, META, row)
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

    print "CSV DATA LOADED.\n"

    deallocateStatement(cursor)
# END loadTable

def populateCountyGeoids(cursor):
    sql = """
		UPDATE public.hazard_mitigation_assistance_projects
		SET geoid = statenumbercode || countycode
		WHERE geoid IS NULL
		AND countycode != '000';
	"""

    print "STARTING POPULATION OF COUNTY LEVEL GEOIDs..."

    cursor.execute(sql);

    print "COMPLETED POPULATION OF COUNTY LEVEL GEOIDs.\n"
# END populateCountyGeoids

def populateStateGeoids(cursor):
    sql = """
		UPDATE public.hazard_mitigation_assistance_projects
		SET geoid = statenumbercode
		WHERE geoid IS NULL;
	"""

    print "STARTING POPULATION OF STATE LEVEL GEOIDs..."

    cursor.execute(sql);

    print "COMPLETED POPULATION OF STATE LEVEL GEOIDs.\n"
# END populateCountyGeoids

def populateIncidentTypes(cursor):
    sql = """
		UPDATE public.hazard_mitigation_assistance_projects AS hmap
		SET incidenttype = (
			SELECT fema.incidenttype 
			FROM public.fema_disaster_declarations AS fema
			WHERE fema.disasternumber::TEXT = hmap.disasternumber
		)
		WHERE disasternumber IS NOT NULL
	"""

    print "STARTING POPULATION OF INCIDENT TYPES..."

    cursor.execute(sql)

    print "COMPLETED POPULATION OF INCIDENT TYPES.\n"
# END populateIncidentTypes

def populateFemaDates(cursor):
    sql = """
		UPDATE public.hazard_mitigation_assistance_projects AS hmap
		SET fema_date = (
			SELECT incidentbegindate
			FROM public.fema_disaster_declarations AS fema
			WHERE fema.disasternumber::TEXT = hmap.disasternumber
		)
		WHERE disasternumber IS NOT NULL
	"""

    print "STARTING POPULATION OF FEMA DATES..."

    cursor.execute(sql)

    print "COMPLETED POPULATION OF FEMA DATES.\n"
# END populateFemaDates

parser = argparse.ArgumentParser(description='HMAP table loader.')

parser.add_argument('-i', '--input-url',
                    default=HMAP_FILE,
                    dest='inputURL', metavar='<URL>',
                    help='URL for HMAP input file. Defaults to: {}.'.format(HMAP_FILE))

def main():
    args = vars(parser.parse_args())

    conn = psycopg2.connect(host)
    cursor = conn.cursor()

    loadTable(cursor, **args)

    populateFemaDates(cursor)
    populateIncidentTypes(cursor)
    populateCountyGeoids(cursor)
    populateStateGeoids(cursor)

    conn.commit()
    cursor.close()
    conn.close()
# END main

if __name__ == "__main__":
    main()