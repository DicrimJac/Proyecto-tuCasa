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

INSERT INTO public.USUARIO (
  first_name, second_name, first_last_name, second_last_name,
  rut, rut_dv, fono, mail, nacionalidad, rol_nbr, rol_desc,
  date_birth, gender_nbr, gender_desc, pass
) VALUES (
  'Juan', 'Carlos', 'Pérez', 'González',
  12345678, 5, 912345678, 'juan.perez@email.com', 'Chilena',
  1, 'Arrendatario', '1990-05-15', 1, 'Masculino', 'hash_del_password'
)

SELECT * FROM public.USUARIO

UPDATE public.USUARIO
SET 
  first_name = 'Juan',
  second_name = 'Andrés',
  first_last_name = 'Pérez',
  second_last_name = 'González',
  rut = 12345678,
  rut_dv = 5,
  fono = 987654321,
  mail = 'juan.andres@email.com',
  nacionalidad = 'Chilena',
  rol_nbr = 2,
  rol_desc = 'Arrendador',
  date_birth = '1990-05-15',
  gender_nbr = 1,
  gender_desc = 'Masculino',
  pass = 'nuevo_hash_password'
WHERE id_usuario = 1

DELETE FROM public.USUARIO WHERE id_usuario = 1