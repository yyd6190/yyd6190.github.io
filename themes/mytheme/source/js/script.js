// MyTheme 交互脚本
document.addEventListener('DOMContentLoaded', function() {
  // 平滑滚动返回顶部
  const scrollToTopBtn = document.createElement('button');
  scrollToTopBtn.classList.add('scroll-to-top');
  scrollToTopBtn.innerHTML = '↑';
  scrollToTopBtn.title = '返回顶部';
  document.body.appendChild(scrollToTopBtn);

  // 滚动显示/隐藏返回顶部按钮
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      scrollToTopBtn.classList.add('show');
    } else {
      scrollToTopBtn.classList.remove('show');
    }
  });

  // 点击返回顶部
  scrollToTopBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });

  // 暗黑模式切换
  setupThemeToggle();

  // 添加阅读进度条
  setupReadingProgress();
  
  // 设置目录交互
  setupTOC();

  // 设置图片浏览器
  setupImageLightbox();

  // 为代码块添加复制按钮
  const codeBlocks = document.querySelectorAll('pre code');
  if (codeBlocks.length > 0) {
    codeBlocks.forEach(function(codeBlock) {
      const copyBtn = document.createElement('button');
      copyBtn.classList.add('copy-btn');
      copyBtn.textContent = '复制';
      
      const pre = codeBlock.parentNode;
      pre.style.position = 'relative';
      pre.appendChild(copyBtn);
      
      copyBtn.addEventListener('click', function() {
        const code = codeBlock.textContent;
        navigator.clipboard.writeText(code).then(function() {
          copyBtn.textContent = '已复制!';
          setTimeout(function() {
            copyBtn.textContent = '复制';
          }, 2000);
        });
      });
    });
  }

  // 侧边栏粘性定位
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth > 768) {
    const header = document.getElementById('header');
    const headerHeight = header.offsetHeight;
    
    sidebar.style.position = 'sticky';
    sidebar.style.top = (headerHeight + 20) + 'px';
  }

  // 图片懒加载
  const lazyImages = document.querySelectorAll('.article-content img');
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          const lazyImage = entry.target;
          lazyImage.src = lazyImage.dataset.src;
          lazyImage.classList.remove('lazy');
          imageObserver.unobserve(lazyImage);
        }
      });
    });

    lazyImages.forEach(function(lazyImage) {
      if (lazyImage.dataset.src) {
        imageObserver.observe(lazyImage);
      }
    });
  }

  // 使表格响应式
  document.querySelectorAll('table').forEach(function(table) {
    const wrapper = document.createElement('div');
    wrapper.className = 'table-responsive';
    table.parentNode.insertBefore(wrapper, table);
    wrapper.appendChild(table);
  });
});

// 图片浏览器功能
function setupImageLightbox() {
  // 创建图片浏览器元素
  const lightbox = document.createElement('div');
  lightbox.className = 'img-lightbox';
  
  const lightboxImg = document.createElement('img');
  lightboxImg.className = 'lightbox-img';
  
  const closeBtn = document.createElement('div');
  closeBtn.className = 'lightbox-close';
  
  lightbox.appendChild(lightboxImg);
  lightbox.appendChild(closeBtn);
  document.body.appendChild(lightbox);
  
  // 获取文章中的所有图片
  const articleImages = document.querySelectorAll('.article-content img');
  
  if (!articleImages.length) return;
  
  // 为每张图片添加点击事件
  articleImages.forEach(img => {
    img.addEventListener('click', function() {
      const imgSrc = this.getAttribute('src');
      lightboxImg.setAttribute('src', imgSrc);
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden'; // 防止页面滚动
    });
  });
  
  // 关闭图片浏览器
  closeBtn.addEventListener('click', closeLightbox);
  lightbox.addEventListener('click', function(e) {
    if (e.target === this) {
      closeLightbox();
    }
  });
  
  // 键盘ESC关闭图片浏览器
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && lightbox.classList.contains('active')) {
      closeLightbox();
    }
  });
  
  function closeLightbox() {
    lightbox.classList.remove('active');
    setTimeout(() => {
      lightboxImg.setAttribute('src', '');
      document.body.style.overflow = '';
    }, 300);
  }
}

// 目录交互功能
function setupTOC() {
  const tocWrapper = document.querySelector('.toc-wrapper');
  const tocToggler = document.querySelector('.toc-toggler');
  
  if (!tocWrapper || !tocToggler) return;

  // 移动端目录切换
  tocToggler.addEventListener('click', function() {
    tocWrapper.classList.toggle('show');
  });

  // 点击目录外区域关闭目录（移动端）
  document.addEventListener('click', function(e) {
    if (tocWrapper.classList.contains('show') && 
        !tocWrapper.contains(e.target) && 
        !tocToggler.contains(e.target)) {
      tocWrapper.classList.remove('show');
    }
  });

  // 点击目录链接关闭目录（移动端）
  const tocLinks = tocWrapper.querySelectorAll('a');
  tocLinks.forEach(link => {
    link.addEventListener('click', function() {
      if (window.innerWidth <= 768) {
        setTimeout(() => {
          tocWrapper.classList.remove('show');
        }, 300);
      }
    });
  });

  // 目录高亮
  highlightTOC();
}

// 目录高亮功能
function highlightTOC() {
  const headings = document.querySelectorAll('.article-content h1, .article-content h2, .article-content h3');
  const tocLinks = document.querySelectorAll('.toc-link');
  
  if (!headings.length || !tocLinks.length) return;

  let headingsPos = [];
  
  // 获取所有标题的位置
  function updateHeadingsPos() {
    headingsPos = [];
    headings.forEach(heading => {
      headingsPos.push(heading.offsetTop);
    });
  }
  
  updateHeadingsPos();
  window.addEventListener('resize', updateHeadingsPos);

  // 滚动时更新当前目录项
  window.addEventListener('scroll', function() {
    const scrollPos = window.scrollY;
    
    // 为顶部导航栏高度添加偏移
    const offsetHeight = 60;
    
    // 找到当前滚动位置对应的标题
    let currentIndex = headingsPos.findIndex(pos => pos > scrollPos + offsetHeight);
    
    if (currentIndex === -1) {
      currentIndex = headingsPos.length;
    }
    
    // 如果找到匹配的标题，高亮对应的目录项
    tocLinks.forEach(link => {
      link.parentElement.classList.remove('active');
    });
    
    if (currentIndex > 0) {
      tocLinks[currentIndex - 1].parentElement.classList.add('active');
    } else if (headingsPos.length > 0 && scrollPos < headingsPos[0]) {
      tocLinks[0].parentElement.classList.add('active');
    }
  });

  // 点击目录项平滑滚动到对应位置
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        // 考虑顶部固定导航栏的偏移
        const offsetHeight = 60;
        const targetPosition = targetElement.offsetTop - offsetHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// 阅读进度条功能
function setupReadingProgress() {
  // 仅在文章页面添加阅读进度条
  const article = document.querySelector('.article');
  if (!article || document.querySelectorAll('.article').length > 1) {
    return;
  }

  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  document.body.appendChild(progressBar);

  function updateReadingProgress() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = window.scrollY / totalHeight;
    progressBar.style.transform = `scaleX(${progress})`;
  }

  window.addEventListener('scroll', updateReadingProgress);
  window.addEventListener('resize', updateReadingProgress);
  updateReadingProgress();
}

// 暗黑模式功能
function setupThemeToggle() {
  // 创建暗黑模式切换按钮
  const themeToggle = document.createElement('button');
  themeToggle.classList.add('theme-toggle');
  themeToggle.setAttribute('aria-label', '切换暗黑/亮色模式');
  themeToggle.title = '切换暗黑/亮色模式';
  
  // 创建图标
  const iconWrapper = document.createElement('div');
  iconWrapper.classList.add('icon');
  
  // 日/月图标
  const sunSVG = `<svg class="sun" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
  
  const moonSVG = `<svg class="moon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  
  iconWrapper.innerHTML = sunSVG + moonSVG;
  themeToggle.appendChild(iconWrapper);
  document.body.appendChild(themeToggle);
  
  // 初始化主题
  const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const savedTheme = localStorage.getItem('theme');
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDarkMode)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
  
  // 切换主题事件
  themeToggle.addEventListener('click', function() {
    document.body.classList.add('transition-fade', 'dark-mode-transition');
    
    setTimeout(function() {
      const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = currentTheme === 'light' ? 'dark' : 'light';
      
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('theme', newTheme);
      
      setTimeout(function() {
        document.body.classList.remove('transition-fade', 'dark-mode-transition');
      }, 50);
    }, 150);
  });
}