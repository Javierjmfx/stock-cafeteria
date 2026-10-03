# BaristaStock

PWA para llevar el stock, los pedidos y el **inventario mensual** de una cafetería con tres locales (RDJ, QR y PV). Funciona sin conexión y se instala en la pantalla de inicio del móvil.

## Qué hace

- **Inventario de fin de mes por zonas.** Sustituye la hoja de papel: botones grandes de − / +, teclado numérico y la tecla Intro para pasar al siguiente producto. Mientras se cuenta no se muestra el stock que espera la app (conteo a ciegas).
- **Conteo en equipo sin servidor.** Cada persona cuenta en su móvil y envía su parte por WhatsApp. Quien cierra el inventario la pega y la app junta las partes. Si dos personas han contado la misma referencia con cifras distintas, pregunta cuál vale o si hay que sumarlas.
- **Informe mensual en Excel (.xlsx).** Una hoja con el total y una por local, con las existencias de cada SKU. El archivo se genera en el propio navegador, sin librerías externas.
- **Stock y pedidos por local.** Punto de pedido, stock objetivo y hoja de pedido por proveedor, lista para enviar.

## Uso

Sube la carpeta a cualquier hosting estático (GitHub Pages, Netlify…) y abre `index.html` en el móvil. Los datos se guardan en el navegador de cada dispositivo. Desde «Más» se pueden descargar y restaurar copias de seguridad.

La app trae un **catálogo de ejemplo** con productos y proveedores ficticios. El catálogo real no está en el repositorio: se carga en cada móvil desde Más › Restaurar copia.

## Tecnología

HTML, CSS y JavaScript sin frameworks, en un solo archivo, con un service worker para el modo sin conexión. Diseño oscuro «Dark Utility» (ámbar y verde azulado) definido en Google Stitch; tipografías Inter y JetBrains Mono alojadas en el propio repositorio (licencia SIL OFL, en `fonts/`). El .xlsx se escribe a mano: XML de SpreadsheetML empaquetado en un ZIP sin compresión.

## Autoría

Proyecto dirigido por Javier Matos: necesidades, diseño funcional y pruebas en el local. El código está generado con Claude (Anthropic).
