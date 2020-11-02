
-- Add new colums ---------------------------
ALTER TABLE severe_weather.details 
  ADD COLUMN property_damage bigint default 0,
  ADD COLUMN crop_damage bigint default 0;

-- Convert property damage to big int -------
update severe_weather.details 
set property_damage = 
CASE 
      WHEN RIGHT(damage_property,1) = 'B' THEN cast(cast(LEFT(damage_property,-1) as float) * 1000000000 as bigint)
      WHEN RIGHT(damage_property,1) = 'M' THEN cast(cast(LEFT(damage_property,-1) as float) * 1000000 as bigint)
      WHEN RIGHT(damage_property,1) = 'K' THEN cast(cast(LEFT(damage_property,-1) as float) * 1000 as bigint)
      WHEN RIGHT(damage_property,1) = 'H' or RIGHT(damage_property,1) = 'h' THEN cast(cast(LEFT(damage_property,-1) as float) * 100 as bigint)  
      ELSE cast(cast(damage_property as float) as bigint)
END
where char_length(damage_property) > 1;


-- Convert crop damage to big int -------
update severe_weather.details 
set crop_damage = 
CASE 
      WHEN RIGHT(damage_crops,1) = 'B' THEN cast(cast(LEFT(damage_crops,-1) as float) * 1000000000 as bigint)
      WHEN RIGHT(damage_crops,1) = 'M' THEN cast(cast(LEFT(damage_crops,-1) as float) * 1000000 as bigint)
      WHEN RIGHT(damage_crops,1) = 'K' or RIGHT(damage_crops,1) = 'k' or RIGHT(damage_crops,1) = 'T' THEN cast(cast(LEFT(damage_crops,-1) as float) * 1000 as bigint)
      WHEN RIGHT(damage_crops,1) = 'H' or RIGHT(damage_crops,1) = 'h' THEN cast(cast(LEFT(damage_crops,-1) as float) * 100 as bigint)
      WHEN RIGHT(damage_crops,1) = '?' THEN 0
      ELSE cast(cast(damage_crops as float) as bigint)
END
where char_length(damage_crops) > 1