import { google } from 'googleapis';
import { Readable } from 'stream';

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
        if (!product.name || !product.link) {
            return res.status(400).json({ success: false, error: 'Nome e Link são obrigatórios' });
        }

        // Configuração da Autenticação (Compartilhada entre Sheets e Drive)
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
                'https://www.googleapis.com/auth/drive.file'
            ],
        });

        // 1. Upload da Imagem para o Google Drive (se houver)
        let imageLink = '';

        if (product.image) {
            try {
                const drive = google.drive({ version: 'v3', auth });
                const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

                // Converter Base64 para Stream
                const base64Data = product.image.split(';base64,').pop();
                const buffer = Buffer.from(base64Data, 'base64');
                const stream = Readable.from(buffer);

                const fileMetadata = {
                    name: `${product.name}_${Date.now()}.jpg`,
                    parents: [folderId],
                };

                const media = {
                    mimeType: 'image/jpeg',
                    body: stream,
                };

                // Upload do arquivo
                const file = await drive.files.create({
                    resource: fileMetadata,
                    media: media,
                    fields: 'id, webContentLink, webViewLink',
                });

                console.log('Imagem enviada para o Drive:', file.data.id);

                // Tornar o arquivo público (para visualização no site)
                await drive.permissions.create({
                    fileId: file.data.id,
                    requestBody: {
                        role: 'reader',
                        type: 'anyone',
                    },
                });

                // Usar webViewLink para visualização
                imageLink = file.data.webViewLink;

            } catch (driveError) {
                console.error('Erro no upload para o Drive:', driveError);
                // Não falha o request todo, apenas loga o erro e segue sem imagem
            }
        }

        // 2. Salvar no Google Sheets
        const sheets = google.sheets({ version: 'v4', auth });
        const spreadsheetId = process.env.GOOGLE_SHEET_ID;
        const sheetName = 'Mineracao';

        const row = [
            product.id || Date.now(),
            new Date().toLocaleDateString('pt-BR'),
            product.name || '',
            product.link || '',
            product.reason || '',
            new Date().toISOString(),
            imageLink || '' // Nova coluna: Imagem
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

            // Adiciona cabeçalhos (Atualizado com Imagem)
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
                                        backgroundColor: { red: 0.96, green: 0.64, blue: 0.26 },
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
            imageLink: imageLink
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
