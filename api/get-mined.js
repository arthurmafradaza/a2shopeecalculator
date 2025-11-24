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

        // Dynamic sheet name based on type query parameter
        const type = req.query.type || 'shopee';
        const sheetName = type === 'criativos' ? 'Criativos' : 'Mineracao';

        // Verifica se a aba existe
        try {
            await sheets.spreadsheets.values.get({
                spreadsheetId,
                range: `${sheetName}!A1`,
            });
        } catch (error) {
            // Se a aba não existe, retorna lista vazia
            return res.status(200).json({ success: true, products: [] });
        }

        // Busca os dados
        const response = await sheets.spreadsheets.values.get({
            spreadsheetId,
            range: `${sheetName}!A:G`, // A até G (Incluindo Imagem)
        });

        const rows = response.data.values;

        if (!rows || rows.length === 0) {
            return res.status(200).json({ success: true, products: [] });
        }

        // Remove cabeçalho
        const headers = rows[0];
        const dataRows = rows.slice(1);

        const products = dataRows.map(row => {
            return {
                id: row[0],
                date: row[1],
                name: row[2],
                link: row[3],
                reason: row[4],
                timestamp: row[5],
                image: row[6] || null // Nova coluna: Imagem
            };
        }).reverse(); // Mais recentes primeiro

        return res.status(200).json({
            success: true,
            products: products,
        });

    } catch (error) {
        console.error('Erro ao buscar produtos minerados:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao buscar produtos minerados',
        });
    }
}
