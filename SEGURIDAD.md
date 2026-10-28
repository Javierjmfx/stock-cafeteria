# Seguridad

La app no lleva datos dentro. El catálogo, los inventarios y el stock viven solo en cada móvil (almacenamiento del navegador). Al repositorio solo puede ir el código.

## Qué está protegido

- **`.gitignore`**: Git ignora JSON, Excel, CSV, PDF, fotos, copias, bases de datos, `.env` y claves.
- **Guardia (`.githooks/`)**: antes de cada commit revisa lo que vas a guardar y lo bloquea si:
  - no es un archivo de la app (index.html, sw.js, manifest, iconos, fuentes);
  - pesa más de 1 MB;
  - contiene un producto o proveedor del catálogo real, un nombre de `nombres-privados.txt`, un móvil, un email, una contraseña o una clave (GitHub, Supabase, API).
- **Candado de publicación**: `git push` está bloqueado. Para publicar hay que decirlo expresamente.
- **En la app**: política de seguridad (CSP) que no deja cargar nada de otros dominios ni enviar datos fuera, `noindex` y `robots.txt` para que no aparezca en Google, y sin referrer.

Los nombres a proteger están en `catalogo-privado.json` y `nombres-privados.txt`, **fuera** de esta carpeta. Si los metes dentro, la guardia no los encuentra y los propios archivos quedarían expuestos.

## Activarlo (una vez, en la carpeta del repositorio)

```
git config core.hooksPath .githooks
node .githooks/guardia.js revisar
```

Necesita Node (ya lo tienes). Para publicar de verdad:

- PowerShell: `$env:PUBLICAR='si'; git push; Remove-Item Env:PUBLICAR`
- Git Bash: `PUBLICAR=si git push`

## Ojo

- **Subir archivos desde la web de GitHub se salta todo esto.** Si lo haces así, arrastra solo los archivos de la app, nunca la carpeta de arriba.
- El repositorio `stock-cafeteria` es **público**: cualquiera puede leer el código (no los datos). El historial está limpio: solo tiene el catálogo de ejemplo.
- Las copias de seguridad (.json) y los Excel son los datos de la empresa: guárdalos fuera del repositorio y no los compartas en grupos.
