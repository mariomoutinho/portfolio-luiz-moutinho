"use strict";

document.documentElement.classList.add("js-enabled");

document.addEventListener("DOMContentLoaded", () => {
  setupStatusBar();
  setupTheme();
  setupMobileMenu();
  setupScrollProgress();
  setupRevealAnimations();
  setupProjectMarquee();
  const projectCarousel = setupProjectCarousel();
  setupProjectFilters(projectCarousel);
  setupCaseScrollSpy();
  setupCopyButtons();
  setupBackToTop();
  setupContactForm();

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
});

/* Barra compacta compartilhada. O botão de tema continua no cabeçalho sem JS. */
function setupStatusBar() {
  const header = document.querySelector(".site-header");
  if (!header || document.querySelector(".status-bar")) return;

  const pageName = document.title.replace(/\s*[|—]\s*Luiz Moutinho.*$/i, "").trim() || "Portfólio";
  const statusBar = document.createElement("div");
  statusBar.className = "status-bar";
  statusBar.innerHTML = `
    <div class="shell status-inner">
      <div class="status-segment status-primary"><span class="status-dot" aria-hidden="true"></span><span>Portfólio em desenvolvimento</span></div>
      <div class="status-actions"><span class="status-location">Recife, PE</span><span aria-hidden="true">/</span><span class="status-page">${pageName}</span></div>
    </div>`;

  header.before(statusBar);
  const themeButton = document.querySelector(".theme-toggle");
  statusBar.querySelector(".status-actions")?.append(themeButton);
}

/* Tema persistente, alinhado ao sistema quando ainda não existe preferência. */
function setupTheme() {
  const button = document.querySelector(".theme-toggle");
  if (!button || button.dataset.themeReady === "true") return;
  button.dataset.themeReady = "true";

  const updateButton = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    const action = isDark ? "Ativar tema claro" : "Ativar tema escuro";
    button.setAttribute("aria-label", action);
    button.setAttribute("title", action);
    const label = button.querySelector(".theme-label");
    if (label) label.textContent = isDark ? "Claro" : "Escuro";
  };

  updateButton();
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      /* A troca ainda funciona quando o armazenamento está indisponível. */
    }
    updateButton();
  });
}

/* Menu móvel com fechamento por link, Escape e mudança para desktop. */
function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-nav");
  if (!button || !menu || button.dataset.menuReady === "true") return;
  button.dataset.menuReady = "true";

  const label = button.querySelector(".sr-only");
  const closeMenu = (returnFocus = false) => {
    button.setAttribute("aria-expanded", "false");
    if (label) label.textContent = "Abrir menu";
    menu.classList.remove("is-open");
    if (returnFocus) button.focus();
  };

  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willOpen));
    if (label) label.textContent = willOpen ? "Fechar menu" : "Abrir menu";
    menu.classList.toggle("is-open", willOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") closeMenu(true);
  });

  const desktopQuery = matchMedia("(min-width: 60rem)");
  desktopQuery.addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

/* Linha complementar de progresso, atualizada em um único frame por rolagem. */
function setupScrollProgress() {
  if (document.querySelector(".scroll-progress")) return;
  const progress = document.createElement("div");
  progress.className = "scroll-progress";
  progress.setAttribute("aria-hidden", "true");
  document.body.prepend(progress);

  let frameRequested = false;
  const update = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const value = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    progress.style.transform = `scaleX(${value})`;
    frameRequested = false;
  };
  const requestUpdate = () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(update);
  };

  update();
  addEventListener("scroll", requestUpdate, { passive: true });
  addEventListener("resize", requestUpdate);
}

/* Revela conteúdo uma vez; sem JS, nada recebe a classe que oculta o alvo. */
function setupRevealAnimations() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;

  const targets = new Set(document.querySelectorAll([
    "main > section",
    ".value-card",
    ".timeline-item",
    ".course-card",
    "[data-project]",
    ".case-preview",
    ".case-section"
  ].join(",")));

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: .08 });

  targets.forEach((target) => {
    target.classList.add("reveal-target");
    observer.observe(target);
  });
}

/* A cópia visual torna a faixa contínua; seus links não entram na ordem de foco. */
function setupProjectMarquee() {
  const marquee = document.querySelector("[data-project-marquee]");
  const track = marquee?.querySelector("[data-project-marquee-track]");
  const originalGroup = track?.querySelector("[data-project-marquee-group]:not([data-marquee-clone])");
  if (!marquee || !track || !originalGroup || marquee.dataset.marqueeReady === "true") return;
  marquee.dataset.marqueeReady = "true";

  const clonedGroup = originalGroup.cloneNode(true);
  clonedGroup.setAttribute("data-marquee-clone", "");
  clonedGroup.setAttribute("aria-hidden", "true");
  clonedGroup.querySelectorAll("a").forEach((link) => link.setAttribute("tabindex", "-1"));
  track.append(clonedGroup);
  marquee.classList.add("is-ready");
}

/* Carrossel próprio, com fallback linear, toque, teclado e reprodução controlável. */
function setupProjectCarousel() {
  const carousel = document.querySelector("[data-project-carousel]");
  const section = carousel?.closest(".featured-section");
  const inner = carousel?.querySelector(".carousel-inner");
  const originalSlides = inner ? Array.from(inner.querySelectorAll(".carousel-slide")) : [];
  const indicators = carousel?.querySelector(".carousel-indicators");
  const announcement = carousel?.querySelector("[data-carousel-announcement]");
  const previousButton = section?.querySelector("[data-carousel-prev]");
  const nextButton = section?.querySelector("[data-carousel-next]");
  const toggleButton = section?.querySelector("[data-carousel-toggle]");
  const toggleIcon = toggleButton?.querySelector("[data-carousel-toggle-icon]");
  const toggleLabel = toggleButton?.querySelector("[data-carousel-toggle-label]");
  if (!carousel || !section || !inner || !indicators || !previousButton || !nextButton || !toggleButton || !originalSlides.length) return null;
  if (carousel.dataset.carouselReady === "true") return null;
  carousel.dataset.carouselReady = "true";

  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let visibleSlides = originalSlides.slice();
  let currentIndex = 0;
  let userPaused = reducedMotion.matches;
  let interactionPaused = false;
  let autoplayTimer = 0;
  let pointerStartX = null;

  originalSlides.forEach((slide, index) => {
    slide.setAttribute("role", "group");
    slide.setAttribute("aria-roledescription", "slide");
    slide.dataset.originalIndex = String(index);
  });

  const projectName = (slide) => slide?.querySelector("h3")?.textContent.trim() || "Projeto";
  const clearAutoplay = () => {
    clearTimeout(autoplayTimer);
    autoplayTimer = 0;
  };
  const scheduleAutoplay = () => {
    clearAutoplay();
    if (userPaused || interactionPaused || visibleSlides.length < 2) return;
    autoplayTimer = window.setTimeout(() => show(currentIndex + 1, false), 6000);
  };
  const updateToggle = () => {
    const action = userPaused ? "Retomar carrossel" : "Pausar carrossel";
    toggleButton.setAttribute("aria-label", action);
    toggleButton.setAttribute("title", action);
    toggleButton.disabled = visibleSlides.length < 2;
    if (toggleIcon) toggleIcon.textContent = userPaused ? "▶" : "Ⅱ";
    if (toggleLabel) toggleLabel.textContent = userPaused ? "Retomar" : "Pausar";
  };
  const updateControls = () => {
    const useful = visibleSlides.length > 1;
    previousButton.disabled = !useful;
    nextButton.disabled = !useful;
    indicators.hidden = !useful;
    updateToggle();
  };
  const rebuildIndicators = () => {
    const buttons = visibleSlides.map((slide, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.carouselSlideTo = String(index);
      button.setAttribute("aria-label", `Ir para ${projectName(slide)}`);
      button.addEventListener("click", () => show(index, true));
      return button;
    });
    indicators.replaceChildren(...buttons);
  };
  const show = (requestedIndex, announce = false) => {
    if (!visibleSlides.length) return;
    currentIndex = (requestedIndex + visibleSlides.length) % visibleSlides.length;
    const activeSlide = visibleSlides[currentIndex];

    originalSlides.forEach((slide) => {
      const isActive = slide === activeSlide;
      slide.hidden = !isActive;
      slide.setAttribute("aria-hidden", String(!isActive));
      slide.classList.remove("is-entering");
    });
    activeSlide.hidden = false;
    activeSlide.setAttribute("aria-label", `${currentIndex + 1} de ${visibleSlides.length}: ${projectName(activeSlide)}`);
    requestAnimationFrame(() => activeSlide.classList.add("is-entering"));

    indicators.querySelectorAll("button").forEach((button, index) => {
      if (index === currentIndex) button.setAttribute("aria-current", "true");
      else button.removeAttribute("aria-current");
    });
    if (announce && announcement) announcement.textContent = `Projeto atual: ${projectName(activeSlide)}.`;
    scheduleAutoplay();
  };
  const setInteractionPaused = (paused) => {
    interactionPaused = paused;
    if (paused) clearAutoplay();
    else scheduleAutoplay();
  };
  const setFilter = (filter) => {
    visibleSlides = originalSlides.filter((slide) => {
      const categories = slide.dataset.category?.split(/\s+/).filter(Boolean) || [];
      return filter === "all" || categories.includes(filter);
    });
    currentIndex = 0;
    rebuildIndicators();
    updateControls();
    show(0, false);
  };

  previousButton.addEventListener("click", () => show(currentIndex - 1, true));
  nextButton.addEventListener("click", () => show(currentIndex + 1, true));
  toggleButton.addEventListener("click", () => {
    if (visibleSlides.length < 2) return;
    userPaused = !userPaused;
    updateToggle();
    if (announcement) announcement.textContent = userPaused ? "Carrossel pausado." : "Carrossel retomado.";
    scheduleAutoplay();
  });
  carousel.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      show(currentIndex - 1, true);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      show(currentIndex + 1, true);
    } else if (event.key === "Home") {
      event.preventDefault();
      show(0, true);
    } else if (event.key === "End") {
      event.preventDefault();
      show(visibleSlides.length - 1, true);
    }
  });
  carousel.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "touch" || event.pointerType === "pen") pointerStartX = event.clientX;
  });
  carousel.addEventListener("pointerup", (event) => {
    if (pointerStartX === null) return;
    const distance = event.clientX - pointerStartX;
    pointerStartX = null;
    if (Math.abs(distance) < 50) return;
    show(currentIndex + (distance < 0 ? 1 : -1), true);
  });
  carousel.addEventListener("pointercancel", () => { pointerStartX = null; });
  section.addEventListener("mouseenter", () => setInteractionPaused(true));
  section.addEventListener("mouseleave", () => setInteractionPaused(false));
  section.addEventListener("focusin", () => setInteractionPaused(true));
  section.addEventListener("focusout", (event) => {
    if (!section.contains(event.relatedTarget)) setInteractionPaused(false);
  });

  carousel.classList.add("is-enhanced");
  section.classList.add("carousel-is-ready");
  setFilter("all");

  return {
    filter: setFilter,
    contains: (projectId) => originalSlides.some((slide) => slide.id === projectId),
    showProject: (projectId, announce = true) => {
      const index = visibleSlides.findIndex((slide) => slide.id === projectId);
      if (index >= 0) show(index, announce);
    }
  };
}

/* Filtros mantêm a ordem original e coordenam cards comuns com o carrossel. */
function setupProjectFilters(carouselController) {
  const projects = Array.from(document.querySelectorAll("[data-project]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
  const controls = document.querySelector(".project-controls");
  if (!projects.length || !filterButtons.length || controls?.dataset.filtersReady === "true") return;
  if (controls) controls.dataset.filtersReady = "true";

  const status = document.querySelector("#filter-status");
  const sections = Array.from(document.querySelectorAll("[data-project-section]"));
  const matchesFilter = (project, filter) => {
    const categories = project.dataset.category?.split(/\s+/).filter(Boolean) || [];
    return filter === "all" || categories.includes(filter);
  };
  const setCardVisibility = (project, visible) => {
    if (project.classList.contains("carousel-slide")) return;
    project.dataset.filterVisible = String(visible);
    project.getAnimations?.().forEach((animation) => animation.cancel());
    if (visible) {
      project.hidden = false;
      project.animate?.([
        { opacity: 0, transform: "translateY(.5rem)" },
        { opacity: 1, transform: "translateY(0)" }
      ], { duration: 190, easing: "ease-out" });
      return;
    }
    const animation = project.animate?.([
      { opacity: 1, transform: "translateY(0)" },
      { opacity: 0, transform: "translateY(.35rem)" }
    ], { duration: 150, easing: "ease-in" });
    if (!animation) {
      project.hidden = true;
      return;
    }
    animation.onfinish = () => {
      if (project.dataset.filterVisible === "false") project.hidden = true;
    };
  };
  const applyFilter = (filter) => {
    let resultCount = 0;
    projects.forEach((project) => {
      const matches = matchesFilter(project, filter);
      setCardVisibility(project, matches);
      if (matches) resultCount += 1;
    });
    carouselController?.filter(filter);
    sections.forEach((section) => {
      const sectionProjects = projects.filter((project) => section.contains(project));
      section.hidden = sectionProjects.every((project) => !matchesFilter(project, filter));
    });
    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectFilter === filter));
    });
    if (status) status.textContent = resultCount === 1 ? "1 projeto encontrado." : `${resultCount} projetos encontrados.`;
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.projectFilter || "all"));
  });

  document.querySelectorAll("[data-project-nav]").forEach((link) => {
    link.addEventListener("click", (event) => {
      applyFilter("all");
      const projectId = link.hash.slice(1);
      if (!carouselController?.contains(projectId)) return;
      event.preventDefault();
      carouselController.showProject(projectId);
      document.querySelector("[data-project-carousel]")?.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
      history.pushState(null, "", link.hash);
    });
  });

  applyFilter("all");
  const selectProjectFromHash = (shouldScroll = false) => {
    const projectId = location.hash.slice(1);
    const project = projectId ? document.getElementById(projectId) : null;
    if (!project?.matches("[data-project]")) return;
    applyFilter("all");
    if (carouselController?.contains(projectId)) {
      carouselController.showProject(projectId, false);
      if (shouldScroll) document.querySelector("[data-project-carousel]")?.scrollIntoView({ block: "start" });
    } else if (shouldScroll) {
      project.scrollIntoView({ block: "start" });
    }
  };
  addEventListener("hashchange", () => selectProjectFromHash(true));
  selectProjectFromHash(false);
}

/* Destaca a seção visível nos índices laterais dos estudos de caso. */
function setupCaseScrollSpy() {
  const navigation = document.querySelector(".case-nav");
  const links = Array.from(navigation?.querySelectorAll('a[href^="#"]') || []);
  const sections = links.map((link) => document.querySelector(link.hash)).filter(Boolean);
  if (!navigation || !links.length || !sections.length || !("IntersectionObserver" in window)) return;

  const setCurrent = (sectionId) => {
    links.forEach((link) => {
      if (link.hash === `#${sectionId}`) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  };
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio);
    if (visible[0]) setCurrent(visible[0].target.id);
  }, { rootMargin: "-20% 0px -58%", threshold: [0, .2, .5] });

  sections.forEach((section) => observer.observe(section));
  setCurrent(location.hash.slice(1) || sections[0].id);
}

/* Cópia com Clipboard API e fallback para navegadores sem permissão. */
function setupCopyButtons() {
  const buttons = Array.from(document.querySelectorAll("[data-copy-value]"));
  const status = document.querySelector("#copy-status");
  if (!buttons.length || !status) return;

  const fallbackCopy = (value) => {
    const field = document.createElement("textarea");
    field.value = value;
    field.setAttribute("readonly", "");
    field.style.position = "fixed";
    field.style.opacity = "0";
    document.body.append(field);
    field.select();
    const copied = document.execCommand("copy");
    field.remove();
    return copied;
  };

  buttons.forEach((button) => {
    button.addEventListener("click", async () => {
      const value = button.dataset.copyValue || "";
      const label = button.dataset.copyLabel || "Conteúdo";
      try {
        if (navigator.clipboard?.writeText && window.isSecureContext) await navigator.clipboard.writeText(value);
        else if (!fallbackCopy(value)) throw new Error("copy-failed");
        status.textContent = `${label} copiado.`;
        button.textContent = "Copiado";
        window.setTimeout(() => { button.textContent = "Copiar"; }, 1800);
      } catch {
        status.textContent = `Não foi possível copiar ${label.toLowerCase()}. Selecione o conteúdo e copie manualmente.`;
      }
    });
  });
}

/* Botão global de retorno ao topo, exibido apenas após rolagem suficiente. */
function setupBackToTop() {
  if (document.querySelector(".back-to-top")) return;
  const button = document.createElement("button");
  button.className = "back-to-top";
  button.type = "button";
  button.setAttribute("aria-label", "Voltar ao topo");
  button.innerHTML = '<span aria-hidden="true">↑</span>';
  document.body.append(button);

  let frameRequested = false;
  const update = () => {
    button.classList.toggle("is-visible", window.scrollY > 560);
    frameRequested = false;
  };
  addEventListener("scroll", () => {
    if (frameRequested) return;
    frameRequested = true;
    requestAnimationFrame(update);
  }, { passive: true });
  button.addEventListener("click", () => {
    scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  });
  update();
}

/* Validação e preparação honesta do mailto, sem simular envio por servidor. */
function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form || form.dataset.formReady === "true") return;
  form.dataset.formReady = "true";
  form.noValidate = true;

  const fields = {
    nome: form.querySelector("#nome"),
    email: form.querySelector("#email"),
    mensagem: form.querySelector("#mensagem")
  };
  const status = form.querySelector("#form-status");
  const counter = form.querySelector("#contador-mensagem");
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const messages = {
    nome: "Informe seu nome.",
    email: "Informe seu e-mail.",
    mensagem: "Escreva uma mensagem."
  };

  const setError = (fieldName, message = "") => {
    const field = fields[fieldName];
    const error = form.querySelector(`#erro-${fieldName}`);
    if (!field || !error) return;
    error.textContent = message;
    field.setAttribute("aria-invalid", String(Boolean(message)));
  };
  const validateField = (fieldName) => {
    const field = fields[fieldName];
    if (!field) return true;
    field.value = field.value.trim().replace(/[ \t]+/g, " ");
    if (!field.value) {
      setError(fieldName, messages[fieldName]);
      return false;
    }
    if (fieldName === "email" && !emailPattern.test(field.value)) {
      setError(fieldName, "Informe um e-mail válido, como nome@dominio.com.");
      return false;
    }
    setError(fieldName);
    return true;
  };

  Object.entries(fields).forEach(([fieldName, field]) => {
    if (!field) return;
    field.addEventListener("blur", () => validateField(fieldName));
    field.addEventListener("input", () => {
      if (field.getAttribute("aria-invalid") === "true") validateField(fieldName);
      if (fieldName === "mensagem" && counter) {
        counter.textContent = `${field.value.length} ${field.value.length === 1 ? "caractere" : "caracteres"}`;
      }
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (status) {
      status.textContent = "";
      status.classList.remove("is-visible");
    }
    const validity = Object.keys(fields).map((fieldName) => validateField(fieldName));
    if (validity.includes(false)) {
      form.querySelector('[aria-invalid="true"]')?.focus();
      return;
    }

    const messageExcerpt = fields.mensagem.value.slice(0, 60).replace(/\s+/g, " ");
    const subject = `Contato pelo portfólio — ${fields.nome.value}: ${messageExcerpt}`;
    const body = [
      "Olá, Luiz,",
      "",
      fields.mensagem.value,
      "",
      `Nome: ${fields.nome.value}`,
      `E-mail para resposta: ${fields.email.value}`
    ].join("\n");

    if (status) {
      status.textContent = "Seu aplicativo de e-mail foi aberto. Revise a mensagem e confirme o envio por lá.";
      status.classList.add("is-visible");
      status.focus();
    }
    location.href = `mailto:luizmariomoutinho1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
