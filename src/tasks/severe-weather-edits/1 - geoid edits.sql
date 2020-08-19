# Events that were in Essex county were coded to fulton county
update severe_weather.detailsset cz_fips = '31', geoid = '36031' where event_id in (30744,309387);
update severe_weather.details set cz_fips = '103', geoid = '36103' where event_id in (5583768);
update severe_weather.details set cz_fips = '5', geoid = '36005' where event_id in (5583766);
