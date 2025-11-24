# 📁 Configuração do Google Drive para Imagens

Para salvar as fotos dos produtos minerados, precisamos configurar o Google Drive.
Siga estes passos:

## 1. Ativar a API do Google Drive
1.  Acesse o [Google Cloud Console](https://console.cloud.google.com).
2.  Certifique-se de estar no mesmo projeto que usou para o Google Sheets.
3.  Vá em **APIs e Serviços** -> **Biblioteca**.
4.  Pesquise por **"Google Drive API"**.
5.  Clique em **Ativar**.

## 2. Criar a Pasta no Google Drive
1.  Acesse seu [Google Drive](https://drive.google.com).
2.  Crie uma nova pasta (ex: `Mineracao Imagens`).
3.  Abra a pasta.

## 3. Compartilhar com o Robô
1.  Dentro da pasta, clique no nome dela e vá em **Compartilhar**.
2.  No campo de adicionar pessoas, cole o email do seu robô (Service Account):
    *   Email: `shopee-calculator@elated-practice-423912-j6.iam.gserviceaccount.com`
3.  Defina a permissão como **Editor**.
4.  Clique em **Enviar**.

## 4. Pegar o ID da Pasta
1.  Olhe para a URL da pasta no seu navegador.
2.  Ela será algo como: `https://drive.google.com/drive/u/0/folders/1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
3.  O **ID** é a parte final: `1aBcDeFgHiJkLmNoPqRsTuVwXyZ`
4.  Copie esse código.

## 5. Configurar no Vercel
1.  Vá no painel do seu projeto no **Vercel**.
2.  **Settings** -> **Environment Variables**.
3.  Adicione uma nova variável:
    *   **Key**: `GOOGLE_DRIVE_FOLDER_ID`
    *   **Value**: (Cole o ID que você copiou no passo 4)
4.  Clique em **Save**.

---

## ✅ Pronto!
Depois de fazer isso, me avise que eu começo a programar a parte de upload!
