  UPDATE severe_weather.details 
  set event_type = 'Hurricane Flood'
  WHERE 
	geoid like '36%'
	AND year = 2011
	and episode_narrative like '%Irene%'
	and event_type in ('Flood', 'Flash Flood');