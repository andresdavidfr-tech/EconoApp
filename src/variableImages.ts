/**
 * Catálogo de imágenes breves y directas que explican visualmente cada variable económica.
 * Permite una comprensión instantánea a través de gráficos e imágenes sin necesidad de texto largo.
 */

export const VARIABLE_IMAGES: Record<string, string> = {
  // Divisas y Mercado Cambiario
  bna_dolar_billete: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80', // Billetes de dólar
  bna_dolar_divisa: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80', // Transferencia internacional
  dolar_blue: 'https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&w=400&q=80', // Mercado libre / efectivo
  dolar_mep_byma: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80', // Bonos bursátiles
  dolar_ccl_byma: 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=400&q=80', // Cable / CEDEARs
  dolar_tarjeta: 'https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80', // Tarjeta de crédito
  dolar_cripto: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=400&q=80', // Cripto / stablecoins
  reservas_brutas: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80', // Lingotes de oro / bóveda
  liquidacion_ciara_cec: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80', // Granos y silos agrícolas

  // Precios e Inflación
  ipc_nivel_general: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80', // Carrito de supermercado
  canasta_basica_alimentaria: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80', // Alimentos frescos / canasta
  canasta_basica_total: 'https://images.unsplash.com/photo-1583258292688-d0213dc5a3a8?auto=format&fit=crop&w=400&q=80', // Hogar y bienes familiares
  inflacion_mayorista_ipim: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80', // Depósito mayorista / logística
  rem_inflacion_esperada: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&q=80', // Gráficos de proyección
  costo_construccion_cac: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=400&q=80', // Obra y construcción

  // Tasas y Ahorro
  tasa_politica_monetaria: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=400&q=80', // Banco Central / sede
  tasa_badlar: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80', // Tasa bancaria / depósito
  valor_uva: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80', // Llaves de vivienda / UVA
  coeficiente_cer: 'https://images.unsplash.com/photo-1554224154-26032ffc0d07?auto=format&fit=crop&w=400&q=80', // Ajuste por inflación
  plazo_fijo_minorista_tna: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=400&q=80', // Alcancía / ahorro
  base_monetaria: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80', // Impresión de billetes
  m2_privado: 'https://images.unsplash.com/photo-1565372195458-9de0b320ef04?auto=format&fit=crop&w=400&q=80', // Cajero automático / efectivo

  // Industria y Actividad
  produccion_industrial_ipi: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80', // Brazo robótico industrial
  despacho_cemento: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80', // Cemento y hormigón
  produccion_automotriz_adefa: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80', // Línea de montaje automotriz
  demanda_electrica_cammesa: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80', // Red eléctrica de alta tensión
  ventas_minoristas_came: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=400&q=80', // Local comercial / comercio
  emae_actividad_indec: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80', // Edificios corporativos
  recaudacion_tributaria_arca: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80', // Recaudación y fiscal

  // Crédito, Salarios e Inmuebles
  indice_icl: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=400&q=80', // Departamento / alquiler
  ripte_salario_estable: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80', // Recibo de sueldo / salario
  escrituras_caba: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=400&q=80', // Escritura notarial
  creditos_hipotecarios_uva: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=400&q=80', // Casa propia
  stock_credito_privado: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=400&q=80', // Terminal POS / crédito

  // Brasil Variables
  bcb_dolar_ptax_venda: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80',
  bcb_dolar_turismo: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=400&q=80',
  bcb_euro_ptax: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80',
  bcb_reservas_internacionais: 'https://images.unsplash.com/photo-1610375461246-83df859d849d?auto=format&fit=crop&w=400&q=80',
  ipca_ibge_mensual: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
  igpm_fgv_mensual: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=400&q=80',
  cesta_basica_dieese: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80',
  selic_meta_bcb: 'https://images.unsplash.com/photo-1541354329998-f4d9a9f9297f?auto=format&fit=crop&w=400&q=80',
  cdi_over_b3: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
  pim_ibge_industrial: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
  producao_veiculos_anfavea: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=400&q=80',
  consumo_energia_ccee: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=400&q=80',
  salario_minimo_brasil: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
  credito_total_sfn: 'https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=400&q=80',
  ibc_br_bcb: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=400&q=80'
};

// Fallback por tema si la variable no tiene imagen específica
export const TOPIC_DEFAULT_IMAGES: Record<string, string> = {
  cambiario_divisas: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?auto=format&fit=crop&w=400&q=80',
  precios_inflacion: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80',
  tasas_ahorro: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=400&q=80',
  actividad_industria: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=400&q=80',
  credito_salarios: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80'
};

/**
 * Obtiene la imagen breve ilustrativa de cada variable económica.
 */
export function getVariableImage(variableId: string, topicId?: string): string {
  if (VARIABLE_IMAGES[variableId]) {
    return VARIABLE_IMAGES[variableId];
  }
  if (topicId && TOPIC_DEFAULT_IMAGES[topicId]) {
    return TOPIC_DEFAULT_IMAGES[topicId];
  }
  return 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=400&q=80';
}
