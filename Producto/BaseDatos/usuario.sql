CREATE TABLE public.USUARIO (
  id_usuario bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  date_register date DEFAULT now(),
  first_name character varying NOT NULL,
  second_name character varying,
  first_last_name character varying,
  second_last_name character varying,
  rut numeric,
  fono numeric,
  mail character varying,
  nacionalidad character varying,
  rol_nbr numeric,
  rol_desc character varying,
  date_birth date,
  gender_nbr numeric,
  gender_desc character varying,
  rut_dv numeric,
  pass character varying,
  CONSTRAINT USUARIO_pkey PRIMARY KEY (id_usuario)
);
-- PERMISOS
-- SELECT
create policy "allow select"
on "USUARIO"
for select
to anon
using (true);
-- INSERT
create policy "allow insert"
on "USUARIO"
for insert
to anon
with check (true);
-- UPDATE
create policy "allow update"
on "USUARIO"
for update
to anon
using (true);
-- DELETE
create policy "allow delete"
on "USUARIO"
for delete
to anon
using (true);