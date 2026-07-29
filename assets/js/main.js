"use strict";

document.addEventListener("DOMContentLoaded", () => {
  setupTheme();
  setupMobileMenu();
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

/* Validação progressiva do formulário demonstrativo, sem qualquer requisição. */
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

    form.reset();
    Object.keys(fields).forEach((fieldName) => setError(fieldName));
    if (counter) counter.textContent = "0 caracteres";
    if (status) {
      status.textContent = "Mensagem enviada com sucesso!";
      status.classList.add("is-visible");
      status.focus();
    }
  });
}
