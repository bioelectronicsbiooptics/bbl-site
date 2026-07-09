/* AMSL site interactions — vanilla, no dependencies */
(function () {
  "use strict";

  /* ---- Theme: persist choice, else follow system ---- */
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem("amsl-theme");
    if (saved === "dark" || saved === "light") root.setAttribute("data-theme", saved);
  } catch (e) {}

  function bindTheme() {
    var btn = document.querySelector(".theme-toggle");
    if (!btn) return;
    btn.addEventListener("click", function () {
      var current = root.getAttribute("data-theme");
      if (!current) {
        current = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      }
      var next = current === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("amsl-theme", next); } catch (e) {}
    });
  }

  /* ---- Header shadow on scroll ---- */
  function bindHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---- Mobile menu ---- */
  function bindMenu() {
    var burger = document.querySelector(".nav__burger");
    var links = document.querySelector(".nav__links");
    if (!burger || !links) return;
    burger.addEventListener("click", function () {
      var open = links.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") links.classList.remove("is-open");
    });
  }

  /* ---- Reveal on scroll ---- */
  function bindReveal() {
    var els = document.querySelectorAll(".reveal");
    if (!("IntersectionObserver" in window) || !els.length) {
      els.forEach(function (el) { el.classList.add("in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    els.forEach(function (el) { io.observe(el); });
  }

  /* ---- Publication filter ---- */
  function bindFilter() {
    var chips = document.querySelectorAll(".chip[data-filter]");
    var pubs = document.querySelectorAll(".pub[data-topics]");
    if (!chips.length) return;
    chips.forEach(function (chip) {
      chip.addEventListener("click", function () {
        chips.forEach(function (c) { c.classList.remove("is-active"); });
        chip.classList.add("is-active");
        var f = chip.getAttribute("data-filter");
        pubs.forEach(function (p) {
          var show = f === "all" || (" " + p.getAttribute("data-topics") + " ").indexOf(" " + f + " ") > -1;
          p.style.display = show ? "" : "none";
        });
      });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    bindTheme();
    bindHeader();
    bindMenu();
    bindReveal();
    bindFilter();
  });
})();
