/**
 * Layout raíz de la aplicación
 * Define estructura HTML base y metadatos
 */

import './globals.css';

export const metadata = {
  title: 'Workana Tracker - Trabajos de Programación',
  description: 'Encuentra los últimos trabajos de programación en Workana, ordenados por fecha de publicación',
  keywords: 'workana, freelance, programación, trabajos, desarrollo web, IT',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
