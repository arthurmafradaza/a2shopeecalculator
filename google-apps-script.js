/**
 * 🚀 GOOGLE APPS SCRIPT - Configuração Automática
 * 
 * ⚡ SETUP RÁPIDO (5 minutos):
 * 
 * 1. Crie uma planilha no Google Sheets (pode ser vazia!)
 * 2. Extensões → Apps Script
 * 3. DELETE tudo e COLE este código
 * 4. Salve (Ctrl+S)
 * 5. Implantar → Nova implantação → Aplicativo da Web
 * 6. Configure:
 *    - Executar como: "Eu"
 *    - Acesso: "Qualquer pessoa" ⚠️ IMPORTANTE!
 * 7. Autorize quando pedir
 * 8. COPIE a URL e cole na calculadora
 * 
 * ✅ O script cria automaticamente a estrutura da planilha!
 */

// Nome da aba (pode alterar se quiser)
const SHEET_NAME = 'Produtos';

// Função para obter ou criar a planilha automaticamente
function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  
  if (!sheet) {
    // Cria a aba automaticamente se não existir
    sheet = ss.insertSheet(SHEET_NAME);
    
    // Define os cabeçalhos
    const headers = [
      'ID',
      'Data',
      'Nome',
      'Custo',
      'Custo Variável',
      'Preço Venda',
      'Taxa Shopee %',
      'Taxa Shopee Fixa',
      'Imposto %',
      'CPA Mínimo',
      'CPA Máximo',
      'Lucro Líquido',
      'Margem %',
      'Status',
      'Timestamp'
    ];
    
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    
    // Formata cabeçalho
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setFontWeight('bold');
    headerRange.setBackground('#4285f4');
    headerRange.setFontColor('#ffffff');
    headerRange.setHorizontalAlignment('center');
    
    // Congela primeira linha
    sheet.setFrozenRows(1);
    
    // Ajusta largura das colunas
    sheet.setColumnWidth(1, 100);  // ID
    sheet.setColumnWidth(2, 100);   // Data
    sheet.setColumnWidth(3, 200);   // Nome
    sheet.setColumnWidths(4, 12, 100); // Valores numéricos
  }
  
  return sheet;
}

// Função auxiliar para retornar resposta com CORS
function createResponse(data, statusCode = 200) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}

// POST - Salvar produto
function doPost(e) {
  try {
    let data;
    
    // Tenta pegar JSON direto primeiro
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        // Se não for JSON válido, tenta como string
        data = e.postData.contents;
      }
    } 
    // Se veio via formulário (URL encoded)
    else if (e.parameter) {
      // Se tem jsonData, tenta decodificar
      if (e.parameter.jsonData) {
        try {
          let jsonStr = e.parameter.jsonData;
          // Remove prefixo se existir
          jsonStr = jsonStr.replace(/^jsonData=/, '');
          // Decodifica URL encoding
          try {
            jsonStr = decodeURIComponent(jsonStr);
          } catch (decodeError) {
            // Se já está decodificado, continua
          }
          data = JSON.parse(jsonStr);
        } catch (parseError) {
          // Se falhar, tenta usar os parâmetros individuais
          Logger.log('Erro ao parsear jsonData: ' + parseError.toString());
          Logger.log('Valor recebido: ' + e.parameter.jsonData);
          data = e.parameter;
        }
      } else {
        // Usa os parâmetros individuais diretamente
        data = e.parameter;
      }
    } else {
      throw new Error('Nenhum dado recebido');
    }
    
    // Log para debug (pode ver em Extensões > Apps Script > Ver > Logs de execução)
    Logger.log('Dados recebidos: ' + JSON.stringify(data));
    
    // Calcular lucro e margem
    const receitaBruta = parseFloat(data.precoVenda) || 0;
    const custo = parseFloat(data.custo) || 0;
    const custoVariavel = parseFloat(data.custoVariavel) || 0;
    const taxaShopee = receitaBruta * (parseFloat(data.taxaShopeePercent) / 100);
    const taxaFixa = parseFloat(data.taxaShopeeFixa) || 0;
    const imposto = receitaBruta * (parseFloat(data.impostoPercent) / 100);
    const cpaMedio = ((parseFloat(data.cpaMin) || 0) + (parseFloat(data.cpaMax) || 0)) / 2;
    
    const totalCustos = taxaShopee + taxaFixa + imposto + custo + custoVariavel + cpaMedio;
    const lucroLiquido = receitaBruta - totalCustos;
    const margem = receitaBruta > 0 ? (lucroLiquido / receitaBruta) * 100 : 0;
    
    let status = 'Excelente';
    if (margem < 0) status = 'Prejuízo';
    else if (margem < 5) status = 'Risco Alto';
    else if (margem < 15) status = 'Viável';
    else if (margem < 25) status = 'Bom';
    
    const row = [
      data.id || Date.now(),
      new Date().toLocaleDateString('pt-BR'),
      data.nome || '',
      custo,
      custoVariavel,
      receitaBruta,
      parseFloat(data.taxaShopeePercent) || 0,
      parseFloat(data.taxaShopeeFixa) || 0,
      parseFloat(data.impostoPercent) || 0,
      parseFloat(data.cpaMin) || 0,
      parseFloat(data.cpaMax) || 0,
      lucroLiquido,
      margem,
      status,
      new Date().toISOString()
    ];
    
    // Garante que a aba existe e tem cabeçalhos
    const sheet = getSheet();
    
    // Verifica se tem cabeçalhos (se não tiver, cria)
    const lastRow = sheet.getLastRow();
    if (lastRow === 0) {
      // Cria cabeçalhos se não existirem
      const headers = [
        'ID',
        'Data',
        'Nome',
        'Custo',
        'Custo Variável',
        'Preço Venda',
        'Taxa Shopee %',
        'Taxa Shopee Fixa',
        'Imposto %',
        'CPA Mínimo',
        'CPA Máximo',
        'Lucro Líquido',
        'Margem %',
        'Status',
        'Timestamp'
      ];
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.getRange(1, 1, 1, headers.length).setBackground('#4285f4');
      sheet.getRange(1, 1, 1, headers.length).setFontColor('#ffffff');
      sheet.getRange(1, 1, 1, headers.length).setHorizontalAlignment('center');
    }
    
    // Log da linha que será adicionada
    Logger.log('Adicionando linha: ' + JSON.stringify(row));
    
    // Adiciona a linha
    sheet.appendRow(row);
    
    // Força o flush para garantir que foi salvo
    SpreadsheetApp.flush();
    
    // Log de confirmação
    Logger.log('Linha adicionada com sucesso na linha: ' + sheet.getLastRow());
    
    return createResponse({
      success: true,
      message: 'Produto salvo com sucesso!',
      id: row[0],
      rowNumber: sheet.getLastRow()
    });
      
  } catch (error) {
    return createResponse({
      success: false,
      error: error.toString()
    }, 400);
  }
}

// GET - Buscar produtos
function doGet(e) {
  try {
    const sheet = getSheet();
    const data = sheet.getDataRange().getValues();
    
    // Se não tem dados, retorna vazio
    if (data.length <= 1) {
      return createResponse({ success: true, products: [] });
    }
    
    // Pular cabeçalho
    const headers = data[0];
    const rows = data.slice(1);
    
    const products = rows.map(row => {
      const product = {};
      headers.forEach((header, index) => {
        const key = header.toLowerCase().replace(/\s+/g, '').replace('%', 'Percent');
        product[key] = row[index];
      });
      return product;
    });
    
    return createResponse({ success: true, products: products });
      
  } catch (error) {
    return createResponse({ 
      success: false, 
      error: error.toString()
    }, 400);
  }
}

