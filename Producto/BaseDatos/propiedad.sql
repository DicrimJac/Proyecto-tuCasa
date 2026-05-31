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

INSERT INTO public.PROPIEDAD (
  type_nbr, type_desc, state_nbr, state_desc, 
  id_address, date, describe, id_usuario
) VALUES (
  1, 'Casa', 1, 'Excelente', 1, DEFAULT, 'Casa de 3 habitaciones', 1
)

SELECT * FROM public.PROPIEDAD

UPDATE public.PROPIEDAD
SET 
  type_nbr = 2,
  type_desc = 'Departamento',
  state_nbr = 1,
  state_desc = 'Excelente',
  id_address = 2,
  date = CURRENT_DATE,
  describe = 'Departamento recién renovado',
  id_usuario = 1
WHERE id_propi = 1

DELETE FROM public.PROPIEDAD WHERE id_propi = 1