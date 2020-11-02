--------------- to populate geoids in IA ----------------
WITH t as
(
SELECT a.geoid,b.stusps,a.name
	FROM geo.tl_2017_us_county as a
	JOIN geo.tl_2017_us_state as b ON ST_CONTAINS(b.geom,a.geom)

)

UPDATE fema_disasters.individual_and_households_programs_valid_registration
SET geoid = t.geoid
FROM t
WHERE t.stusps = damaged_state_abbreviation
and t.name || ' (County)' = county
RETURNING t.geoid,county,damaged_state_abbreviation,t.stusps,t.name

-------------------------To populate geoids in HMGP-properties------------------------

WITH t as
(
SELECT a.geoid,b.statefp,a.name
	FROM geo.tl_2017_us_county as a
	JOIN geo.tl_2017_us_state as b ON ST_CONTAINS(b.geom,a.geom)

)

UPDATE fema_disasters.hazard_mitigation_assistance_mitigated_properties_v2
SET geoid = t.geoid
FROM t
WHERE t.statefp = state_number_code
and t.name = county
RETURNING t.geoid,county,state_number_code,t.statefp,t.name

-----------------------------------To populate geoids in HMGP-projects---------------------------
WITH t as
(
SELECT a.geoid,b.statefp,a.name
	FROM geo.tl_2017_us_county as a
	JOIN geo.tl_2017_us_state as b ON ST_CONTAINS(b.geom,a.geom)

)

UPDATE fema_disasters.hazard_mitigation_assistance_projects_v2
SET geoid = t.geoid
FROM t
WHERE t.statefp = state_number_code
and t.name = county
RETURNING t.geoid,county,state_number_code,t.statefp,t.name
-------------------------to populate geoids in PA -------------------------------------------------
WITH t as
(
SELECT a.geoid,b.statefp,a.name
	FROM geo.tl_2017_us_county as a
	JOIN geo.tl_2017_us_state as b ON ST_CONTAINS(b.geom,a.geom)

)

UPDATE fema_disasters.public_assistance_funded_projects_details_v1
SET geoid = t.geoid
FROM t
WHERE t.statefp = CAST(state_number_code as varchar)
and t.name = county
RETURNING t.geoid,county,state_number_code,t.statefp,t.name
