# Portfólio — Luiz Mário Barros Moutinho

Currículo online responsivo desenvolvido para a atividade de Fundamentos da Programação Web da UNINTER. O conteúdo apresenta a trajetória de Luiz Mário Barros Moutinho entre saúde, movimento humano e desenvolvimento de software, além de formação e projetos reais.

## Tecnologias

- HTML5 semântico
- CSS3 puro, com layout mobile-first e temas claro/escuro
- JavaScript puro para menu, tema e validação do formulário

Não há frameworks, bibliotecas, recursos por CDN, dependências npm ou etapa de build.

## Estrutura

```text
.
├── index.html
├── formacao.html
├── portfolio.html
├── contato.html
├── assets/
│   ├── css/
│   │   └── styles.css
│   ├── js/
│   │   └── main.js
│   └── img/
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

- Quatro páginas independentes com navegação consistente
- Página atual indicada visualmente e por `aria-current`
- Menu móvel operável por botão e tecla Escape
- Tema inicial alinhado ao sistema, com preferência persistida
- Formulário demonstrativo com erros em texto, foco no primeiro campo inválido e confirmação acessível
- Contraste, foco visível e suporte a `prefers-reduced-motion`
- Caminhos relativos compatíveis com páginas de projeto no GitHub Pages

O formulário não envia dados nem faz requisições de rede.

## Publicação no GitHub Pages

1. Envie os arquivos para a branch `main` do repositório.
2. Acesse **Settings > Pages** no GitHub.
3. Em **Build and deployment**, escolha **Deploy from a branch**.
4. Selecione a branch `main`, diretório `/ (root)`, e salve.
5. Aguarde a publicação em `https://mariomoutinho.github.io/portfolio-luiz-moutinho/`.

## Fontes do conteúdo

Formação, certificações e contatos foram confirmados pelo currículo e perfil profissional fornecidos pelo titular. Os projetos e tecnologias foram verificados nos repositórios presentes no workspace. Não foram incluídas métricas, idiomas, datas, experiências ou projetos sem evidência.
