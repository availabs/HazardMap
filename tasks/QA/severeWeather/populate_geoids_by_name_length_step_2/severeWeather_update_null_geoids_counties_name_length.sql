UPDATE severe_weather.details
SET geoid = (LPAD(state_fips::TEXT, 2, '0') || LPAD(cz_fips::TEXT, 3, '0')) as geoid
FROM severe_weather.details
WHERE geoid IS NULL
and year >='1996'
