# Decisoes de UX

## Estrutura

- A primeira tela apresenta identidade, especialidades e chamadas para projetos e contato.
- Os projetos sao o nucleo da narrativa. Estudos de caso abrem em `dialog`, mantendo contexto e compatibilidade com GitHub Pages.
- Competencias nao usam porcentagens; grupos diferenciam pratica, foco e estudos.
- Certificacoes foram agrupadas em acordeoes nativos para reduzir uma lista extensa.

## Visual

- Roxo profundo aparece como fundo, com laranja para acao e sinalizacao. Azul e verde entram nos previews para evitar uma paleta monocromatica.
- A tipografia combina Manrope para leitura e DM Mono em metadados tecnicos.
- Imagens existentes foram usadas em PerovSun, Pindorama RPG e O Balaio. Os demais previews dizem explicitamente “preview ilustrativo”.

## Acessibilidade

- HTML semantico, link para pular conteudo, foco visivel e hierarquia de titulos.
- Menu movel com `aria-expanded`, rotulo mutavel e alvo minimo de 44 px.
- Dialogo nativo, botoes nomeados, links externos descritivos e imagens com texto alternativo.
- Informacao de status usa texto, nao apenas cor.
- `prefers-reduced-motion` desativa transicoes; a pagina permanece navegavel sem animacoes.
- Contraste foi escolhido para atender leitura em fundo escuro; recomenda-se auditoria automatizada no ambiente publicado.

## Responsividade e performance

- Grades passam de duas/quatro colunas para uma coluna sem largura fixa.
- Imagens de projeto usam carregamento tardio e dimensoes estaveis.
- Nao ha roteador ou backend. O JavaScript e limitado aos controles necessarios.
