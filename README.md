# Checklist de Inspeção

PWA de checklist de inspeções que funciona offline no dispositivo do usuário. Não há backend,
API ou sincronização remota.

## Desenvolvimento

```bash
npm install
npm run build
npm run lint
npm run format:check
```

Para testar o PWA, sirva a raiz por HTTP. A abertura por `file://` não ativa módulos e service
workers corretamente.

## Dados offline

As inspeções e fotos são armazenadas no IndexedDB do navegador. Na primeira execução após a
atualização, dados existentes no formato antigo do `localStorage` são migrados automaticamente.
Os dados permanecem apenas no dispositivo e não existe backup remoto; limpar os dados do navegador
remove as inspeções.

## Publicação

O arquivo `app.js` é gerado a partir de `app.ts` pelo comando `npm run build`. O jsPDF usado em
runtime fica em `vendor/` para que a exportação também funcione sem rede. Ao publicar alterações
do shell da aplicação, incremente `CACHE_NAME` em `sw.js`.
