# Portfólio — Luiz Mário Barros Moutinho

Currículo online responsivo desenvolvido para a atividade de Fundamentos da Programação Web da UNINTER. O conteúdo apresenta a trajetória de Luiz Mário Barros Moutinho entre saúde, movimento humano e desenvolvimento de software, além de formação e projetos reais.

## Tecnologias

- HTML5 semântico
- CSS3 puro, com layout mobile-first e temas claro/escuro
- JavaScript próprio para menu, tema, filtros e validação do formulário
- Bootstrap 5.3.8 por CDN, usado somente no carrossel da vitrine de projetos

O site continua estático, sem dependências npm ou etapa de build. O CSS e o JavaScript do Bootstrap são carregados por CDN apenas em `portfolio.html`; o restante do layout não foi reconstruído com o framework.

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
- Menu móvel operável por botão e tecla Escape
- Tema inicial alinhado ao sistema, com preferência persistida
- Vitrine filtrável com Carousel do Bootstrap, reprodução automática, pausa manual e grade responsiva
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
