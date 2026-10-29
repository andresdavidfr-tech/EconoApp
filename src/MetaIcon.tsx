import React from 'react';
import {
  Banknote,
  ArrowLeftRight,
  DollarSign,
  TrendingUp,
  Globe,
  CreditCard,
  Cpu,
  Landmark,
  Activity,
  ShoppingCart,
  ShoppingBag,
  Home,
  Boxes,
  Truck,
  Percent,
  PiggyBank,
  Scale,
  Building2,
  Key,
  Factory,
  HardHat,
  Car,
  Zap,
  Store,
  BarChart3,
  Receipt,
  Building,
  Wallet,
  FileCheck,
  Plane,
  Euro,
  Coins,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { TopicId } from './types';

export interface MetaIconConfig {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  color: string;
  bgColor: string;
  borderColor: string;
  label?: string;
}

/**
 * Mapeo de cada variable económica a su pictograma de trazo limpio estilo Meta / iOS
 */
export function getMetaIconConfig(variableId: string, topicId?: TopicId | string): MetaIconConfig {
  switch (variableId) {
    // Divisas y tipos de cambio
    case 'bna_dolar_billete':
    case 'bcb_dolar_ptax_venda':
      return {
        icon: Banknote,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-200/80',
        label: 'Billete Oficial'
      };

    case 'bna_dolar_divisa':
      return {
        icon: ArrowLeftRight,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Comercio Exterior'
      };

    case 'dolar_blue':
      return {
        icon: DollarSign,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50/90',
        borderColor: 'border-indigo-200/80',
        label: 'Mercado Libre'
      };

    case 'dolar_mep_byma':
      return {
        icon: TrendingUp,
        color: 'text-cyan-700',
        bgColor: 'bg-cyan-50/90',
        borderColor: 'border-cyan-200/80',
        label: 'Bolsa MEP'
      };

    case 'dolar_ccl_byma':
      return {
        icon: Globe,
        color: 'text-purple-700',
        bgColor: 'bg-purple-50/90',
        borderColor: 'border-purple-200/80',
        label: 'Cable CCL'
      };

    case 'dolar_tarjeta':
      return {
        icon: CreditCard,
        color: 'text-rose-700',
        bgColor: 'bg-rose-50/90',
        borderColor: 'border-rose-200/80',
        label: 'Tarjeta Consumo'
      };

    case 'dolar_cripto':
      return {
        icon: Cpu,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-200/80',
        label: 'Cripto / USDT'
      };

    case 'bcb_dolar_turismo':
      return {
        icon: Plane,
        color: 'text-sky-700',
        bgColor: 'bg-sky-50/90',
        borderColor: 'border-sky-200/80',
        label: 'Turismo Papel'
      };

    case 'bcb_euro_ptax':
      return {
        icon: Euro,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Euro PTAX'
      };

    case 'reservas_brutas':
    case 'bcb_reservas_internacionais':
      return {
        icon: Landmark,
        color: 'text-slate-800',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
        label: 'Reservas Banco Central'
      };

    case 'riesgo_pais_embi':
    case 'risco_pais_embi_br':
      return {
        icon: Activity,
        color: 'text-amber-800',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-200/80',
        label: 'Riesgo Soberano'
      };

    // Precios e inflación
    case 'ipc_inflacion_mensual':
    case 'ipc_nivel_general':
    case 'ipca_ibge_mensual':
      return {
        icon: ShoppingCart,
        color: 'text-rose-700',
        bgColor: 'bg-rose-50/90',
        borderColor: 'border-rose-200/80',
        label: 'Índice de Precios'
      };

    case 'canasta_basica_alimentaria':
    case 'cesta_basica_dieese':
      return {
        icon: ShoppingBag,
        color: 'text-orange-700',
        bgColor: 'bg-orange-50/90',
        borderColor: 'border-orange-200/80',
        label: 'Canasta Alimentaria'
      };

    case 'canasta_basica_total':
      return {
        icon: Home,
        color: 'text-teal-700',
        bgColor: 'bg-teal-50/90',
        borderColor: 'border-teal-200/80',
        label: 'Línea de Pobreza'
      };

    case 'inflacion_mayorista_ipim':
    case 'igpm_fgv_mensual':
      return {
        icon: Boxes,
        color: 'text-amber-700',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-200/80',
        label: 'Precios Mayoristas'
      };

    case 'costo_construccion_cac':
      return {
        icon: HardHat,
        color: 'text-amber-800',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-200/80',
        label: 'Costo Construcción'
      };

    // Tasas y Ahorro
    case 'tasa_plazo_fijo_bna':
    case 'plazo_fijo_minorista_tna':
    case 'cdi_over_b3':
      return {
        icon: PiggyBank,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-200/80',
        label: 'Plazo Fijo / Ahorro'
      };

    case 'tasa_politica_monetaria':
    case 'selic_meta_bcb':
      return {
        icon: Percent,
        color: 'text-blue-800',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Tasa Referencia'
      };

    case 'tasa_badlar':
      return {
        icon: Building2,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50/90',
        borderColor: 'border-indigo-200/80',
        label: 'Tasa BADLAR'
      };

    case 'valor_uva':
      return {
        icon: Key,
        color: 'text-sky-700',
        bgColor: 'bg-sky-50/90',
        borderColor: 'border-sky-200/80',
        label: 'Unidad UVA'
      };

    // Actividad e Industria
    case 'produccion_industrial_ipi':
    case 'pim_ibge_industrial':
      return {
        icon: Factory,
        color: 'text-slate-800',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
        label: 'Industria Manufacturera'
      };

    case 'produccion_automotriz_adefa':
    case 'produccion_veiculos_anfavea':
      return {
        icon: Car,
        color: 'text-blue-800',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Industria Automotriz'
      };

    case 'demanda_electrica_cammesa':
    case 'consumo_energia_ccee':
      return {
        icon: Zap,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50/90',
        borderColor: 'border-amber-200/80',
        label: 'Energía Eléctrica'
      };

    case 'ventas_minoristas_came':
      return {
        icon: Store,
        color: 'text-indigo-700',
        bgColor: 'bg-indigo-50/90',
        borderColor: 'border-indigo-200/80',
        label: 'Comercio Minorista'
      };

    case 'emae_actividad_indec':
    case 'ibc_br_bcb':
      return {
        icon: BarChart3,
        color: 'text-blue-900',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Actividad Económica'
      };

    case 'recaudacion_tributaria_arca':
      return {
        icon: Receipt,
        color: 'text-emerald-800',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-200/80',
        label: 'Recaudación Fiscal'
      };

    // Crédito y Salarios
    case 'indice_icl':
      return {
        icon: Building,
        color: 'text-violet-700',
        bgColor: 'bg-violet-50/90',
        borderColor: 'border-violet-200/80',
        label: 'Alquileres ICL'
      };

    case 'ripte_salario_estable':
    case 'salario_minimo_brasil':
      return {
        icon: Wallet,
        color: 'text-emerald-700',
        bgColor: 'bg-emerald-50/90',
        borderColor: 'border-emerald-200/80',
        label: 'Salario Formal'
      };

    case 'escrituras_caba':
      return {
        icon: FileCheck,
        color: 'text-slate-700',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200',
        label: 'Mercado Inmobiliario'
      };

    case 'creditos_hipotecarios_uva':
    case 'stock_credito_privado':
    case 'credito_total_sfn':
      return {
        icon: Coins,
        color: 'text-blue-700',
        bgColor: 'bg-blue-50/90',
        borderColor: 'border-blue-200/80',
        label: 'Crédito al Sector Privado'
      };

    default:
      // Fallback por tópico
      if (topicId === 'cambiario_divisas') {
        return {
          icon: Banknote,
          color: 'text-blue-700',
          bgColor: 'bg-blue-50/90',
          borderColor: 'border-blue-200/80'
        };
      }
      if (topicId === 'precios_inflacion') {
        return {
          icon: ShoppingCart,
          color: 'text-rose-700',
          bgColor: 'bg-rose-50/90',
          borderColor: 'border-rose-200/80'
        };
      }
      if (topicId === 'tasas_ahorro') {
        return {
          icon: PiggyBank,
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50/90',
          borderColor: 'border-emerald-200/80'
        };
      }
      if (topicId === 'actividad_industria') {
        return {
          icon: Factory,
          color: 'text-slate-800',
          bgColor: 'bg-slate-100',
          borderColor: 'border-slate-200'
        };
      }
      if (topicId === 'credito_salarios') {
        return {
          icon: Wallet,
          color: 'text-emerald-700',
          bgColor: 'bg-emerald-50/90',
          borderColor: 'border-emerald-200/80'
        };
      }
      return {
        icon: BarChart3,
        color: 'text-slate-800',
        bgColor: 'bg-slate-100',
        borderColor: 'border-slate-200'
      };
  }
}

/**
 * Componente de Pictograma / Icono estilo Meta Account Center
 */
export function MetaIcon({
  variableId,
  topicId,
  size = 'md',
  monochrome = false,
  className = ''
}: {
  variableId: string;
  topicId?: TopicId | string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  monochrome?: boolean;
  className?: string;
}) {
  const config = getMetaIconConfig(variableId, topicId);
  const IconComponent = config.icon;

  const sizeClasses = {
    xs: 'w-6 h-6 rounded-lg',
    sm: 'w-7 h-7 rounded-xl',
    md: 'w-9 h-9 rounded-xl',
    lg: 'w-12 h-12 rounded-2xl',
    xl: 'w-14 h-14 rounded-2xl'
  };

  const iconSizes = {
    xs: 'size-3.5',
    sm: 'size-4',
    md: 'size-5',
    lg: 'size-6',
    xl: 'size-7'
  };

  return (
    <div
      className={`inline-flex items-center justify-center shrink-0 border transition-transform duration-200 ${
        monochrome
          ? 'bg-slate-100/90 text-slate-800 border-slate-200/70'
          : `${config.bgColor} ${config.color} ${config.borderColor}`
      } ${sizeClasses[size]} ${className}`}
    >
      <IconComponent className={iconSizes[size]} strokeWidth={1.85} />
    </div>
  );
}
