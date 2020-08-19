/*
# for calculating the (#of records with geoid)/(# of total records)
# for calculating the (sum of property damage with geoid)/(# sum of property damage for all records)
*/

with t as
    ( select sum(property_damage) as total_property_damage,
	  count(*) as total_records
    from severe_weather.details)
select
count(geoid) as total_geoid_not_null_records,
t.total_records as total_geoid_records,
ROUND(count(*) * 100.0 / t.total_records, 1) as geoid_records_percentage,
sum(property_damage) as total_property_damage_geoid_not_null,
t.total_property_damage as total_property_damage,
ROUND(sum(property_damage) * 100.0 / t.total_property_damage, 1) as property_damage_records_percentage
from severe_weather.details,
	t
	WHERE geoid is not null and cousub_geoid is not null and tract_geoid is not null
	GROUP BY t.total_property_damage,t.total_records

