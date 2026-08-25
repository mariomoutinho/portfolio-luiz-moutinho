# Portfólio — Luiz Mário Barros Moutinho

Currículo online responsivo desenvolvido para a atividade de Fundamentos da Programação Web da UNINTER. O conteúdo apresenta a trajetória de Luiz Mário Barros Moutinho entre saúde, movimento humano e desenvolvimento de software, além de formação e projetos reais.

## Tecnologias

- HTML5 semântico
- CSS3 puro, com layout mobile-first e temas claro/escuro
- JavaScript próprio para menu, tema, filtros, carrossel e validação do formulário

O site continua estático, sem dependências npm, frameworks ou etapa de build. Toda a interface e todas as interações são implementadas com HTML, CSS e JavaScript puro.

## Estrutura

```text
.
├── index.html
├── formacao.html
├── portfolio.html
├── contato.html
├── cases/
│   ├── orderflow.html
│   ├── suinda.html
│   └── 7-invernos.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── img/
│       ├── covers/
│       ├── decorative/
│       └── icons/
├── README.md
└── .gitignore
```

## Execução local

Na raiz do projeto, inicie qualquer servidor HTTP estático. Com Python:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000`. O site também permanece legível ao abrir os arquivos HTML diretamente, mas um servidor representa melhor o ambiente do GitHub Pages.

## Recursos

- Páginas independentes com navegação consistente e três estudos de caso
- Página atual indicada visualmente e por `aria-current`
- Barra de status, indicador de página e progresso de leitura
- Menu móvel operável por botão, links e tecla Escape
- Tema inicial alinhado ao sistema, com preferência persistida
- Vitrine filtrável com carrossel próprio e faixa contínua de atalhos para os projetos
- Navegação do carrossel por controles, teclado e gesto horizontal
- Revelação progressiva, botão de retorno ao topo e índice ativo nos estudos de caso
- Cópia acessível de e-mail e telefone com feedback textual
- Formulário que valida os campos e prepara um `mailto:`, sem simular envio
- Contraste, foco visível e suporte a `prefers-reduced-motion`
- Caminhos relativos compatíveis com páginas de projeto no GitHub Pages

O formulário não envia dados nem faz requisições de rede. Depois da validação, ele abre o aplicativo de e-mail com assunto e corpo preenchidos para que a pessoa revise e confirme o envio.

## Publicação no GitHub Pages

1. Envie os arquivos para a branch `main` do repositório.
2. Acesse **Settings > Pages** no GitHub.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main`, diretório `/ (root)`, e salve.
5. Aguarde a publicação em `https://mariomoutinho.github.io/portfolio-luiz-moutinho/`.

## Fontes do conteúdo

Formação, certificações e contatos foram confirmados pelo currículo e perfil profissional fornecidos pelo titular. Os projetos e tecnologias foram verificados nos repositórios presentes no workspace. Não foram incluídas métricas, idiomas, datas, experiências ou projetos sem evidência.
