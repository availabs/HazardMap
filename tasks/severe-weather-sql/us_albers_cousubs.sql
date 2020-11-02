INSERT INTO tiger_geo.us_albers_all_cousubs(geoid, geom)
(SELECT
  a.geoid AS geoid,
  a.geom as geom
  FROM tiger_geo.tl_2017_01_cousub as a
UNION
  SELECT
  b.geoid AS geoid,
  b.geom as geom
  FROM tiger_geo.tl_2017_02_cousub as b
UNION
 SELECT
 c.geoid AS geoid,
 c.geom as geom
 FROM tiger_geo.tl_2017_04_cousub as c
UNION
 SELECT
 d.geoid as geoid,
 d.geom as geom
 FROM tiger_geo.tl_2017_05_cousub as d
UNION
 SELECT
 e.geoid as geoid,
 e.geom as geom
 FROM tiger_geo.tl_2017_06_cousub as e
UNION
 SELECT
 f.geoid as geoid,
 f.geom as geom
 FROM tiger_geo.tl_2017_08_cousub as f
UNION
 SELECT
 g.geoid as geoid,
 g.geom as geom
 FROM tiger_geo.tl_2017_09_cousub as g
UNION
 SELECT
 h.geoid as geoid,
 h.geom as geom
 FROM tiger_geo.tl_2017_10_cousub as h
UNION
 SELECT
 i.geoid as geoid,
 i.geom as geom
 FROM tiger_geo.tl_2017_11_cousub as i
UNION
 SELECT
 j.geoid as geoid,
 j.geom as geom
 FROM tiger_geo.tl_2017_12_cousub as j
UNION
 SELECT
 k.geoid as geoid,
 k.geom as geom
 FROM tiger_geo.tl_2017_13_cousub as k
UNION
 SELECT
 l.geoid as geoid,
 l.geom as geom
 FROM tiger_geo.tl_2017_15_cousub as l
UNION
 SELECT
 m.geoid as geoid,
 m.geom as geom
 FROM tiger_geo.tl_2017_16_cousub as m
UNION
 SELECT
 n.geoid as geoid,
 n.geom as geom
 FROM tiger_geo.tl_2017_17_cousub as n
UNION
 SELECT
 o.geoid as geoid,
 o.geom as geom
 FROM tiger_geo.tl_2017_18_cousub as o
UNION
 SELECT
 p.geoid as geoid,
 p.geom as geom
 FROM tiger_geo.tl_2017_19_cousub as p
UNION
 SELECT
 q.geoid as geoid,
 q.geom as geom
 FROM tiger_geo.tl_2017_20_cousub as q
UNION
 SELECT
 r.geoid as geoid,
 r.geom as geom
 FROM tiger_geo.tl_2017_21_cousub as r
UNION
 SELECT
 s.geoid as geoid,
 s.geom as geom
 FROM tiger_geo.tl_2017_22_cousub as s
UNION
 SELECT
 t.geoid as geoid,
 t.geom as geom
 FROM tiger_geo.tl_2017_23_cousub as t
UNION
 SELECT
 u.geoid as geoid,
 u.geom as geom
 FROM tiger_geo.tl_2017_24_cousub as u
UNION
 SELECT
 v.geoid as geoid,
 v.geom as geom
 FROM tiger_geo.tl_2017_25_cousub as v
UNION
 SELECT
 w.geoid as geoid,
 w.geom as geom
 FROM tiger_geo.tl_2017_26_cousub as w
UNION
 SELECT
 x.geoid as geoid,
 x.geom as geom
 FROM tiger_geo.tl_2017_27_cousub as x
UNION
 SELECT
 y.geoid as geoid,
 y.geom as geom
 FROM tiger_geo.tl_2017_28_cousub as y
UNION
 SELECT
 z.geoid as geoid,
 z.geom as geom
 FROM tiger_geo.tl_2017_29_cousub as z
UNION
 SELECT
 aa.geoid as geoid,
 aa.geom as geom
 FROM tiger_geo.tl_2017_30_cousub as aa
UNION
 SELECT
 bb.geoid as geoid,
 bb.geom as geom
 FROM tiger_geo.tl_2017_31_cousub as bb
UNION
 SELECT
 cc.geoid as geoid,
 cc.geom as geom
 FROM tiger_geo.tl_2017_32_cousub as cc
UNION
 SELECT
 dd.geoid as geoid,
 dd.geom as geom
 FROM tiger_geo.tl_2017_33_cousub as dd
UNION
 SELECT
 ee.geoid as geoid,
 ee.geom as geom
 FROM tiger_geo.tl_2017_34_cousub as ee
UNION
 SELECT
 ff.geoid as geoid,
 ff.geom as geom
 FROM tiger_geo.tl_2017_35_cousub as ff
UNION
 SELECT
 gg.geoid as geoid,
 gg.geom as geom
 FROM tiger_geo.tl_2017_36_cousub as gg
UNION
 SELECT
 hh.geoid as geoid,
 hh.geom as geom
 FROM tiger_geo.tl_2017_37_cousub as hh
UNION
 SELECT
 ii.geoid as geoid,
 ii.geom as geom
 FROM tiger_geo.tl_2017_38_cousub as ii
UNION
 SELECT
 jj.geoid as geoid,
 jj.geom as geom
 FROM tiger_geo.tl_2017_39_cousub as jj
UNION
 SELECT
 kk.geoid as geoid,
 kk.geom as geom
 FROM tiger_geo.tl_2017_40_cousub as kk
UNION
 SELECT
 zz.geoid as geoid,
 zz.geom as geom
 FROM tiger_geo.tl_2017_41_cousub as zz
UNION
 SELECT
 ll.geoid as geoid,
 ll.geom as geom
 FROM tiger_geo.tl_2017_42_cousub as ll
UNION
 SELECT
 mm.geoid as geoid,
 mm.geom as geom
 FROM tiger_geo.tl_2017_44_cousub as mm
UNION
 SELECT
 nn.geoid as geoid,
 nn.geom as geom
 FROM tiger_geo.tl_2017_45_cousub as nn
UNION
 SELECT
 oo.geoid as geoid,
 oo.geom as geom
 FROM tiger_geo.tl_2017_46_cousub as oo
UNION
 SELECT
 pp.geoid as geoid,
 pp.geom as geom
 FROM tiger_geo.tl_2017_47_cousub as pp
UNION
 SELECT
 qq.geoid as geoid,
 qq.geom as geom
 FROM tiger_geo.tl_2017_48_cousub as qq
UNION
 SELECT
 rr.geoid as geoid,
 rr.geom as geom
 FROM tiger_geo.tl_2017_49_cousub as rr
UNION
 SELECT
 ss.geoid as geoid,
 ss.geom as geom
 FROM tiger_geo.tl_2017_50_cousub as ss
UNION
 SELECT
 tt.geoid as geoid,
 tt.geom as geom
 FROM tiger_geo.tl_2017_51_cousub as tt
UNION
 SELECT
 uu.geoid as geoid,
 uu.geom as geom
 FROM tiger_geo.tl_2017_53_cousub as uu
UNION
 SELECT
 vv.geoid as geoid,
 vv.geom as geom
 FROM tiger_geo.tl_2017_54_cousub as vv
UNION
 SELECT
 ww.geoid as geoid,
 ww.geom as geom
 FROM tiger_geo.tl_2017_55_cousub as ww
UNION
 SELECT
 xx.geoid as geoid,
 xx.geom as geom
 FROM tiger_geo.tl_2017_56_cousub as xx
UNION
 SELECT
 aaa.geoid as geoid,
 aaa.geom as geom
 FROM tiger_geo.tl_2017_72_cousub as aaa
)
