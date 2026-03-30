import { Bar } from 'react-chartjs-2';
import { CHART_COLORS, chartDefaults } from './ChartSetup';
import { label, formatRub } from '../../utils/format';

interface Props {
  title: string;
  data: Record<string, number>;
  color?: string;
  height?: number;
  horizontal?: boolean;
}

export default function BarChartCard({ title, data, color, height = 300, horizontal = false }: Props) {
  const labels = Object.keys(data).map(label);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: color
        ? values.map(() => color + '20')
        : CHART_COLORS.slice(0, values.length).map(c => c + '30'),
      borderColor: color
        ? values.map(() => color)
        : CHART_COLORS.slice(0, values.length),
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  const options = {
    ...chartDefaults,
    indexAxis: horizontal ? ('y' as const) : ('x' as const),
    plugins: {
      ...chartDefaults.plugins,
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => formatRub(ctx.raw),
        },
      },
    },
    scales: {
      x: {
        grid: { display: !horizontal },
        ticks: {
          callback: horizontal ? (v: any) => formatRub(v) : undefined,
        },
      },
      y: {
        grid: { display: horizontal },
        ticks: {
          callback: !horizontal ? (v: any) => formatRub(v) : undefined,
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div style={{ height }}>
        <Bar data={chartData} options={options as any} />
      </div>
    </div>
  );
}
