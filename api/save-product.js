/**
 * Vercel Serverless Function - Salvar produto no Google Sheets
 * 
 * Esta função recebe dados do frontend e salva no Google Sheets
 * usando a API oficial do Google.
 */

import { google } from 'googleapis';

export default async function handler(req, res) {
  // Permite CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Método não permitido' });
  }

  try {
    const product = req.body;

    // Log para debug
    console.log('Produto recebido:', JSON.stringify(product));

    // Validação básica
    if (!product.nome || product.nome.trim() === '') {
      return res.status(400).json({ success: false, error: 'Nome do produto é obrigatório' });
    }

    // Configuração do Google Sheets API
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

    // Calcular lucro e margem
    const receitaBruta = parseFloat(product.precoVenda) || 0;
    const custo = parseFloat(product.custo) || 0;
    const custoVariavel = parseFloat(product.custoVariavel) || 0;
    const taxaShopee = receitaBruta * (parseFloat(product.taxaShopeePercent) || 0) / 100;
    const taxaFixa = parseFloat(product.taxaShopeeFixa) || 0;
    const imposto = receitaBruta * (parseFloat(product.impostoPercent) || 0) / 100;
    const cpaMedio = ((parseFloat(product.cpaMin) || 0) + (parseFloat(product.cpaMax) || 0)) / 2;

    const totalCustos = taxaShopee + taxaFixa + imposto + custo + custoVariavel + cpaMedio;
    const lucroLiquido = receitaBruta - totalCustos;
    const margem = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;

    let status = 'Excelente';
    if (margem < 0) status = 'Prejuízo';
    else if (margem < 5) status = 'Risco Alto';
    else if (margem < 15) status = 'Viável';
    else if (margem < 25) status = 'Bom';

    const margemDesejada = parseFloat(product.margemDesejada) || 0;

    const row = [
      product.id || Date.now(),
      new Date().toLocaleDateString('pt-BR'),
      product.nome || '',
      custo,
      custoVariavel,
      receitaBruta,
      parseFloat(product.taxaShopeePercent) || 0,
      parseFloat(product.taxaShopeeFixa) || 0,
      parseFloat(product.impostoPercent) || 0,
      parseFloat(product.cpaMin) || 0,
      parseFloat(product.cpaMax) || 0,
      lucroLiquido,
      margem,
      margemDesejada,
      status,
      new Date().toISOString(),
    ];

    // Verifica se a aba existe, se não, cria
    try {
      await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1`,
      });
    } catch (error) {
      // Se a aba não existe, cria
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [{
            addSheet: {
              properties: {
                title: sheetName,
              },
            },
          }],
        },
      });

      // Adiciona cabeçalhos
      const headers = [
        'ID', 'Data', 'Nome', 'Custo', 'Custo Variável', 'Preço Venda',
        'Taxa Shopee %', 'Taxa Shopee Fixa', 'Imposto %', 'CPA Mínimo', 'CPA Máximo',
        'Lucro Líquido', 'Margem %', 'Margem Desejada %', 'Status', 'Timestamp'
      ];
      
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:O1`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [headers],
        },
      });

      // Formata cabeçalho
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: await getSheetId(sheets, spreadsheetId, sheetName),
                  startRowIndex: 0,
                  endRowIndex: 1,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.26, green: 0.52, blue: 0.96 },
                    textFormat: { foregroundColor: { red: 1, green: 1, blue: 1 }, bold: true },
                    horizontalAlignment: 'CENTER',
                  },
                },
                fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment)',
              },
            },
          ],
        },
      });
    }

      // Adiciona a linha
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:P`,
        valueInputOption: 'RAW',
        requestBody: {
          values: [row],
        },
      });

    return res.status(200).json({
      success: true,
      message: 'Produto salvo com sucesso!',
      id: row[0],
    });

  } catch (error) {
    console.error('Erro ao salvar produto:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Erro ao salvar produto',
    });
  }
}

// Função auxiliar para obter o ID da aba
async function getSheetId(sheets, spreadsheetId, sheetName) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
  return sheet ? sheet.properties.sheetId : null;
}

