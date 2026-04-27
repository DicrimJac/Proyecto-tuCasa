CREATE TABLE public.PROPIEDAD (
  id_propi bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type_nbr numeric NOT NULL,
  type_desc character varying,
  state_nbr numeric,
  state_desc character varying,
  address_nbr numeric,
  id_address bigint,
  CONSTRAINT PROPIEDAD_pkey PRIMARY KEY (id_propi)
);

-- PERMISOS PARA PROPIEDAD

-- SELECT
create policy "allow select propiedad"
on "PROPIEDAD"
for select
to anon
using (true);

-- INSERT
create policy "allow insert propiedad"
on "PROPIEDAD"
for insert
to anon
with check (true);

-- UPDATE
create policy "allow update propiedad"
on "PROPIEDAD"
for update
to anon
using (true);

-- DELETE
create policy "allow delete propiedad"
on "PROPIEDAD"
for delete
to anon
using (true);