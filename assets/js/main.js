"use strict";

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-enabled");
  setupTheme();
  setupMobileMenu();
  setupProjectShowcase();
  setupContactForm();

  document.querySelectorAll("[data-current-year]").forEach((element) => {
    element.textContent = String(new Date().getFullYear());
  });
});

/* Tema compartilhado: persiste a escolha e mantém o rótulo acessível atualizado. */
function setupTheme() {
  const button = document.querySelector(".theme-toggle");
  if (!button) return;

  const updateButton = () => {
    const isDark = document.documentElement.dataset.theme === "dark";
    button.setAttribute("aria-label", isDark ? "Ativar tema claro" : "Ativar tema escuro");
    button.setAttribute("title", isDark ? "Ativar tema claro" : "Ativar tema escuro");
  };

  updateButton();
  button.addEventListener("click", () => {
    const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem("theme", nextTheme);
    } catch {
      /* O tema ainda funciona quando o navegador bloqueia armazenamento local. */
    }
    updateButton();
  });
}

/* Menu móvel com estado exposto às tecnologias assistivas. */
function setupMobileMenu() {
  const button = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".site-nav");
  if (!button || !menu) return;

  const closeMenu = (returnFocus = false) => {
    button.setAttribute("aria-expanded", "false");
    button.querySelector(".sr-only").textContent = "Abrir menu";
    menu.classList.remove("is-open");
    if (returnFocus) button.focus();
  };

  button.addEventListener("click", () => {
    const willOpen = button.getAttribute("aria-expanded") !== "true";
    button.setAttribute("aria-expanded", String(willOpen));
    button.querySelector(".sr-only").textContent = willOpen ? "Fechar menu" : "Abrir menu";
    menu.classList.toggle("is-open", willOpen);
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => closeMenu()));
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") closeMenu(true);
  });
  matchMedia("(min-width: 60rem)").addEventListener("change", (event) => {
    if (event.matches) closeMenu();
  });
}

/* Filtros da vitrine e integração do único carrossel com o Bootstrap. */
function setupProjectShowcase() {
  const projects = Array.from(document.querySelectorAll("[data-project]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
  if (!projects.length || !filterButtons.length) return;

  const sections = Array.from(document.querySelectorAll("[data-project-section]"));
  const sectionProjects = sections.map((section) => ({
    element: section,
    projects: projects.filter((project) => section.contains(project))
  }));
  const status = document.querySelector("#filter-status");
  const carouselElement = document.querySelector("[data-project-carousel]");
  const carouselController = carouselElement ? setupBootstrapProjectCarousel(carouselElement) : null;

  const matchesFilter = (project, filter) => {
    const categories = project.dataset.category?.split(/\s+/).filter(Boolean) || [];
    return filter === "all" || categories.includes(filter);
  };

  const applyFilter = (filter) => {
    let resultCount = 0;

    projects.forEach((project) => {
      const matches = matchesFilter(project, filter);
      if (!project.classList.contains("carousel-item")) project.hidden = !matches;
      if (matches) resultCount += 1;
    });

    carouselController?.filter(filter);

    sectionProjects.forEach(({ element, projects: projectsInSection }) => {
      element.hidden = projectsInSection.every((project) => !matchesFilter(project, filter));
    });

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectFilter === filter));
    });

    if (status) {
      status.textContent = resultCount === 1 ? "1 projeto encontrado." : `${resultCount} projetos encontrados.`;
    }
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
      carouselElement.scrollIntoView({
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
        block: "start"
      });
      history.pushState(null, "", link.hash);
    });
  });
}

function setupBootstrapProjectCarousel(carousel) {
  const inner = carousel.querySelector(".carousel-inner");
  const indicators = carousel.querySelector(".carousel-indicators");
  const section = carousel.closest(".featured-section");
  const toggle = section?.querySelector("[data-carousel-toggle]");
  const toggleIcon = toggle?.querySelector("[data-carousel-toggle-icon]");
  const toggleLabel = toggle?.querySelector("[data-carousel-toggle-label]");
  const slideControls = Array.from(section?.querySelectorAll("[data-bs-slide]") || []);
  const originalSlides = inner ? Array.from(inner.querySelectorAll(".carousel-item")) : [];
  if (!inner || !indicators || !section || !toggle || !originalSlides.length) return null;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let isPaused = reduceMotion.matches;
  let instance = null;
  let visibleSlides = originalSlides.slice();

  const matchesFilter = (slide, filter) => {
    const categories = slide.dataset.category?.split(/\s+/).filter(Boolean) || [];
    return filter === "all" || categories.includes(filter);
  };

  const updateToggle = () => {
    const action = isPaused ? "Retomar carrossel" : "Pausar carrossel";
    toggle.setAttribute("aria-label", action);
    toggle.setAttribute("title", action);
    toggleIcon.textContent = isPaused ? "▶" : "Ⅱ";
    toggleLabel.textContent = isPaused ? "Retomar" : "Pausar";
    toggle.disabled = visibleSlides.length < 2;
  };

  const updateSlideControls = () => {
    const controlsAreUseful = visibleSlides.length > 1;
    slideControls.forEach((control) => {
      control.disabled = !controlsAreUseful;
    });
    indicators.hidden = !controlsAreUseful;
  };

  const disposeInstance = () => {
    const currentInstance = window.bootstrap?.Carousel?.getInstance(carousel) || instance;
    if (currentInstance) {
      const transitioningSlide = carousel.querySelector(".carousel-item-next, .carousel-item-prev");
      const activeSlide = carousel.querySelector(".carousel-item.active");
      /* Impede que o callback de uma transição descartada altere o DOM já filtrado. */
      if (transitioningSlide && activeSlide) {
        activeSlide.dispatchEvent(new Event("transitionend", { bubbles: true }));
      }
      currentInstance.pause();
      currentInstance.dispose();
    }
    instance = null;
    carousel.classList.remove("is-bootstrap-ready");
    section.classList.remove("carousel-is-ready");
  };

  const rebuildIndicators = () => {
    const buttons = visibleSlides.map((slide, index) => {
      const button = document.createElement("button");
      const projectName = slide.querySelector("h3")?.textContent.trim() || `projeto ${index + 1}`;
      button.type = "button";
      button.dataset.bsTarget = `#${carousel.id}`;
      button.dataset.bsSlideTo = String(index);
      button.setAttribute("aria-label", `Ir para ${projectName}`);
      if (index === 0) {
        button.classList.add("active");
        button.setAttribute("aria-current", "true");
      }
      return button;
    });
    indicators.replaceChildren(...buttons);
  };

  const syncPlaybackAfterHover = () => {
    queueMicrotask(() => {
      if (isPaused) instance?.pause();
      else if (visibleSlides.length > 1) instance?.cycle();
    });
  };

  const rebuild = (filter) => {
    disposeInstance();
    visibleSlides = originalSlides.filter((slide) => matchesFilter(slide, filter));

    originalSlides.forEach((slide) => {
      slide.hidden = false;
      slide.classList.remove("active", "carousel-item-next", "carousel-item-prev", "carousel-item-start", "carousel-item-end");
    });
    if (visibleSlides[0]) visibleSlides[0].classList.add("active");
    inner.replaceChildren(...visibleSlides);
    rebuildIndicators();
    updateSlideControls();
    updateToggle();

    if (!visibleSlides.length || !window.bootstrap?.Carousel) return;

    carousel.classList.add("is-bootstrap-ready");
    section.classList.add("carousel-is-ready");
    instance = window.bootstrap.Carousel.getOrCreateInstance(carousel, {
      interval: 5000,
      keyboard: true,
      pause: "hover",
      ride: !isPaused && visibleSlides.length > 1 ? "carousel" : false,
      touch: true,
      wrap: true
    });
    if (!isPaused && visibleSlides.length > 1) instance.cycle();
    carousel.removeEventListener("mouseleave", syncPlaybackAfterHover);
    carousel.addEventListener("mouseleave", syncPlaybackAfterHover);
  };

  toggle.addEventListener("click", () => {
    if (!instance || visibleSlides.length < 2) return;
    isPaused = !isPaused;
    if (isPaused) instance.pause();
    else instance.cycle();
    updateToggle();
  });

  rebuild("all");

  return {
    filter: rebuild,
    contains: (projectId) => originalSlides.some((slide) => slide.id === projectId),
    showProject: (projectId) => {
      const index = visibleSlides.findIndex((slide) => slide.id === projectId);
      if (index >= 0) instance?.to(index);
    }
  };
}

/* Validação progressiva e preparação honesta de e-mail, sem confirmar um envio externo. */
function setupContactForm() {
  const form = document.querySelector("#contact-form");
  if (!form) return;

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
      if (fieldName === "mensagem" && counter) counter.textContent = `${field.value.length} ${field.value.length === 1 ? "caractere" : "caracteres"}`;
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
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
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
      status.textContent = "Seu aplicativo de e-mail foi aberto. Revise a mensagem e confirme o envio.";
      status.classList.add("is-visible");
      status.focus();
    }
    window.location.href = `mailto:luizmariomoutinho1@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  });
}
