const nodemailer = require('nodemailer');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method not allowed' }) };
  }

  try {
    const data = JSON.parse(event.body);

    if (!data.brand || !data.objective || !data.timeline || !data.duration) {
      return { statusCode: 400, body: JSON.stringify({ message: 'Faltan campos requeridos' }) };
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'team@alecadario.com',
      subject: `Nuevo brief de contenido: ${data.brand}`,
      html: `
        <h2>Nuevo brief recibido desde alecadario.com</h2>
        <table cellpadding="8" cellspacing="0" style="border-collapse:collapse; width:100%;">
          <tr><td style="font-weight:bold; width:160px;">Marca / Empresa</td><td>${data.brand}</td></tr>
          <tr style="background:#f5f5f5"><td style="font-weight:bold;">Objetivo</td><td>${data.objective}</td></tr>
          <tr><td style="font-weight:bold;">Videos / duración</td><td>${data.duration}</td></tr>
          <tr style="background:#f5f5f5"><td style="font-weight:bold;">Presupuesto</td><td>${data.budget || 'No especificado'}</td></tr>
          <tr><td style="font-weight:bold;">Timeline</td><td>${data.timeline}</td></tr>
          <tr style="background:#f5f5f5"><td style="font-weight:bold;">Detalles</td><td>${data.details || '—'}</td></tr>
        </table>
      `,
    });

    return { statusCode: 200, body: JSON.stringify({ message: 'Brief enviado exitosamente' }) };
  } catch (error) {
    console.error('Error:', error);
    return { statusCode: 500, body: JSON.stringify({ message: 'Error procesando el brief' }) };
  }
};
