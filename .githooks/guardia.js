#!/usr/bin/env node
/* Guardia del repositorio: impide que datos reales lleguen a GitHub.
   Se ejecuta sola antes de cada commit y de cada push (ver SEGURIDAD.md).
   Uso: node .githooks/guardia.js commit | push | revisar */
'use strict';
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const modo = process.argv[2] || 'revisar';
const git = (...a) => execFileSync('git', a, { encoding: 'buffer', maxBuffer: 64 * 1024 * 1024 });
const raiz = git('rev-parse', '--show-toplevel').toString().trim();

/* 1) Solo pueden subirse los archivos de la app */
const PERMITIDOS = /^(index\.html|sw\.js|manifest\.webmanifest|robots\.txt|README\.md|SEGURIDAD\.md|\.gitignore|\.githooks\/[\w.-]+|[\w-]+\.woff2|fonts\/[\w.-]+\.(woff2|txt)|(icon|apple-touch-icon)[\w-]*\.(png|svg)|icon\.svg)$/;
const MAX_BYTES = 1024 * 1024; // nada de más de 1 MB

/* 2) Contenido prohibido: nombres del catálogo real y secretos */
const SECRETOS = [
  [/-----BEGIN [A-Z ]*PRIVATE KEY-----/, 'clave privada'],
  [/\b(ghp|gho|ghu|ghs|github_pat)_[A-Za-z0-9_]{20,}/, 'token de GitHub'],
  [/\bsk-[A-Za-z0-9_-]{20,}/, 'clave de API'],
  [/\bAKIA[0-9A-Z]{16}\b/, 'clave de AWS'],
  [/\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/, 'token JWT (¿clave de Supabase?)'],
  [/\b(service_role|SUPABASE_[A-Z_]*KEY|anon[_-]?key)\b\s*[:=]\s*['"][^'"]{12,}/i, 'clave de Supabase'],
  [/(password|contraseña|passwd)\s*[:=]\s*['"][^'"]{4,}/i, 'contraseña escrita en el código'],
  [/\b[67]\d{2}[ .]?\d{3}[ .]?\d{3}\b/, 'número de móvil'],
  [/[A-Z0-9._%+-]+@(?!example\.|ejemplo\.)[A-Z0-9.-]+\.[A-Z]{2,}/i, 'dirección de email']
];
/* Nombres reales: se leen del catálogo privado, que está FUERA del repositorio */
function nombresReales() {
  const out = new Set();
  const candidatos = [path.join(raiz, '..', 'catalogo-privado.json'), process.env.CATALOGO_PRIVADO || ''].filter(Boolean);
  for (const f of candidatos) {
    try {
      const d = JSON.parse(fs.readFileSync(f, 'utf8'));
      (d.productos || []).forEach(p => {
        if (p.nombre && String(p.nombre).length >= 12) out.add(String(p.nombre).toUpperCase());
        if (p.prov && String(p.prov).length >= 4 && !/^sin /i.test(p.prov)) out.add(String(p.prov).toUpperCase());
      });
      (d.proveedores || []).forEach(v => { if (v.nombre && v.nombre.length >= 4) out.add(String(v.nombre).toUpperCase()); if (v.tel) out.add(String(v.tel).replace(/\s/g, '')); if (v.email) out.add(String(v.email).toUpperCase()); });
    } catch (e) { /* sin catálogo privado: se revisa lo demás */ }
  }
  /* nombres propios (empresa, direcciones…): uno por línea en nombres-privados.txt, también FUERA del repositorio */
  try {
    fs.readFileSync(path.join(raiz, '..', 'nombres-privados.txt'), 'utf8').split(/\r?\n/)
      .map(x => x.trim()).filter(x => x.length >= 4 && x[0] !== '#').forEach(x => out.add(x.toUpperCase()));
  } catch (e) { /* opcional */ }
  return [...out];
}

function archivos() {
  if (modo === 'commit') return git('diff', '--cached', '--name-only', '--diff-filter=ACMR', '-z').toString().split('\0').filter(Boolean);
  return git('ls-files', '-z').toString().split('\0').filter(Boolean);
}
function contenido(f) {
  try { return modo === 'commit' ? git('show', ':' + f) : fs.readFileSync(path.join(raiz, f)); } catch (e) { return Buffer.alloc(0); }
}

const problemas = [];
const reales = nombresReales();
for (const f of archivos()) {
  if (!PERMITIDOS.test(f)) { problemas.push(`${f}: este tipo de archivo no se sube nunca (solo la app: index.html, sw.js, iconos, fuentes…)`); continue; }
  const buf = contenido(f);
  if (buf.length > MAX_BYTES) { problemas.push(`${f}: pesa ${(buf.length / 1048576).toFixed(1)} MB (máximo 1 MB)`); continue; }
  if (/\.(png|woff2)$/i.test(f)) continue;
  const t = buf.toString('utf8'), T = t.toUpperCase();
  for (const [re, que] of SECRETOS) { const m = re.exec(t); if (m) problemas.push(`${f}: contiene ${que} («${m[0].slice(0, 24)}…»)`); }
  let k = 0;
  for (const nom of reales) { if (T.indexOf(nom) >= 0) { if (k++ < 5) problemas.push(`${f}: contiene un dato del catálogo real («${nom.slice(0, 30)}»)`); } }
  if (k > 5) problemas.push(`${f}: y ${k - 5} datos reales más`);
}

/* 3) Candado de publicación: no se sube nada sin decirlo expresamente */
if (modo === 'push' && process.env.PUBLICAR !== 'si') {
  problemas.unshift('Publicar está bloqueado. Si de verdad quieres subirlo a GitHub, repite el push con PUBLICAR=si (ver SEGURIDAD.md).');
}

if (problemas.length) {
  console.error('\n✋ GUARDIA: no se ' + (modo === 'push' ? 'publica' : 'guarda') + ' nada.\n');
  problemas.forEach(p => console.error('  • ' + p));
  console.error('\nQuita esos archivos del commit (git restore --staged <archivo>) o corrige el contenido.\n');
  process.exit(1);
}
if (modo === 'revisar') console.log('Guardia: todo limpio. Nada de datos reales ni secretos.');
