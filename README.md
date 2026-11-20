# Sonec · App de proyectos

App bilingüe (español / inglés) para Grupo Sonec Remodelación, con dos partes:

- **App del cliente:** estimado (materiales y mano de obra), pagos (pagado y pendiente), materiales comprados, pasos realizados y pendientes, y avances.
- **App del contratista:** presupuesto, registro de compras y gastos, cobros, avance y estimado. Está protegida con PIN y los costos van cifrados dentro de la página.

## Enlaces (GitHub Pages)

- Cliente: `https://cgmillan1.github.io/sonec/`
- Contratista: `https://cgmillan1.github.io/sonec/#contractor`

## Cómo actualizar el proyecto

1. Abre el enlace del contratista y entra con tu PIN. La primera vez te pide crear uno.
2. Haz los cambios: registra compras y pagos, marca pasos y publica avances.
3. Presiona **Guardar cambios**. Se descarga un archivo `index.html` nuevo.
4. En GitHub, abre el repositorio `sonec`, selecciona **Add file > Upload files**, sube ese `index.html` (reemplaza al anterior) y presiona **Commit changes**.
5. En uno o dos minutos el cliente ya ve la versión nueva.

## Archivos

- `index.html`: la app completa, en un solo archivo.
- `Sonec-logo.svg`: logo en vector, para cualquier tamaño.
- `Sonec-logo-2048.png`: logo en alta resolución.

## Notas

- El PIN no se puede recuperar. Si lo pierdes, los datos del contratista no se pueden abrir.
- Antes del primer guardado, los gastos de ejemplo no están cifrados. Crea tu PIN y guarda antes de compartir el enlace.
- En una cuenta gratis de GitHub, un repositorio con GitHub Pages tiene que ser público. Los datos del cliente (nombre, dirección, estimado) se pueden ver; los costos del contratista no, porque van cifrados.
- Cada proyecto va en su propia copia de la app (por ejemplo, `sonec-rivera`), para que un cliente no vea los datos de otro.
