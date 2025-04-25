// 简化的 JavaScript 功能
document.addEventListener('DOMContentLoaded', function() {
  // 使表格响应式
  document.querySelectorAll('table').forEach(function(table) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});