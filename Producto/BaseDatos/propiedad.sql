CREATE TABLE public.PROPIEDAD (
  id_propi bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  type_nbr numeric NOT NULL,
  type_desc character varying,
  state_nbr numeric,
  state_desc character varying,
  id_address bigint,
  date date DEFAULT CURRENT_DATE,
  describe character varying,
  id_usuario integer,
  CONSTRAINT PROPIEDAD_pkey PRIMARY KEY (id_propi),
  CONSTRAINT fk_usuario FOREIGN KEY (id_usuario) REFERENCES public.USUARIO(id_usuario),
  CONSTRAINT fk_direccion FOREIGN KEY (id_address) REFERENCES public.DIRECCION(id_address)
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