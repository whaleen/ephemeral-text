export class ThemeManager {
  private html: HTMLElement;
  private themeToggle: HTMLElement | null;

  constructor() {
    this.html = document.documentElement;
    this.themeToggle = document.getElementById('theme-toggle');
    
    if (!this.themeToggle) {
      console.error('Theme toggle button not found!');
      return;
    }
    
    this.initializeTheme();
  }

  private initializeTheme() {
    // Load saved theme or default to light
    const savedTheme = localStorage.getItem('theme');
    
    if (savedTheme === 'dark') {
      this.html.classList.add('dark');
    } else {
      // Default to light mode
      this.html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }

    // Set up toggle listener
    this.themeToggle?.addEventListener('click', () => {
      console.log('Theme toggle clicked');
      this.toggleTheme();
    });
  }

  private toggleTheme() {
    console.log('Current theme:', this.html.classList.contains('dark') ? 'dark' : 'light');
    console.log('HTML classList before:', this.html.className);
    
    if (this.html.classList.contains('dark')) {
      this.html.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      console.log('Switched to light mode');
    } else {
      this.html.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      console.log('Switched to dark mode');
    }
    
    console.log('HTML classList after:', this.html.className);
  }

  getCurrentTheme(): 'light' | 'dark' {
    return this.html.classList.contains('dark') ? 'dark' : 'light';
  }

  setTheme(theme: 'light' | 'dark') {
    if (theme === 'dark') {
      this.html.classList.add('dark');
    } else {
      this.html.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }
}