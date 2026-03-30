import { Doughnut } from 'react-chartjs-2';
import { CHART_COLORS, chartDefaults } from './ChartSetup';
import { label, formatRub } from '../../utils/format';

interface Props {
  title: string;
  data: Record<string, number>;
  height?: number;
}

export default function PieChartCard({ title, data, height = 300 }: Props) {
  const labels = Object.keys(data).map(label);
  const values = Object.values(data);

  const chartData = {
    labels,
    datasets: [{
      data: values,
      backgroundColor: CHART_COLORS.slice(0, values.length),
      borderWidth: 2,
      borderColor: '#fff',
      hoverOffset: 8,
    }],
  };

  const options = {
    ...chartDefaults,
    cutout: '55%',
    plugins: {
      ...chartDefaults.plugins,
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const total = values.reduce((a, b) => a + b, 0);
            const pct = ((ctx.raw / total) * 100).toFixed(1);
            return `${ctx.label}: ${formatRub(ctx.raw)} (${pct}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-slate-900 mb-4">{title}</h3>
      <div style={{ height }}>
        <Doughnut data={chartData} options={options} />
      </div>
    </div>
  );
}
