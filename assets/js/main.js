"use strict";

document.addEventListener("DOMContentLoaded", () => {
  document.documentElement.classList.add("js-enabled");
  setupTheme();
  setupMobileMenu();
  setupProjectShowcase();
  setupImageFallbacks();
  setupRevealAnimations();
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

/* Filtros e carrossel manual da vitrine, mantendo todo o conteúdo disponível sem JavaScript. */
function setupProjectShowcase() {
  const projects = Array.from(document.querySelectorAll("[data-project]"));
  const filterButtons = Array.from(document.querySelectorAll("[data-project-filter]"));
  if (!projects.length || !filterButtons.length) return;

  const sections = Array.from(document.querySelectorAll("[data-project-section]"));
  const status = document.querySelector("#filter-status");
  const carouselControllers = Array.from(document.querySelectorAll("[data-project-carousel]"))
    .map(setupProjectCarousel)
    .filter(Boolean);

  const applyFilter = (filter) => {
    let resultCount = 0;

    projects.forEach((project) => {
      const categories = project.dataset.category?.split(/\s+/).filter(Boolean) || [];
      const matches = filter === "all" || categories.includes(filter);
      project.hidden = !matches;
      if (matches) resultCount += 1;
    });

    sections.forEach((section) => {
      const sectionProjects = Array.from(section.querySelectorAll("[data-project]"));
      section.hidden = sectionProjects.every((project) => project.hidden);
    });

    filterButtons.forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.projectFilter === filter));
    });

    if (status) {
      status.textContent = resultCount === 1 ? "1 projeto encontrado." : `${resultCount} projetos encontrados.`;
    }

    carouselControllers.forEach((controller) => controller.refresh());
  };

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => applyFilter(button.dataset.projectFilter || "all"));
  });
}

function setupProjectCarousel(carousel) {
  const track = carousel.querySelector("[data-carousel-track]");
  const allSlides = Array.from(carousel.querySelectorAll("[data-slide-id]"));
  const previous = carousel.parentElement?.querySelector("[data-carousel-prev]");
  const next = carousel.parentElement?.querySelector("[data-carousel-next]");
  const indicators = Array.from(carousel.querySelectorAll("[data-carousel-indicator]"));
  if (!track || !allSlides.length || !previous || !next) return null;

  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let activeSlide = allSlides[0];
  let scrollFrame = 0;

  const visibleSlides = () => allSlides.filter((slide) => !slide.hidden);

  const setActive = (slide) => {
    const visible = visibleSlides();
    if (!slide || !visible.includes(slide)) slide = visible[0];
    activeSlide = slide || null;

    indicators.forEach((indicator) => {
      const relatedSlide = allSlides.find((item) => item.dataset.slideId === indicator.dataset.carouselIndicator);
      indicator.hidden = !relatedSlide || relatedSlide.hidden;
      if (relatedSlide === activeSlide) indicator.setAttribute("aria-current", "true");
      else indicator.removeAttribute("aria-current");
    });

    const activeIndex = activeSlide ? visible.indexOf(activeSlide) : -1;
    const controlsAreNeeded = visible.length > 1;
    previous.hidden = !controlsAreNeeded;
    next.hidden = !controlsAreNeeded;
    previous.disabled = activeIndex <= 0;
    next.disabled = activeIndex < 0 || activeIndex >= visible.length - 1;
  };

  const scrollToSlide = (slide, useMotion = true) => {
    if (!slide) return;
    const trackBox = track.getBoundingClientRect();
    const slideBox = slide.getBoundingClientRect();
    const targetLeft = track.scrollLeft + slideBox.left - trackBox.left;
    track.scrollTo({ left: targetLeft, behavior: useMotion && !reduceMotion.matches ? "smooth" : "auto" });
    setActive(slide);
  };

  const updateFromScroll = () => {
    const visible = visibleSlides();
    if (!visible.length) {
      setActive(null);
      return;
    }
    const trackCenter = track.getBoundingClientRect().left + track.clientWidth / 2;
    const nearest = visible.reduce((best, slide) => {
      const box = slide.getBoundingClientRect();
      const distance = Math.abs(box.left + box.width / 2 - trackCenter);
      return distance < best.distance ? { slide, distance } : best;
    }, { slide: visible[0], distance: Number.POSITIVE_INFINITY });
    setActive(nearest.slide);
  };

  previous.addEventListener("click", () => {
    const visible = visibleSlides();
    scrollToSlide(visible[Math.max(0, visible.indexOf(activeSlide) - 1)]);
  });

  next.addEventListener("click", () => {
    const visible = visibleSlides();
    scrollToSlide(visible[Math.min(visible.length - 1, visible.indexOf(activeSlide) + 1)]);
  });

  indicators.forEach((indicator) => {
    indicator.addEventListener("click", () => {
      scrollToSlide(allSlides.find((slide) => slide.dataset.slideId === indicator.dataset.carouselIndicator));
    });
  });

  track.addEventListener("keydown", (event) => {
    if (event.target !== track || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
    event.preventDefault();
    const visible = visibleSlides();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = Math.min(visible.length - 1, Math.max(0, visible.indexOf(activeSlide) + direction));
    scrollToSlide(visible[nextIndex]);
  });

  track.addEventListener("scroll", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateFromScroll);
  }, { passive: true });

  window.addEventListener("resize", () => {
    if (scrollFrame) cancelAnimationFrame(scrollFrame);
    scrollFrame = requestAnimationFrame(updateFromScroll);
  });

  const refresh = () => {
    const firstVisible = visibleSlides()[0];
    scrollToSlide(firstVisible, false);
    requestAnimationFrame(updateFromScroll);
  };

  setActive(activeSlide);
  return { refresh };
}

/* Fallback editorial apenas para falhas reais de carregamento; os assets originais permanecem intactos. */
function setupImageFallbacks() {
  document.querySelectorAll(".project-media img, .case-hero-visual img").forEach((image) => {
    const showFallback = () => {
      const container = image.parentElement;
      if (!container || container.classList.contains("has-missing-image")) return;
      const fallback = document.createElement("span");
      fallback.className = "media-fallback";
      fallback.setAttribute("role", "img");
      fallback.setAttribute("aria-label", image.alt || "Recurso visual do projeto indisponível");
      fallback.textContent = "Visual do projeto";
      image.hidden = true;
      container.classList.add("has-missing-image");
      container.append(fallback);
    };

    image.addEventListener("error", showFallback);
    if (image.complete && image.naturalWidth === 0) showFallback();
  });
}

/* Entrada discreta ativada só quando o navegador oferece suporte e não há movimento reduzido. */
function setupRevealAnimations() {
  const elements = Array.from(document.querySelectorAll(".reveal"));
  if (!elements.length || !("IntersectionObserver" in window) || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  document.documentElement.classList.add("reveal-ready");
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-visible");
      observer.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -8%", threshold: .08 });

  elements.forEach((element) => observer.observe(element));
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
