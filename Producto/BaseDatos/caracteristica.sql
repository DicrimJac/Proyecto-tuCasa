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
  h_comedor boolean,
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

INSERT INTO public.CARACTERISTICA (
  total_mtr, surface_mtr, qty_room, qty_bath, qty_year, qty_floor,
  orientation_nbr, orientation, h_store, h_parkin, h_gas, h_air, h_heat,
  h_logia, h_energy_solar, h_bioler, h_cale, h_fire_place, h_gym,
  h_parkin_visit, h_elevator, h_place_kid, h_place_green, h_salon,
  h_alarm, h_recip, h_close, h_control, h_balcony, h_suite, h_yard,
  h_walki_clos, h_pool, w_furnitor, h_comedor, price, type_publis_nbr,
  type_publis_desc, id_propi
) VALUES (
  120.5, 95.0, 3, 2, 5, 2, 180, 'Norte', true, true, false, true, true,
  false, false, false, true, false, false, true, true, false, true, true,
  false, true, true, false, true, true, false, true, false, true, true,
  250000.00, 1, 'Venta', 1
);

SELECT * FROM public.CARACTERISTICA ORDER BY id_carac;

UPDATE public.CARACTERISTICA
SET 
  total_mtr = 130.5,
  surface_mtr = 100.0,
  qty_room = 4,
  qty_bath = 3,
  qty_year = 6,
  qty_floor = 3,
  orientation_nbr = 200,
  orientation = 'Sur',
  h_store = false,
  h_parkin = true,
  h_gas = true,
  h_air = true,
  h_heat = false,
  h_logia = true,
  h_energy_solar = false,
  h_bioler = true,
  h_cale = true,
  h_fire_place = false,
  h_gym = true,
  h_parkin_visit = false,
  h_elevator = true,
  h_place_kid = true,
  h_place_green = false,
  h_salon = true,
  h_alarm = true,
  h_recip = false,
  h_close = true,
  h_control = true,
  h_balcony = false,
  h_suite = true,
  h_yard = true,
  h_walki_clos = false,
  h_pool = true,
  w_furnitor = false,
  h_comedor = true,
  price = 300000.00,
  type_publis_nbr = 2,
  type_publis_desc = 'Alquiler',
  id_propi = 2
WHERE id_carac = 1;

DELETE FROM public.CARACTERISTICA 
WHERE id_carac = 1
