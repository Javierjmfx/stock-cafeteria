# Stock cafetería

PWA para llevar el stock, los pedidos y el **inventario mensual** de una cafetería con tres locales (RDJ, QR y PV). Funciona sin conexión y se instala en la pantalla de inicio del móvil.

## Qué hace

- **Inventario por local y por áreas.** Cada local tiene su conteo y solo pide las categorías que se usan allí.
- **Cantidades sin ambigüedad.** Cada producto se cuenta en su unidad (ud, kg, L, barril…) con su formato de compra (caja de 24, saco de 10 kg…). Cajas y sueltas van en casillas separadas y la app muestra el total. Avisa de cifras que no tienen sentido.
- **Informe mensual en Excel (.xlsx).** Una hoja de total y una por local. El archivo se genera en el navegador, sin librerías.
- **Carga de datos.** Lee Excel de inventario (.xlsx), copias de seguridad (también de la versión anterior, BaristaStock) y CSV del catálogo.
- **Stock y pedidos.** Mínimo y "pedir hasta", pedidos por WhatsApp o email, entradas, mermas, ajustes y deshacer.

## Datos y privacidad

La app no lleva datos dentro. El catálogo real, los inventarios y el stock se guardan solo en el navegador de cada móvil y se cargan desde Más. Ver [SEGURIDAD.md](SEGURIDAD.md).

## Tecnología

HTML, CSS y JavaScript sin frameworks, en un solo archivo, con un service worker para el modo sin conexión. Tipografías alojadas en el propio repositorio (Archivo, Atkinson Hyperlegible Next y Big Shoulders Stencil, licencia SIL OFL).

## Autoría

Proyecto dirigido por Javier Matos: necesidades, diseño funcional y pruebas en el local. El código está generado con Claude (Anthropic).
