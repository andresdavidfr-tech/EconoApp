# Plan de Implementación: Calibración y Consistencia de Series Históricas y Gráficos

## 1. Diagnóstico del Problema
Tras la auditoría del código fuente (`server.ts`, `src/data.ts`, `src/dailySync.ts` y `src/App.tsx`), se detectaron cuatro causas principales de inconsistencia en los gráficos:
1. **Desacople entre Cotización Actual y Serie Histórica**: Cuando la API en tiempo real actualiza `v.value` (ej. Dólar Oficial BNA ~$1.050 o Dólar Blue ~$1.220), el array `v.history` no se actualizaba, manteniendo valores sintéticos desfasados (hasta $1.535). Al abrir el modal, el último punto del gráfico y el valor de la tarjeta entraban en conflicto visual y numérico.
2. **Falla de Rango en Variables Mensuales (IPC, Salarios, Canastas)**: El filtro temporal calculaba fechas por días de calendario (`30D`, `90D`). Dado que las variables mensuales solo poseen un registro cada 30 días, el filtro devolvía $\le 1$ punto y caía en un fallback (`slice(-30)`), trayendo erróneamente 30 meses (2,5 años) bajo la etiqueta "30D", arrojando variaciones porcentuales distorsionadas.
3. **Escalones Planos en Sincronización Diaria**: El sincronizador de días faltantes (`dailySync.ts`) duplicaba linealmente el último valor sin variación estocástica ni anclaje con el valor en vivo.
4. **Hitos Históricos Desactualizados**: Los puntos de control en `data.ts` contenían proyecciones teóricas no alineadas con la cotización oficial y paralela real del BCRA/Ámbito/DolarApi de las últimas semanas.

---

## 2. Decisiones de Diseño (Conformidad con Preguntas Aclaratorias)
- **Variables Mensuales**: Mantener el selector unificado `30D`, `90D`, `1Y`, `3Y` adaptando la granularidad para series mensuales (ej. `30D` muestra los últimos 3-4 períodos publicados, `90D` los últimos 6-7, `1Y` el último año móvil, `3Y` la serie extendida).
- **Sincronización Unificada**: Sincronizar el valor actual (`v.value`) con el último nodo de la serie histórica (`v.history[last]`) tanto en el backend (`server.ts`) como en el frontend (`dailySync.ts` y `data.ts`), garantizando consistencia absoluta entre tarjeta y gráfico modal.

---

## 3. Plan de Cambios Detallado

### A. Sincronización Backend y Frontend (`server.ts` & `src/dailySync.ts`)
- En `server.ts` (`syncExternalDollarRates` y `syncExternalInflation`):
  - Al actualizar `v.value`, verificar si el último elemento de `v.history` corresponde a la fecha actual (`todayStr`). Si coincide, actualizar su valor; si no, anexar el nuevo punto con fecha de hoy.
  - Recalcular automáticamente el cambio diario (`v.change`) y la variación porcentual (`v.changePercent`) a partir del penúltimo registro histórico real.
- En `src/dailySync.ts`:
  - Asegurar que `syncVariablesToCurrentDate()` respete el valor en vivo y garantice que el punto final de `history` tenga exactamente `value === v.value` y `date === todayStr`.

### B. Recalibración de Hitos en Base de Datos (`src/data.ts`)
- Ajustar los hitos de referencia histórica a los valores oficiales de mercado:
  - **Dólar Oficial (BNA)**: trayectoria realista hacia ~$1.045 - $1.060.
  - **Dólar Blue**: trayectoria hacia ~$1.210 - $1.235.
  - **Dólar MEP**: ~$1.135 - $1.150.
  - **Dólar CCL**: ~$1.170 - $1.190.
  - **Riesgo País**: trayectoria de descenso hacia los ~1.000 - 1.050 pb.
  - **Inflación Mensual (IPC)**: trayectoria oficial INDEC (ene-24 a dic-24/ene-25 descendiendo del 20,6% al 2,4%-2,7%).
- Eliminar saltos bruscos o interpolaciones rígidas en los últimos 90 días para que la curva sea continua y representativa.

### C. Refactorización del Gráfico Modal (`src/App.tsx`)
- **Adaptación por Frecuencia (`frequency === 'monthly'`)**:
  - `30D`: Muestra los últimos 4 meses disponibles para observar la tendencia trimestral inmediata.
  - `90D`: Muestra los últimos 7 meses.
  - `1Y`: Muestra los últimos 13 meses.
  - `3Y` / `ALL`: Muestra la serie histórica completa.
- **Cálculo de Estadísticas de Inspección (`chartStats`)**:
  - `finalVal` vinculado directamente a `activeVar.value`.
  - `initialVal` tomado del primer valor del subconjunto temporal seleccionado.
  - Variación nominal y porcentual calculadas con precisión, evitando divisiones por cero o comparaciones desfasadas.
- **Exportación CSV Consistente**:
  - Garantizar que la descarga CSV del modal exporte los puntos calibrados exactos que se observan en pantalla.

### D. Auditoría General de la Aplicación
- Revisión de tooltips, formateo numérico (`Intl.NumberFormat`, `tabular-nums`), manejo de nulos y carga asíncrona.
- Verificación de la versión móvil y responsividad del modal de noticias y de inspección de variables.
- Ejecución de `lint_applet` y `compile_applet` para asegurar compilación limpia sin advertencias.

---

## 4. Criterios de Aceptación
1. Al hacer clic en cualquier tarjeta (ej. Dólar Blue u Oficial), el valor del extremo derecho del gráfico modal coincide exactamente con el valor mostrado en la tarjeta.
2. Las variables mensuales (como IPC) al seleccionar `30D` o `90D` muestran una evolución limpia de los últimos meses, sin retroceder 30 meses al pasado ni generar variaciones erráticas.
3. La variación porcentual calculada en el encabezado del modal refleja estrictamente el período seleccionado sin saltos artificiales.
4. No hay errores de lint ni de compilación.
