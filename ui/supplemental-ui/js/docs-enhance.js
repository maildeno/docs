/* =========================================================
   docs-enhance.js — small progressive enhancements
   ---------------------------------------------------------
   Currently one job: give tables a real horizontal scroll
   container.

   Asciidoctor generates no wrapper element around a table.
   A block role like [.table-scroll] lands on the <table>
   itself, and setting display:block there breaks the
   percentage widths in <colgroup> — so the only correct way
   to get a scrollable table is to insert a wrapper.

   Everything here is optional. With JS disabled the tables
   render exactly as they did before: correct, just not
   scrollable on very narrow screens.
   ========================================================= */
(function () {
  'use strict'

  function wrapTables () {
    var article = document.querySelector('.article')
    if (!article) return

    var tables = article.querySelectorAll('table.tableblock')

    Array.prototype.forEach.call(tables, function (table) {
      var parent = table.parentNode
      if (!parent) return

      // Idempotent: safe to run twice (soft navigation, HMR).
      if (parent.classList && parent.classList.contains('table-scroll-wrap')) return

      var wrap = document.createElement('div')
      wrap.className = 'table-scroll-wrap'

      // role+tabindex make the scroll region reachable and
      // announced for keyboard and screen-reader users; a
      // silently scrollable div is a well-known a11y gap.
      wrap.setAttribute('role', 'region')
      wrap.setAttribute('tabindex', '0')

      // Prefer the table's own caption for the label, then a
      // preceding heading, so the announcement says what the
      // table is rather than just "region".
      var caption = table.querySelector('caption')
      var label = caption && caption.textContent.trim()
      if (!label) {
        var prev = table.previousElementSibling
        while (prev && !/^H[1-6]$/.test(prev.tagName)) prev = prev.previousElementSibling
        if (prev) label = prev.textContent.trim()
      }
      wrap.setAttribute('aria-label', label ? label + ' (table)' : 'Table')

      parent.insertBefore(wrap, table)
      wrap.appendChild(table)
    })
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wrapTables)
  } else {
    wrapTables()
  }
})()
