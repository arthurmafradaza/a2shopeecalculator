# 🚀 Setup Webhook com Vercel + Google Sheets API

Esta solução usa **Vercel Serverless Functions** + **Google Sheets API oficial**. Muito mais confiável que Apps Script!

## 📋 O que você precisa:

1. ✅ Conta Google (já tem)
2. ✅ Projeto no Vercel (já tem)
3. ⚠️ Service Account do Google (vamos criar)

---

## 🔧 Passo 1: Criar Service Account no Google Cloud

1. Acesse: https://console.cloud.google.com
2. Crie um novo projeto ou selecione um existente
3. Vá em **APIs e Serviços** → **Biblioteca**
4. Procure por **"Google Sheets API"** e **ative**
5. Vá em **APIs e Serviços** → **Credenciais**
6. Clique em **Criar credenciais** → **Conta de serviço**
7. Dê um nome (ex: "shopee-calculator")
8. Clique em **Criar e continuar**
9. Pule a etapa de função (ou adicione "Editor")
10. Clique em **Concluído**
11. Clique na conta de serviço criada
12. Vá na aba **Chaves**
13. Clique em **Adicionar chave** → **Criar nova chave**
14. Escolha **JSON**
15. **BAIXE** o arquivo JSON (guarde seguro!)

---

## 📊 Passo 2: Compartilhar Planilha com Service Account

1. Abra o arquivo JSON que você baixou
2. Copie o email que está em `"client_email"` (algo como: `shopee-calculator@...iam.gserviceaccount.com`)
3. Abra sua planilha do Google Sheets
4. Clique em **Compartilhar** (botão azul no canto superior direito)
5. Cole o email do service account
6. Dê permissão de **Editor**
7. Clique em **Enviar**
8. **Copie o ID da planilha** da URL:
   - A URL é algo como: `https://docs.google.com/spreadsheets/d/ABC123xyz.../edit`
   - O ID é a parte `ABC123xyz...`

---

## 🔐 Passo 3: Configurar Variáveis de Ambiente no Vercel

1. Acesse seu projeto no Vercel
2. Vá em **Settings** → **Environment Variables**
3. Adicione estas variáveis:

### `GOOGLE_SERVICE_ACCOUNT_EMAIL`
- Valor: O email do service account (do arquivo JSON, campo `client_email`)

### `GOOGLE_PRIVATE_KEY`
- Valor: A chave privada do service account (do arquivo JSON, campo `private_key`)
- **IMPORTANTE**: Cole a chave completa, incluindo `-----BEGIN PRIVATE KEY-----` e `-----END PRIVATE KEY-----`

### `GOOGLE_SHEET_ID`
- Valor: O ID da planilha que você copiou no Passo 2

4. Clique em **Save** para cada variável

---

## 📦 Passo 4: Instalar Dependências

No terminal do seu projeto:

```bash
npm install googleapis
```

---

## 🚀 Passo 5: Fazer Deploy

1. Faça commit das mudanças:
```bash
git add .
git commit -m "Add Vercel API routes for Google Sheets"
git push
```

2. O Vercel vai fazer deploy automaticamente!

---

## ✅ Passo 6: Atualizar URL na Calculadora

1. Depois do deploy, sua API estará em:
   - `https://seu-projeto.vercel.app/api/save-product`
   - `https://seu-projeto.vercel.app/api/get-products`

2. Na calculadora, clique no ícone de Database
3. Cole a URL: `https://seu-projeto.vercel.app/api/save-product`
4. Clique em **Salvar URL**

---

## 🎯 Teste

1. Preencha um produto na calculadora
2. Clique em **Salvar Produto**
3. Verifique a planilha → deve aparecer! 🎉

---

## 🆘 Problemas?

**Erro 403 (Forbidden)**
→ Verifique se compartilhou a planilha com o service account

**Erro 401 (Unauthorized)**
→ Verifique se as variáveis de ambiente estão corretas no Vercel

**Erro 404 (Not Found)**
→ Verifique se o ID da planilha está correto

**Produtos não aparecem**
→ Verifique os logs do Vercel (Deployments → Functions → Logs)

---

## 💡 Vantagens desta solução:

✅ Mais confiável que Apps Script
✅ Sem problemas de CORS
✅ Logs detalhados no Vercel
✅ Escalável e profissional
✅ Usa API oficial do Google

