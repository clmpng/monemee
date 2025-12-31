import React, { useState, useMemo } from 'react';
import styles from '../../styles/components/EarningsChart.module.css';

/**
 * EarningsChart Component
 * Responsive bar chart for earnings visualization
 */
function EarningsChart({ data, type = 'earnings', height = 200 }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  
  // Calculate chart values
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];
    
    const values = data.map(d => type === 'earnings' ? d.earnings : d.sales);
    const maxValue = Math.max(...values, 1);
    
    return data.map((d, i) => ({
      ...d,
      value: type === 'earnings' ? d.earnings : d.sales,
      heightPercent: (( type === 'earnings' ? d.earnings : d.sales) / maxValue) * 100,
      index: i
    }));
  }, [data, type]);
  
  // Calculate max value for Y axis
  const maxValue = useMemo(() => {
    if (!data || data.length === 0) return 100;
    const values = data.map(d => type === 'earnings' ? d.earnings : d.sales);
    return Math.max(...values, 1);
  }, [data, type]);
  
  // Generate Y axis labels
  const yAxisLabels = useMemo(() => {
    const steps = 4;
    const labels = [];
    // Round max to nice number
    const niceMax = Math.ceil(maxValue / 10) * 10 || 100;
    for (let i = 0; i <= steps; i++) {
      labels.push(Math.round((niceMax / steps) * (steps - i)));
    }
    return labels;
  }, [maxValue]);
  
  // Format currency
  const formatCurrency = (value) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}k`;
    }
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };
  
  // Format date for tooltip
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit'
    });
  };
  
  // Format date for X axis
  const formatXAxisDate = (dateStr, index, total) => {
    const date = new Date(dateStr);
    
    // Show fewer labels based on data density
    let step = 1;
    if (total > 60) step = 14;
    else if (total > 30) step = 7;
    else if (total > 14) step = 3;
    else if (total > 7) step = 2;
    
    if (index % step !== 0 && index !== total - 1) return null;
    
    return date.toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit'
    });
  };
  
  if (!data || data.length === 0) {
    return (
      <div className={styles.chartEmpty}>
        <p>Keine Daten für diesen Zeitraum</p>
      </div>
    );
  }
  
  const hoveredData = hoveredIndex !== null ? chartData[hoveredIndex] : null;
  const barWidth = Math.max(100 / chartData.length - 1, 2);
  
  return (
    <div className={styles.chartContainer} style={{ '--chart-height': `${height}px` }}>
      {/* Y Axis Labels */}
      <div className={styles.yAxis}>
        {yAxisLabels.map((label, i) => (
          <span key={i} className={styles.yAxisLabel}>
            {type === 'earnings' ? `€${label}` : label}
          </span>
        ))}
      </div>
      
      {/* Chart Area */}
      <div className={styles.chartArea}>
        {/* Grid lines */}
        <div className={styles.gridLines}>
          {[0, 1, 2, 3, 4].map(i => (
            <div key={i} className={styles.gridLine} style={{ top: `${i * 25}%` }} />
          ))}
        </div>
        
        {/* Bars */}
        <div className={styles.barsContainer}>
          {chartData.map((d, i) => (
            <div
              key={i}
              className={styles.barWrapper}
              style={{ width: `${100 / chartData.length}%` }}
              onMouseEnter={() => setHoveredIndex(i)}
              onMouseLeave={() => setHoveredIndex(null)}
              onTouchStart={() => setHoveredIndex(i)}
              onTouchEnd={() => setHoveredIndex(null)}
            >
              <div 
                className={`${styles.bar} ${hoveredIndex === i ? styles.barHovered : ''}`}
                style={{ 
                  height: `${Math.max(d.heightPercent, d.value > 0 ? 2 : 0)}%`,
                  width: `${Math.min(barWidth, 24)}px`
                }}
              >
                {/* Gradient overlay for depth */}
                <div className={styles.barGradient} />
              </div>
              
              {/* Tooltip */}
              {hoveredIndex === i && (
                <div className={styles.tooltip}>
                  <div className={styles.tooltipDate}>{formatDate(d.date)}</div>
                  <div className={styles.tooltipValue}>
                    {type === 'earnings' 
                      ? formatCurrency(d.earnings)
                      : `${d.sales} Verkäufe`
                    }
                  </div>
                  {type === 'earnings' && d.sales > 0 && (
                    <div className={styles.tooltipSales}>
                      {d.sales} Verkauf{d.sales !== 1 ? 'e' : ''}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* X Axis Labels */}
      <div className={styles.xAxis}>
        {chartData.map((d, i) => {
          const label = formatXAxisDate(d.date, i, chartData.length);
          if (!label) return <span key={i} className={styles.xAxisSpacer} />;
          return (
            <span key={i} className={styles.xAxisLabel}>
              {label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

export default EarningsChart;
