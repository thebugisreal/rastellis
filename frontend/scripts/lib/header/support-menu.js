class SupportMenu extends HTMLElement {
    constructor () {
      super ()
  
      this.listMenuParents = this.querySelectorAll('.js-parent-menu')
      this.overlay = document.querySelector('[data-header-overlay]')
      this.innerOverlay = this.overlay?.querySelector('.header-overlay__inner')
  
      const viewportWidth = parseFloat(this.getViewportWidth())

      if(viewportWidth >= 768) {
        this.handleToggleMenu();
        this.setLeftPosition();
      }
    
      window.addEventListener('resize', () => {
        this.setLeftPosition();
        this.handleToggleMenu();
      }, true)
    }
  
    getViewportWidth() {
      return window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    }
  
    handleToggleMenu() {
      this.listMenuParents.forEach(parent => {
        const heading = parent.querySelector('.js-heading')
        const submenu = parent.querySelector('.js-submenu')
  
        parent.addEventListener('mouseenter', () => {
          if(window.innerWidth >= 768) {
            this.closeAll()
            heading.classList.add('active')
            submenu.classList.add('active')
    
            this.overlay?.classList.add('is-active')
            this.innerOverlay?.classList.add('is-visible')
          }
        })
        parent.addEventListener('mouseleave', () => {
          if(window.innerWidth >= 768) {
            this.closeAll()
          }
        })
      })
    }
  
    closeAll() {
      this.listMenuParents.forEach(parent => {
        const heading = parent.querySelector('.js-heading')
        const submenu = parent.querySelector('.js-submenu')
  
        heading.classList.remove('active')
        submenu.classList.remove('active')
        this.overlay?.classList.remove('is-active')
        this.innerOverlay?.classList.remove('is-visible')
      })
    }
  
    setLeftPosition () {
      this.listMenuParents.forEach(parent => {
        let leftPosition = 0
        const submenu = parent.querySelector('.js-submenu')
        leftPosition = submenu ? parent.getBoundingClientRect().left : 0
  
        if (leftPosition > 0) {
          parent.style.setProperty('--left-position', `${leftPosition.toFixed() - 1}px`)
        }
      })
    }
  }
  
  window.customElements.define('support-menu', SupportMenu)
  