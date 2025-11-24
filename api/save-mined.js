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
        console.log('Produto minerado recebido:', product.name);

        // Validação básica
        if (!product.name) {
            return res.status(400).json({ success: false, error: 'Nome é obrigatório' });
        }

        // Para produtos Shopee, o link é obrigatório
        if (product.type === 'shopee' && !product.link) {
            return res.status(400).json({ success: false, error: 'Link é obrigatório para produtos Shopee' });
        }

        // Upload da imagem para ImgBB (se houver)
        let imageUrl = '';

        if (product.image) {
            try {
                const base64Data = product.image.split(',')[1]; // Remove o prefixo data:image/...

                const formData = new URLSearchParams();
                formData.append('key', 'be7882f2f950406ba1a4311232bb3fc5');
                formData.append('image', base64Data);

                const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
                    method: 'POST',
                    body: formData,
                });

                const imgbbData = await imgbbResponse.json();

                if (imgbbData.success) {
                    imageUrl = imgbbData.data.url;
                    console.log('Imagem enviada para ImgBB:', imageUrl);
                } else {
                    console.error('Erro no upload para ImgBB:', imgbbData);
                }
            } catch (imgbbError) {
                console.error('Erro ao fazer upload para ImgBB:', imgbbError);
                // Continua sem imagem se der erro
            }
        }

        // Configuração da Autenticação
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        // Salvar no Google Sheets
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;

        // Dynamic sheet name based on type
        const sheetName = product.type === 'criativos' ? 'Criativos' : 'Mineracao';

        const row = [
            product.id || Date.now(),
            new Date().toLocaleDateString('pt-BR'),
            product.name || '',
            product.link || '',
            product.reason || '',
            new Date().toISOString(),
            imageUrl // URL da imagem no ImgBB
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
            const headers = ['ID', 'Data', 'Nome', 'Link', 'Motivo', 'Timestamp', 'Imagem'];

            await sheets.spreadsheets.values.update({
                spreadsheetId,
                range: `${sheetName}!A1:G1`,
                valueInputOption: 'RAW',
                requestBody: {
                    values: [headers],
                },
            });

            // Formata cabeçalho
            const headerColor = product.type === 'criativos'
                ? { red: 0.61, green: 0.35, blue: 0.71 } // Purple
                : { red: 0.96, green: 0.64, blue: 0.26 }; // Orange

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
                                        backgroundColor: headerColor,
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
            range: `${sheetName}!A:G`,
            valueInputOption: 'RAW',
            requestBody: {
                values: [row],
            },
        });

        return res.status(200).json({
            success: true,
            message: 'Produto minerado salvo com sucesso!',
            id: row[0],
            imageUrl: imageUrl
        });

    } catch (error) {
        console.error('Erro ao salvar produto minerado:', error);
        return res.status(500).json({
            success: false,
            error: error.message || 'Erro ao salvar produto minerado',
        });
    }
}

// Função auxiliar para obter o ID da aba
async function getSheetId(sheets, spreadsheetId, sheetName) {
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);
    return sheet ? sheet.properties.sheetId : null;
}
