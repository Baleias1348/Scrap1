import { test, expect } from '@playwright/test';

// Captura logs de consola y requests de red para diagnóstico
const hookLogging = async (page: import('@playwright/test').Page) => {
  page.on('console', (msg) => {
    // Solo mostramos logs de la app
    const t = msg.type();
    const m = msg.text();
    if (m.includes('[UI]')) console.log(`[browser:${t}]`, m);
  });
  page.on('pageerror', (err) => console.log('[browser:error]', err.message));
  page.on('requestfailed', (req) => console.log('[network:failed]', req.url(), req.failure()?.errorText));
};

// Helpers para localizar botones por el texto visible
const clickByText = async (page: import('@playwright/test').Page, text: string) => {
  const el = page.getByRole('button', { name: new RegExp(text, 'i') });
  await expect(el).toBeVisible();
  await el.click({ trial: true }); // prueba de hit-testing
  await el.click();
};

// Prueba básica de hidratación y clics
test.describe('UI básica', () => {
  test('hidrata y reacciona a clics de header y héroe', async ({ page, baseURL }) => {
    await hookLogging(page);

    // Cargar home
    await page.goto(baseURL || 'http://localhost:3013', { waitUntil: 'domcontentloaded' });

    // Verificar hidratación
    await expect(page).toHaveTitle(/Preventi Flow/i);

    // Intento ver el log de hidratación
    // Si la app emite "[UI] HomePage hydrated" deberíamos verlo en consola (aparece en stdout del runner)

    // Clic en botones del header
    await clickByText(page, 'Iniciar sesión');
    await page.waitForTimeout(300);
    await clickByText(page, 'Registrarse');

    // Clic en botones del héroe
    await clickByText(page, 'Crea una cuenta');
    await page.waitForTimeout(300);
    await clickByText(page, 'Ingresa a tu dashboard');

    // Validar que alguno de los cambios de vista renderiza un formulario
    await expect(page.getByRole('heading', { name: /Iniciar sesión|Registrarse/i })).toBeVisible();
  });
});
