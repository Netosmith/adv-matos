# Matos Advocacia — Portal administrativo

Portal administrativo com identidade visual escura e dourada para gestão interna da Matos Advocacia.

## Funcionalidades

- Dashboard com contagens reais e histórico de atividades.
- Clientes PF/PJ: cadastro, edição, consulta, filtros, exportação CSV e impressão.
- Processos: vínculo ao cliente, área, vara, parte contrária, fase, status e prazo informado manualmente.
- Documentos: anexos PDF/DOCX/JPG/PNG de até 50 MB, vínculos, busca, download, visualização compatível com o navegador e exclusão confirmada.
- Contratos: cadastro, vínculo ao cliente/processo, editor, formatação básica, estruturas preenchíveis, vigência, status manual e impressão/salvar PDF pelo navegador.
- Configurações do escritório usadas nas estruturas de documentos.

## Acesso e autenticação

O portal usa autenticação própria por usuário e senha. A sessão é armazenada em cookie HttpOnly/SameSite e validada no servidor. Senhas são derivadas com PBKDF2-SHA-256 e salt individual; a senha provisória do administrador precisa ser alterada no primeiro acesso.

Há proteção contra tentativas repetidas de login e sessões persistidas no D1. O usuário administrativo inicial é `admin`; a senha provisória não fica em texto no repositório.

A autenticação do ChatGPT/Sites não é mais necessária para entrar no portal.

## Dados

Dados estruturados ficam no D1 e arquivos no R2. O workspace nativo reutiliza o proprietário de dados encontrado na instalação anterior, preservando os registros existentes e os caminhos dos arquivos R2 quando houver conteúdo criado antes da troca de autenticação.

Todas as APIs verificam a sessão no servidor, operações de escrita conferem origem e atualizações de registros verificam a versão para evitar sobrescritas concorrentes.

Não há integração com tribunais, cálculo automático de prazos, assinatura eletrônica ou e-mail. Datas, movimentações e status de assinatura são informados manualmente.

## Desenvolvimento

Node >=22.13 e pnpm conforme `packageManager`. Instalar com `pnpm install --frozen-lockfile`. Comandos: `pnpm dev`, `pnpm build`, `pnpm db:generate`.

Schema: `db/schema.ts`. Migrações: `drizzle/`. API: `app/api/`. Interface: `app/portal.tsx`, `app/login-form.tsx`, `app/globals.css` e `app/login.css`. Bindings lógicos: DB e BUCKET, configurados em `.openai/hosting.json`.

## Repositório e portal

Código-fonte: https://github.com/Netosmith/adv-matos

Portal publicado: https://adv-matos.netosmith.chatgpt.site

O GitHub Pages não executa as APIs, autenticação, banco D1 ou armazenamento R2 desta aplicação.
