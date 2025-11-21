# 🚀 Configuração Rápida do Google Sheets

## Método 1: Script Automático (Mais Rápido) ⚡

### Passo 1: Criar Nova Planilha
1. Acesse [Google Sheets](https://sheets.google.com)
2. Clique em **"Em branco"** para criar uma nova planilha
3. Dê um nome (ex: "Produtos Shopee")

### Passo 2: Configurar Apps Script
1. Na planilha, vá em **Extensões** → **Apps Script**
2. **DELETE** todo o código que está lá
3. **COLE** o código do arquivo `google-apps-script.js`
4. Clique em **Salvar** (💾) ou `Ctrl+S`
5. Dê um nome ao projeto (ex: "Shopee Calculator API")

### Passo 3: Fazer o Deploy
1. Clique em **"Implantar"** (no topo) → **"Nova implantação"**
2. Clique no ícone de **engrenagem** ⚙️ ao lado de "Selecionar tipo"
3. Escolha **"Aplicativo da Web"**
4. Configure:
   - **Descrição**: "API para Shopee Calculator"
   - **Executar como**: "Eu"
   - **Quem tem acesso**: **"Qualquer pessoa"** (importante!)
5. Clique em **"Implantar"**
6. **AUTORIZE** o acesso quando solicitado:
   - Clique em **"Autorizar o acesso"**
   - Escolha sua conta Google
   - Clique em **"Avançado"** → **"Ir para [nome do projeto] (não seguro)"**
   - Clique em **"Permitir"**
7. **COPIE** a URL do Web App (algo como: `https://script.google.com/macros/s/...`)

### Passo 4: Configurar na Calculadora
1. Abra a calculadora
2. Clique no ícone de **banco de dados** (Database) no header
3. Cole a URL que você copiou
4. Clique em **"Salvar URL"**
5. Pronto! 🎉

---

## Método 2: Usar Planilha Existente

Se você já tem uma planilha:
1. Abra sua planilha
2. Siga os **Passos 2 e 3** acima
3. O script criará automaticamente a aba "Produtos" se não existir

---

## 📋 Estrutura da Planilha

O script cria automaticamente estas colunas:

| Coluna | Descrição |
|--------|-----------|
| ID | Identificador único |
| Data | Data de criação |
| Nome | Nome do produto |
| Custo | Custo do produto |
| Custo Variável | Embalagem, etiquetas, etc |
| Preço Venda | Preço de venda |
| Taxa Shopee % | Percentual da taxa |
| Taxa Shopee Fixa | Taxa fixa |
| Imposto % | Percentual de imposto |
| CPA Mínimo | CPA mínimo |
| CPA Máximo | CPA máximo |
| Lucro Líquido | Calculado automaticamente |
| Margem % | Calculada automaticamente |
| Status | Prejuízo/Risco Alto/Viável/Bom/Excelente |
| Timestamp | Data/hora completa |

---

## ✅ Teste Rápido

1. Configure a URL na calculadora
2. Preencha um produto e clique em **"Salvar Produto"**
3. Verifique se apareceu na planilha
4. Clique em **"Carregar do Google Sheets"** para importar

---

## 🔧 Solução de Problemas

### Erro: "Você precisa de permissão"
- Certifique-se de que escolheu **"Qualquer pessoa"** no deploy
- Refaça o deploy se necessário

### Erro: "Não foi possível acessar"
- Verifique se a URL está correta
- Certifique-se de que fez o deploy corretamente

### Produtos não aparecem
- Verifique se a aba se chama exatamente **"Produtos"**
- Verifique o console do navegador (F12) para erros

---

## 🎯 Dica Pro

Você pode compartilhar a URL do Web App com sua equipe, e todos poderão salvar produtos na mesma planilha!

