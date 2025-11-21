# 🎯 PASSO A PASSO COMPLETO - Webhook Google Sheets

Vou te guiar passo a passo, sem complicação!

---

## 📝 PASSO 1: Criar Service Account no Google Cloud

### 1.1 Acessar Google Cloud
1. Abra: https://console.cloud.google.com
2. Se pedir login, faça login com sua conta Google

### 1.2 Criar ou Selecionar Projeto
1. No topo da página, ao lado do logo do Google, tem um dropdown com o nome do projeto
2. Clique nele
3. Se aparecer projetos, escolha um (ou crie um novo clicando em "NOVO PROJETO")
4. Dê um nome tipo "Shopee Calculator" e clique em "CRIAR"

### 1.3 Ativar Google Sheets API
1. No menu lateral esquerdo, clique em **"APIs e Serviços"**
2. Clique em **"Biblioteca"**
3. Na barra de busca, digite: **"Google Sheets API"**
4. Clique no resultado **"Google Sheets API"**
5. Clique no botão azul **"ATIVAR"**
6. Aguarde alguns segundos até aparecer "API ativada"

### 1.4 Criar Service Account
1. No menu lateral, clique em **"APIs e Serviços"** → **"Credenciais"**
2. No topo da página, clique em **"+ CRIAR CREDENCIAIS"**
3. Escolha **"Conta de serviço"**
4. Preencha:
   - **Nome da conta de serviço**: `shopee-calculator` (ou qualquer nome)
   - **ID da conta de serviço**: deixa como está (vai preencher automaticamente)
5. Clique em **"CRIAR E CONTINUAR"**
6. Na próxima tela, pode pular (ou adicionar função "Editor")
7. Clique em **"CONTINUAR"**
8. Clique em **"CONCLUÍDO"**

### 1.5 Baixar Chave JSON
1. Você vai ver uma lista com sua conta de serviço criada
2. Clique no **email** da conta (algo como `shopee-calculator@...`)
3. Vá na aba **"CHAVES"** (no topo)
4. Clique em **"ADICIONAR CHAVE"** → **"Criar nova chave"**
5. Escolha **"JSON"**
6. Clique em **"CRIAR"**
7. **Um arquivo vai baixar automaticamente!** ⬇️
8. **GUARDE ESSE ARQUIVO EM LUGAR SEGURO!** (você vai precisar dele)

---

## 📊 PASSO 2: Preparar a Planilha

### 2.1 Abrir o Arquivo JSON Baixado
1. Abra o arquivo JSON que você baixou (pode abrir no Bloco de Notas)
2. Procure por `"client_email"` (deve estar na linha 3 ou 4)
3. **COPIE** o email que está entre aspas (algo como: `shopee-calculator@projeto-123.iam.gserviceaccount.com`)
4. **GUARDE esse email!** Você vai usar agora

### 2.2 Compartilhar Planilha
1. Abra sua planilha do Google Sheets
2. Clique no botão azul **"Compartilhar"** (canto superior direito)
3. Cole o email que você copiou
4. Ao lado, escolha **"Editor"**
5. **DESMARQUE** a opção "Notificar pessoas" (não precisa)
6. Clique em **"Enviar"**
7. Pronto! A planilha está compartilhada

### 2.3 Copiar ID da Planilha
1. Olhe a URL da sua planilha no navegador
2. A URL é algo como: `https://docs.google.com/spreadsheets/d/ABC123xyz456DEF789/edit`
3. O **ID da planilha** é a parte `ABC123xyz456DEF789` (entre `/d/` e `/edit`)
4. **COPIE esse ID** e guarde!

---

## 🔐 PASSO 3: Configurar Variáveis no Vercel

### 3.1 Abrir o Arquivo JSON Novamente
1. Abra o arquivo JSON que você baixou
2. Procure por `"private_key"` (deve estar mais abaixo)
3. **COPIE TUDO** que está entre aspas, incluindo:
   - `-----BEGIN PRIVATE KEY-----`
   - Todo o texto no meio
   - `-----END PRIVATE KEY-----`
4. **COPIE TUDO DE UMA VEZ!** (é uma chave longa)

### 3.2 Acessar Vercel
1. Acesse: https://vercel.com
2. Faça login
3. Clique no seu projeto (Shopee Calculator)

### 3.3 Adicionar Variáveis de Ambiente
1. Clique em **"Settings"** (Configurações)
2. No menu lateral, clique em **"Environment Variables"** (Variáveis de Ambiente)
3. Vamos adicionar 3 variáveis:

#### Variável 1: GOOGLE_SERVICE_ACCOUNT_EMAIL
1. Clique em **"+ Add New"**
2. **Key (Nome)**: `GOOGLE_SERVICE_ACCOUNT_EMAIL`
3. **Value (Valor)**: Cole o email que você copiou no Passo 2.1 (o `client_email`)
4. Deixe marcado: **Production**, **Preview**, **Development**
5. Clique em **"Save"**

#### Variável 2: GOOGLE_PRIVATE_KEY
1. Clique em **"+ Add New"** novamente
2. **Key (Nome)**: `GOOGLE_PRIVATE_KEY`
3. **Value (Valor)**: Cole a chave privada que você copiou no Passo 3.1
   - **IMPORTANTE**: Cole EXATAMENTE como está, com as quebras de linha
   - Deve começar com `-----BEGIN PRIVATE KEY-----`
   - E terminar com `-----END PRIVATE KEY-----`
4. Deixe marcado: **Production**, **Preview**, **Development**
5. Clique em **"Save"**

#### Variável 3: GOOGLE_SHEET_ID
1. Clique em **"+ Add New"** novamente
2. **Key (Nome)**: `GOOGLE_SHEET_ID`
3. **Value (Valor)**: Cole o ID da planilha que você copiou no Passo 2.3
4. Deixe marcado: **Production**, **Preview**, **Development**
5. Clique em **"Save"**

✅ **Pronto!** Agora você tem as 3 variáveis configuradas!

---

## 📦 PASSO 4: Instalar Dependência

### 4.1 No Terminal
1. Abra o terminal na pasta do projeto
2. Execute:
```bash
npm install
```

Isso vai instalar o pacote `googleapis` que criamos.

---

## 🚀 PASSO 5: Fazer Deploy

### 5.1 Fazer Commit e Push
1. No terminal, execute:
```bash
git add .
git commit -m "Add Vercel API routes for Google Sheets"
git push
```

2. O Vercel vai fazer deploy automaticamente!

### 5.2 Verificar Deploy
1. Acesse seu projeto no Vercel
2. Vá em **"Deployments"** (Implantações)
3. Você vai ver um novo deploy rodando
4. Aguarde até aparecer **"Ready"** (Pronto) ✅

---

## ✅ PASSO 6: Configurar na Calculadora

### 6.1 Pegar URL da API
1. No Vercel, vá em **"Deployments"**
2. Clique no deploy mais recente (que está "Ready")
3. Você vai ver a URL do seu projeto (algo como: `https://seu-projeto.vercel.app`)
4. A URL da API será: `https://seu-projeto.vercel.app/api/save-product`
5. **COPIE essa URL completa!**

### 6.2 Configurar na Calculadora
1. Abra sua calculadora (local ou no Vercel)
2. Clique no ícone de **banco de dados** (Database) no header
3. Cole a URL: `https://seu-projeto.vercel.app/api/save-product`
4. Clique em **"Salvar URL"**
5. Pronto! 🎉

---

## 🎯 PASSO 7: TESTAR!

1. Preencha um produto na calculadora:
   - Nome: "Teste"
   - Custo: 50
   - Preço Venda: 100
   - (outros campos podem ficar como estão)

2. Clique em **"Salvar Produto"**

3. Deve aparecer: **"✅ Produto salvo no Google Sheets!"**

4. Abra sua planilha do Google Sheets

5. **O produto deve aparecer lá!** 🎉

---

## 🆘 SE DER ERRO:

### Erro 403 (Forbidden)
→ Você não compartilhou a planilha com o service account
→ Volte no Passo 2.2 e compartilhe novamente

### Erro 401 (Unauthorized)
→ As variáveis de ambiente estão erradas
→ Volte no Passo 3 e verifique se copiou tudo certo

### Erro 404 (Not Found)
→ O ID da planilha está errado
→ Volte no Passo 2.3 e copie o ID novamente

### Produto não aparece na planilha
→ Verifique os logs:
  1. No Vercel, vá em **"Deployments"**
  2. Clique no deploy
  3. Vá em **"Functions"** → **"save-product"**
  4. Veja os logs para identificar o erro

---

## 💡 DICA FINAL:

Se algo não funcionar, me manda:
1. Qual erro apareceu
2. O que você estava fazendo quando deu erro
3. Print do erro (se possível)

Vou te ajudar a resolver! 😊

