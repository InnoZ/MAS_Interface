# README

### Creation of the germany district map
* Database: `districts` in schema `gadm`
* Aggregate to 'Landkreise' level: `select name_2 as name, cca_2 as id, st_simplify(st_union(geom), 0.01) as geom from gadm.districts where name_0 = 'Germany' group by name_2, cca_2;`
