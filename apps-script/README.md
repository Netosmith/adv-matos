# Backend Google Apps Script

Este diretório contém a documentação do backend do Portal Matos Advocacia usando Google Sheets + Google Drive.

## Recursos Google

- Planilha: `Matos Advocacia - Banco de Dados`
- Abas: `USUARIOS`, `CLIENTES`, `PROCESSOS`, `CONTRATOS`, `DOCUMENTOS`, `CONFIGURACOES`, `ATIVIDADES`, `SESSOES`
- Documentos serão armazenados no Google Drive.
- O Web App do Apps Script será a única API consumida pelo GitHub Pages.

## Segurança

- Nenhuma senha ou segredo será gravado no repositório.
- A autenticação será validada no Apps Script.
- Sessões terão expiração e os tokens persistidos na planilha serão armazenados somente em formato derivado.
- Segredos do backend ficarão em Script Properties do Google Apps Script.

## Publicação

O projeto será criado a partir da própria planilha em `Extensões > Apps Script` e publicado em `Implantar > Nova implantação > Aplicativo da Web`.
