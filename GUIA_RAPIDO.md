# ⚡ GUIA RÁPIDO - 5 Minutos

## 🎯 O que você precisa fazer:

### 1️⃣ Criar Planilha (30 segundos)
- Acesse: https://sheets.google.com
- Clique em **"Em branco"**
- Dê um nome (ex: "Produtos Shopee")
- **Pode deixar vazia!** O script cria tudo automaticamente

### 2️⃣ Configurar Script (2 minutos)
- Na planilha: **Extensões** → **Apps Script**
- **DELETE** todo código existente
- **COLE** o código do arquivo `google-apps-script.js`
- **Salve** (Ctrl+S ou ícone 💾)

### 3️⃣ Fazer Deploy (2 minutos)
- Clique em **"Implantar"** (canto superior direito)
- Escolha **"Nova implantação"**
- Clique na **engrenagem** ⚙️ → **"Aplicativo da Web"**
- Configure:
  ```
  Executar como: Eu
  Quem tem acesso: Qualquer pessoa ← IMPORTANTE!
  ```
- Clique **"Implantar"**
- **Autorize** quando pedir:
  - Clique "Autorizar acesso"
  - Escolha sua conta
  - "Avançado" → "Ir para [projeto] (não seguro)"
  - "Permitir"
- **COPIE** a URL que aparece (algo como: `https://script.google.com/macros/s/...`)

### 4️⃣ Configurar na Calculadora (30 segundos)
- Abra a calculadora
- Clique no ícone **📊** (Database) no header
- Cole a URL
- Clique **"Salvar URL"**
- **PRONTO!** 🎉

---

## ✅ Teste

1. Preencha um produto na calculadora
2. Clique em **"Salvar Produto"**
3. Abra sua planilha → deve aparecer o produto!
4. Clique **"Carregar do Google Sheets"** para importar

---

## 🆘 Problemas?

**"Você precisa de permissão"**
→ Certifique-se que escolheu **"Qualquer pessoa"** no deploy

**"Não foi possível acessar"**
→ Verifique se copiou a URL completa

**Produtos não aparecem**
→ Abra o console (F12) e veja se há erros

---

## 💡 Dica

O script **cria automaticamente** a estrutura da planilha na primeira vez que você salvar um produto. Não precisa criar nada manualmente!

