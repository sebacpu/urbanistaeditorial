const Busboy = require('busboy');
const nodemailer = require('nodemailer');

module.exports.config = { api: { bodyParser: false } };

const MOTIVOS = {
  manuscrito: 'Quiero publicar mi manuscrito',
  servicio: 'Cotizar un servicio independiente',
  semaforo: 'Enviar una obra para SEMÁFORO',
  otra: 'Otra consulta'
};

const EXT_OK = new Set(['pdf', 'doc', 'docx', 'odt', 'rtf', 'txt']);
const MAX_FILE = 4 * 1024 * 1024;

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(body));
}

function esc(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function parseMultipart(req) {
  return new Promise((resolve, reject) => {
    const fields = {};
    const files = [];
    let limited = false;
    const bb = Busboy({
      headers: req.headers,
      limits: { fileSize: MAX_FILE, files: 1, fields: 20 }
    });

    bb.on('field', (name, val) => {
      fields[name] = val;
    });

    bb.on('file', (name, stream, info) => {
      const chunks = [];
      stream.on('data', (d) => chunks.push(d));
      stream.on('limit', () => {
        limited = true;
        stream.resume();
      });
      stream.on('end', () => {
        if (!info.filename) return;
        files.push({
          field: name,
          filename: info.filename,
          mime: info.mimeType || 'application/octet-stream',
          buffer: Buffer.concat(chunks)
        });
      });
    });

    bb.on('error', reject);
    bb.on('finish', () => {
      if (limited) {
        reject(Object.assign(new Error('El archivo supera los 4 MB.'), { status: 413 }));
        return;
      }
      resolve({ fields, files });
    });

    req.pipe(bb);
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    json(res, 405, { ok: false, error: 'Método no permitido.' });
    return;
  }

  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = Number(process.env.SMTP_PORT || 587);
  const to = process.env.MAIL_TO || 'contacto@urbanistaeditorial.com';

  if (!user || !pass) {
    json(res, 503, { ok: false, error: 'El correo del formulario aún no está configurado.' });
    return;
  }

  let parsed;
  try {
    parsed = await parseMultipart(req);
  } catch (err) {
    json(res, err.status || 400, { ok: false, error: err.message || 'No se pudo leer el formulario.' });
    return;
  }

  const { fields, files } = parsed;
  if (fields.empresa) {
    json(res, 200, { ok: true });
    return;
  }

  const nombre = (fields.nombre || '').trim();
  const correo = (fields.correo || '').trim();
  const motivo = fields.motivo || '';
  const mensaje = (fields.mensaje || '').trim();
  const seudonimo = (fields.seudonimo || '').trim();
  const presentacion = (fields.presentacion || '').trim();
  const obraIntro = (fields.obra_intro || '').trim();

  if (!nombre || !correo || !motivo || !mensaje) {
    json(res, 400, { ok: false, error: 'Faltan campos obligatorios.' });
    return;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
    json(res, 400, { ok: false, error: 'El correo no es válido.' });
    return;
  }
  if (!MOTIVOS[motivo]) {
    json(res, 400, { ok: false, error: 'El motivo no es válido.' });
    return;
  }

  const adjunto = files.find((f) => f.field === 'obra' && f.filename);
  if (motivo === 'semaforo') {
    if (!seudonimo || !presentacion || !obraIntro) {
      json(res, 400, { ok: false, error: 'Completa los campos de SEMÁFORO.' });
      return;
    }
    if (!adjunto) {
      json(res, 400, { ok: false, error: 'Adjunta tu obra para SEMÁFORO.' });
      return;
    }
    const ext = adjunto.filename.split('.').pop().toLowerCase();
    if (!EXT_OK.has(ext)) {
      json(res, 400, { ok: false, error: 'El archivo debe ser PDF, Word u OpenDocument.' });
      return;
    }
  }

  const motivoLabel = MOTIVOS[motivo];
  const lineas = [
    `Nombre: ${nombre}`,
    `Correo: ${correo}`,
    `Motivo: ${motivoLabel}`,
    ''
  ];
  if (motivo === 'semaforo') {
    lineas.push(
      `Nombre o pseudónimo: ${seudonimo}`,
      '',
      'Presentación personal:',
      presentacion,
      '',
      'Presentación de la obra:',
      obraIntro,
      ''
    );
  }
  lineas.push('Mensaje:', mensaje);

  const html = `
    <p><strong>Nombre:</strong> ${esc(nombre)}<br>
    <strong>Correo:</strong> ${esc(correo)}<br>
    <strong>Motivo:</strong> ${esc(motivoLabel)}</p>
    ${motivo === 'semaforo' ? `
      <p><strong>Nombre o pseudónimo:</strong> ${esc(seudonimo)}</p>
      <p><strong>Presentación personal</strong><br>${esc(presentacion).replace(/\n/g, '<br>')}</p>
      <p><strong>Presentación de la obra</strong><br>${esc(obraIntro).replace(/\n/g, '<br>')}</p>
    ` : ''}
    <p><strong>Mensaje</strong><br>${esc(mensaje).replace(/\n/g, '<br>')}</p>
  `;

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass }
  });

  try {
    await transporter.sendMail({
      from: `"Urbanista Editorial" <${user}>`,
      to,
      replyTo: `"${nombre.replace(/"/g, '')}" <${correo}>`,
      subject: `[Urbanista] ${motivoLabel} — ${nombre}`,
      text: lineas.join('\n'),
      html,
      attachments: adjunto
        ? [{ filename: adjunto.filename, content: adjunto.buffer, contentType: adjunto.mime }]
        : []
    });
  } catch (err) {
    console.error('SMTP', err);
    json(res, 502, { ok: false, error: 'No se pudo enviar el correo. Inténtalo más tarde.' });
    return;
  }

  json(res, 200, { ok: true });
};
