CREATE TABLE public.CARACTERISTICA (
  id_carac bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  total_mtr real NOT NULL,
  surface_mtr real,
  qty_room numeric,
  qty_bath numeric,
  qty_year numeric,
  qty_floor numeric,
  orientation_nbr numeric,
  orientation character varying,
  h_store boolean,
  h_parkin boolean,
  h_gas boolean,
  h_air boolean,
  h_heat boolean,
  h_logia boolean,
  h_energy_solar boolean,
  h_bioler boolean,
  h_cale boolean,
  h_fire_place boolean,
  h_gym boolean,
  h_parkin_visit boolean,
  h_elevator boolean,
  h_place_kid boolean,
  h_place_green boolean,
  h_salon boolean,
  h_alarm boolean,
  h_recip boolean,
  h_close boolean,
  h_control boolean,
  h_balcony boolean,
  h_suite boolean,
  h_yard boolean,
  h_walki_clos boolean,
  h_pool boolean,
  w_furnitor boolean,
  h_ comedor boolean,
  price numeric,
  type_publis_nbr numeric,
  type_publis_desc character varying,
  id_propi bigint UNIQUE,
  CONSTRAINT CARACTERISTICA_pkey PRIMARY KEY (id_carac),
  CONSTRAINT fk_caracteristica_propiedad FOREIGN KEY (id_propi) REFERENCES public.PROPIEDAD(id_propi)
);
-- PERMISOS PARA CARACTERISTICA

-- SELECT
create policy "allow select caracteristica"
on "CARACTERISTICA"
for select
to anon
using (true);

-- INSERT
create policy "allow insert caracteristica"
on "CARACTERISTICA"
for insert
to anon
with check (true);

-- UPDATE
create policy "allow update caracteristica"
on "CARACTERISTICA"
for update
to anon
using (true);

-- DELETE
create policy "allow delete caracteristica"
on "CARACTERISTICA"
for delete
to anon
using (true);