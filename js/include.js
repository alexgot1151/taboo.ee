async function includeHTML() {
  const includeElements = document.querySelectorAll('[data-include]');
  
  for (const el of includeElements) {
    const file = el.getAttribute('data-include');
    try {
      const response = await fetch(file);
      if (!response.ok) throw new Error(`Failed to load ${file}`);
      const content = await response.text();
      el.innerHTML = content;
    } catch (err) {
      console.error(err);
    }
  }
}

// Run after page load
document.addEventListener('DOMContentLoaded', includeHTML);
