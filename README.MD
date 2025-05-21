# Leitor de QR Code

Um aplicativo web moderno para leitura, decodificação e criação de QR Codes através da câmera, upload de imagem ou geração personalizada.

## Características

- 🔍 Escaneie QR Codes em tempo real com sua câmera
- 📤 Faça upload de imagens contendo QR Codes
- 🖨️ [Crie seus próprios QR Codes](https://jonathan-laco.github.io/qrcode/) de forma simples e rápida
- 📱 Interface responsiva para desktop e dispositivos móveis
- 🌙 Suporte a tema claro e escuro
- 📋 Exibição detalhada dos resultados com reconhecimento de tipos (URL, email, telefone, etc.)
- 📊 Histórico de escaneamentos armazenado localmente
- 📋 Função de copiar para área de transferência

## Tecnologias Utilizadas

- **Next.js** – Framework React para desenvolvimento web
- **Tailwind CSS** – Estilização e design responsivo
- **Shadcn UI** – Componentes de interface acessíveis e reutilizáveis
- **ZXing** – Biblioteca para decodificação de QR Codes
- **React Dropzone** – Manipulação de upload de arquivos
- **next-themes** – Gerenciamento de temas claro/escuro
- **LocalStorage API** – Armazenamento local do histórico de escaneamentos

## Como Usar

### Escaneamento com Câmera

1. Clique na aba **"Câmera"**
2. Selecione uma câmera disponível no menu suspenso
3. Clique em **"Iniciar Scanner"**
4. Posicione o QR Code dentro da área de escaneamento
5. O resultado será exibido automaticamente quando detectado

### Upload de Imagem

1. Clique na aba **"Upload"** (padrão)
2. Arraste e solte uma imagem com QR Code na área demarcada, ou clique para selecionar um arquivo
3. O sistema irá processar a imagem e exibir o resultado

### Criação de QR Code

- Acesse [https://jonathan-laco.github.io/qrcode/](https://jonathan-laco.github.io/qrcode/) para gerar QR Codes personalizados de forma gratuita e rápida.

### Histórico de Escaneamentos

- Todos os QR Codes escaneados são armazenados automaticamente no histórico
- Clique em um item do histórico para visualizar novamente seus detalhes
- Use o botão **"Limpar"** para remover todo o histórico

## Instalação e Execução Local

```bash
git clone https://github.com/jonathan-laco/ScanQRCODE.git
cd ScanQRCODE
npm install
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) para visualizar a aplicação.

## Licença

Este projeto é licenciado sob a licença MIT.

---

Desenvolvido por **Jonathan Laco**
