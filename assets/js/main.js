/* ============================================================
   SOLOPrimus — main.js
   Mobile nav, FAQ accordion, scroll reveal, Stripe placeholders.
   ============================================================ */
(function () {
  "use strict";

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  var ctaWrap = document.querySelector(".nav-cta");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      if (ctaWrap) ctaWrap.classList.toggle("open-cta", open);
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () {
        links.classList.remove("open");
        if (ctaWrap) ctaWrap.classList.remove("open-cta");
      });
    });
  }

  /* ---------- Active nav link ---------- */
  var path = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a").forEach(function (a) {
    var href = a.getAttribute("href");
    if (href === path || (path === "" && href === "index.html")) {
      a.classList.add("active");
    }
  });

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll(".faq-item").forEach(function (item) {
    var q = item.querySelector(".faq-q");
    var a = item.querySelector(".faq-a");
    if (!q || !a) return;
    q.addEventListener("click", function () {
      var isOpen = item.classList.contains("open");
      // close siblings (single-open behavior)
      item.parentElement.querySelectorAll(".faq-item.open").forEach(function (other) {
        other.classList.remove("open");
        other.querySelector(".faq-a").style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add("open");
        a.style.maxHeight = a.scrollHeight + "px";
      }
    });
  });

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && revealEls.length) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            e.target.classList.add("visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  }

  /* ---------- Toast helper ---------- */
  var toastTimer = null;
  function toast(msg) {
    var el = document.querySelector(".toast");
    if (!el) {
      el = document.createElement("div");
      el.className = "toast";
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.classList.remove("show"); }, 3200);
  }

  /* ----------
     STRIPE INTEGRATION HOOK
     All subscription buttons carry class "stripe-checkout" and a
     data-plan attribute ("monthly" | "annual"). When Stripe is wired
     up, replace the handler below with a call to Stripe Checkout /
     Payment Links (e.g. stripe.redirectToCheckout). Until then the
     buttons show a placeholder toast.
  ---------- */
  document.querySelectorAll(".stripe-checkout").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      var plan = btn.getAttribute("data-plan") || "monthly";
      // TODO: replace with real Stripe Checkout session creation
      toast("Checkout for the " + plan + " plan is coming soon — Stripe integration in progress.");
    });
  });

  /* ---------- Locked widget CTAs ---------- */
  document.querySelectorAll("[data-unlock]").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      e.preventDefault();
      window.location.href = "pricing.html";
    });
  });

  /* ---------- Footer year (static fallback kept in HTML) ---------- */
  var yearEl = document.querySelector("[data-year]");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
