CREATE TABLE public.EVALUPROPI (
  id_evalupropi bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date_register date DEFAULT now(),
  neight numeric,
  service_near numeric,
  segurity numeric,
  service_bus numeric,
  neightbors numeric,
  clean numeric,
  maintenance numeric,
  quality_price numeric,
  level_noise numeric,
  signal numeric,
  lighting numeric,
  parking numeric,
  total_point numeric,
  description character varying,
  id_propi integer,
  CONSTRAINT EVALUPROPI_pkey PRIMARY KEY (id_evalupropi),
  CONSTRAINT EVALUPROPI_id_propi_fkey FOREIGN KEY (id_propi) REFERENCES public.PROPIEDAD(id_propi)
);

create policy "allow select"
on "EVALUPROPI"
for select
to anon
using (true);

create policy "allow insert"
on "EVALUPROPI"
for insert
to anon
with check (true);

create policy "allow update"
on "EVALUPROPI"
for update
to anon
using (true);

create policy "allow delete"
on "EVALUPROPI"
for delete
to anon
using (true);

INSERT INTO public.EVALUPROPI (
  neight, service_near, segurity, service_bus, neightbors,
  clean, maintenance, quality_price, level_noise, signal,
  lighting, parking, total_point, description, id_propi
) VALUES (
  4, 5, 3, 4, 4, 5, 4, 5, 3, 4, 5, 4, 4.2, 'Buena ubicación', 1
)

SELECT * FROM public.EVALUPROPI

UPDATE public.EVALUPROPI
SET 
  neight = 5,
  service_near = 5,
  segurity = 4,
  service_bus = 5,
  neightbors = 5,
  clean = 5,
  maintenance = 4,
  quality_price = 5,
  level_noise = 3,
  signal = 5,
  lighting = 5,
  parking = 5,
  total_point = 4.8,
  description = 'Excelente propiedad, muy recomendable'
WHERE id_evalupropi = 1

DELETE FROM public.EVALUPROPI WHERE id_evalupropi = 1