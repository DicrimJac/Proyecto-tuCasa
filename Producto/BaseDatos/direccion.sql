CREATE TABLE public.DIRECCION (
  id_address bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  street character varying NOT NULL,
  number character varying,
  comuna character varying,
  city character varying,
  state character varying,
  CONSTRAINT DIRECCION_pkey PRIMARY KEY (id_address)
);
-- PERMISOS PARA DIRECCION

-- SELECT
create policy "allow select direccion"
on "DIRECCION"
for select
to anon
using (true);

-- INSERT
create policy "allow insert direccion"
on "DIRECCION"
for insert
to anon
with check (true);

-- UPDATE
create policy "allow update direccion"
on "DIRECCION"
for update
to anon
using (true);

-- DELETE
create policy "allow delete direccion"
on "DIRECCION"
for delete
to anon
using (true);

INSERT INTO public.DIRECCION (
  street, number, comuna, city, state
) VALUES (
  'Av. Siempre Viva', '123', 'Santiago Centro', 'Santiago', 'Región Metropolitana'
)

SELECT * FROM public.DIRECCION ORDER BY id_address;

UPDATE public.DIRECCION
SET 
  street = 'Av. Los Pajaritos',
  number = '999',
  comuna = 'Maipú',
  city = 'Santiago',
  state = 'Región Metropolitana'
WHERE id_address = 1

DELETE FROM public.DIRECCION 
WHERE id_address = 1