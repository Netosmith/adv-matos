# Matos Advocacia — Portal administrativo

Portal baseado nas sete telas fornecidas, com identidade visual escura e dourada, logo e fotografia do anexo.

## Funcionalidades

- Dashboard com contagens reais e histórico de atividades.
- Clientes PF/PJ: cadastro, edição, consulta, filtros, exportação CSV e impressão.
- Processos: vínculo ao cliente, área, vara, parte contrária, fase, status e prazo informado manualmente.
- Documentos: anexos PDF/DOCX/JPG/PNG de até 50 MB, vínculos, busca, download, visualização compatível com o navegador e exclusão confirmada.
- Contratos: cadastro, vínculo ao cliente/processo, editor, formatação básica, estruturas preenchíveis, vigência, status manual e impressão/salvar PDF pelo navegador.
- Configurações do escritório usadas nas estruturas de documentos.

## Acesso e dados

Esta versão usa a autenticação do ChatGPT/Sites. A publicação inicial é privada ao proprietário. A interface por e-mail/senha da referência não está implementada. Para uso por uma equipe externa é necessário definir e implementar a autenticação e a autorização desse ambiente; não publicar o Worker fora do dispatcher Sites confiando em cabeçalhos enviados diretamente pelo cliente.

Os registros e arquivos são isolados pelo identificador autenticado do usuário. Não existe carteira compartilhada entre usuários nesta versão. Dados estruturados ficam no D1, arquivos no R2. Todas as APIs verificam identidade no servidor, operações de escrita conferem origem e atualizações de registros verificam a versão para evitar sobrescritas concorrentes.

Não há integração com tribunais, cálculo automático de prazos, assinatura eletrônica ou e-mail. Datas, movimentações e status de assinatura são informados manualmente. As estruturas de contratos contêm campos para preenchimento e revisão, sem inventar dados de OAB, sede ou condições legais do escritório.

## Desenvolvimento

Node >=22.13 e pnpm conforme `packageManager`. Instalar com `pnpm install --frozen-lockfile`. Comandos: `pnpm dev`, `pnpm build`, `pnpm db:generate`.

Schema: `db/schema.ts`. Migrações: `drizzle/`. API: `app/api/`. Interface: `app/portal.tsx` e `app/globals.css`. Bindings lógicos: DB e BUCKET, configurados em `.openai/hosting.json`. A publicação Sites provisiona os recursos e aplica as migrações.

Não há senhas padrão ou chaves de acesso no código. A conta inicial vem da autenticação da plataforma. O site inicia sem clientes, processos e contratos fictícios.

## Repositório

Código-fonte: https://github.com/Netosmith/adv-matos

Portal publicado: https://adv-matos.netosmith.chatgpt.site

O GitHub Pages não executa as APIs, a autenticação e o banco desta aplicação. O ambiente publicado continua no Sites.

## Verificação desta entrega

Compilação TypeScript e build de produção aprovados. Testes de integração com o Worker compilado e D1/R2 locais passaram: sessão ausente, CRUD e persistência, concorrência, isolamento por conta, validação de vínculos, histórico de atividades, origem de escrita, upload/download/exclusão e renderização do painel. A validação de WebMCP em navegador não foi executada: esta sessão não dispõe de um contexto permitido de teste WebMCP. O registro é opcional e não altera o funcionamento da interface.
