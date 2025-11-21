/**
 * Vercel Serverless Function - Buscar produtos do Google Sheets
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;
    const sheetName = 'Produtos';

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A2:O`, // Pula cabeçalho
    });

    const rows = response.data.values || [];
    
    const headers = [
      'id', 'data', 'nome', 'custo', 'custovariável', 'preçovenda',
      'taxashopeepercent', 'taxashopeefixa', 'impostopercent', 'cpamínimo', 'cpamáximo',
      'lucrolíquido', 'margempercent', 'status', 'timestamp'
    ];

    const products = rows.map(row => {
      const product = {};
      headers.forEach((header, index) => {
        product[header] = row[index] || '';
      });
      return product;
    });

    return res.status(200).json({
      success: true,
      products: products,
    });

  } catch (error) {
    console.error('Erro ao buscar produtos:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao buscar produtos',
      products: [],
    });
  }
}

