// 모바일 환경(768px 이하)에서는 TOC 동작 비활성화
if (window.innerWidth > 768) {
  document.addEventListener('DOMContentLoaded', function () {
    var tocNav = document.querySelector('.toc');
    if (!tocNav) return;

    // TOC 접기/펼치기 기능
    var toggleBtn = document.querySelector('.toc-toggle');
    var tocBody = document.querySelector('.toc-body');

    if (toggleBtn && tocBody) {
      toggleBtn.addEventListener('click', function () {
        var isCollapsed = tocBody.classList.contains('collapsed');
        tocBody.classList.toggle('collapsed');
        toggleBtn.textContent = isCollapsed ? '▲' : '▼';
        toggleBtn.setAttribute('aria-label', isCollapsed ? '목차 접기' : '목차 펼치기');
      });
    }

    // TOC 표시 깊이 설정 (data-toc-depth 속성 기준)
    var maxDepth = parseInt(tocNav.getAttribute('data-toc-depth'), 10);
    if (maxDepth && maxDepth < 6) {
      tocNav.querySelectorAll('.toc-item').forEach(function (item) {
        var depth = 0;
        var current = item.parentElement;
        while (current && !current.classList.contains('toc')) {
          if (current.classList.contains('toc-list') || current.classList.contains('toc-sublist')) {
            depth++;
          }
          current = current.parentElement;
        }
        if (depth > maxDepth) {
          item.classList.add('toc-item--hidden');
        }
      });
      // 모든 하위 항목이 숨겨진 빈 toc-sublist도 함께 숨김
      tocNav.querySelectorAll('.toc-sublist').forEach(function (sublist) {
        var allHidden = Array.from(sublist.children).every(function (child) {
          return child.classList.contains('toc-item--hidden');
        });
        if (allHidden) {
          sublist.classList.add('toc-item--hidden');
        }
      });
    }
  });
}
