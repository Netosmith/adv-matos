# Matos Advocacia API

Backend independente para o frontend publicado em `https://netosmith.github.io/adv-matos/`.

## Recursos

- Cloudflare Worker para as rotas `/api/*`.
- D1 para clientes, processos, contratos, configurações, usuários e sessões.
- R2 para documentos PDF/DOCX/JPG/PNG.
- CORS restrito a `https://netosmith.github.io`.
- Autenticação por token Bearer; o token armazenado no banco é somente o hash SHA-256.
- Senha com PBKDF2-SHA256 e 150.000 iterações.

## Publicação

1. Crie um banco D1 chamado `adv-matos-db`.
2. Crie um bucket R2 chamado `adv-matos-files`.
3. Copie `wrangler.example.toml` para `wrangler.toml` e informe o `database_id` do D1.
4. Aplique `migrations/0001_init.sql` no D1.
5. Publique o Worker.
6. Coloque a URL final do Worker em `public/matos-config.js`.

O usuário inicial é `admin` e utiliza a senha provisória definida na migração. O portal obriga a troca dessa senha no primeiro acesso.
