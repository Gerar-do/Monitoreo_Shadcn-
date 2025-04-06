"use client"

import React, { useEffect, useState } from "react"
import { AlertCircle } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

// Interfaces para los datos
interface SensorAnomaly {
  fecha: string;
  sensor: string;
  descripcion: string;
  nivel_riesgo?: string;
  tipo: 'critica' | 'advertencia' | 'informativa';
}

interface ApiSensorData {
  temperatura: number | null;
  humedad: number | null;
  luminosidad: number | null;
  humedad_suelo: number | null;
  fecha: string;
}

interface ApiReportData {
  anomalias: SensorAnomaly[];
  ubicacion: string;
  total_criticas: number;
  total_advertencias: number;
  total_informativas: number;
  hora_pico: string;
}

// Componente de alerta para errores de conexión
function Alert({ 
  children, 
  variant = "default" 
}: { 
  children: React.ReactNode, 
  variant?: "default" | "destructive" 
}) {
  const variantClasses = variant === "destructive" 
    ? "bg-destructive/10 text-destructive border-destructive" 
    : "bg-primary/10 text-primary border-primary/20";
  
  return (
    <div className={`p-4 rounded-md mb-4 border ${variantClasses}`}>
      {children}
    </div>
  );
}

export default function AnomaliesReport() {
  const [currentTime, setCurrentTime] = useState(new Date())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportData, setReportData] = useState<ApiReportData>({
    anomalias: [],
    ubicacion: "Centro de Datos - Zona B",
    total_criticas: 0,
    total_advertencias: 0,
    total_informativas: 0,
    hora_pico: "14:00"
  })
  
  // CSS Variables para el Dashboard de Anomalías
  const dashboardStyles = `
    /* Variables de color globales - Tema oscuro por defecto */
    .dashboard {
      --primary-bg: #2a2a2a;
      --secondary-bg: #3a3a3a;
      --card-bg: #444;
      --text-color: #fff;
      --border-color: #555;
      --critical-color: #2ecc71;
      --warning-color: #f1c40f;
      --info-color: #3498db;
      --table-header-bg: #777;
      --table-row-bg: rgba(200, 200, 255, 0.1);
      --title-bg: #333;
      --empty-row-bg: #3c3c47;
      --humidity-color: #8884d8;
      background-color: var(--primary-bg);
      color: var(--text-color);
    }
    
    /* Sobreescritura para tema claro */
    html.light .dashboard {
      --primary-bg: #f5f5f5;
      --secondary-bg: #e5e5e5;
      --card-bg: #fff;
      --text-color: #333;
      --border-color: #ddd;
      --title-bg: #d4d4d4;
      --empty-row-bg: #e2e2ea;
      --table-header-bg: #a0a0a0;
      --table-row-bg: rgba(100, 100, 200, 0.05);
      --humidity-color: #6864c8;
    }
    
    /* Estilos específicos para componentes */
    .dashboard .info-card,
    .dashboard .charts-card, 
    .dashboard .summary-card, 
    .dashboard .alerts-card {
      background-color: var(--secondary-bg);
      color: var(--text-color);
    }
    
    .dashboard .section-title {
      background-color: var(--title-bg);
      color: var(--text-color);
    }
    
    .dashboard .data-table th {
      background-color: var(--table-header-bg);
      color: white;
      border: 1px solid var(--border-color);
    }
    
    .dashboard .data-table td {
      border: 1px solid var(--border-color);
      background-color: var(--table-row-bg);
    }
    
    .dashboard .empty-row {
      background-color: var(--empty-row-bg);
      color: var(--text-color);
      border: none;
    }
  `;
  
  // Actualizar la hora cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  // Obtener datos para el reporte
  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true)
      setError(null)
      
      try {
        // Intenta obtener datos del mismo endpoint de la API
        // En un caso real, probablemente usarías un endpoint específico para anomalías
        const response = await fetch('http://3.226.1.115:8029/datos', {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          },
          mode: 'cors',
          cache: 'no-cache',
          signal: AbortSignal.timeout(10000)
        })
        
        if (!response.ok) {
          throw new Error(`Error en la conexión: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (!data || data.length === 0) {
          throw new Error("No se recibieron datos de la API")
        }
        
        console.log("Datos recibidos para el reporte:", data)
        
        // Analizar los datos y detectar anomalías
        // En un sistema real, las anomalías vendrían directamente de la API
        // Aquí las generamos a partir de los datos de sensores
        const anomalies = processAnomalies(data)
        
        setReportData({
          anomalias: anomalies,
          ubicacion: "Centro de Datos - Zona B",
          total_criticas: anomalies.filter(a => a.tipo === 'critica').length,
          total_advertencias: anomalies.filter(a => a.tipo === 'advertencia').length,
          total_informativas: anomalies.filter(a => a.tipo === 'informativa').length,
          hora_pico: "14:00" // Esto normalmente vendría de un análisis de datos
        })
        
      } catch (err) {
        console.error('Error al obtener datos para el reporte:', err)
        let errorMsg = 'Sin Conexión. '
        
        if (err instanceof TypeError && err.message.includes('fetch')) {
          errorMsg += 'API desconectada.'
        } else if (err instanceof DOMException && err.name === 'AbortError') {
          errorMsg += 'Tiempo de espera agotado. La API no respondió a tiempo.'
        } else {
          errorMsg += `Error: ${err instanceof Error ? err.message : 'Desconocido'}`
        }
        
        setError(errorMsg)
        
        // Reset data instead of using example data
        setReportData({
          anomalias: [],
          ubicacion: "Sin Conexión",
          total_criticas: 0,
          total_advertencias: 0,
          total_informativas: 0,
          hora_pico: "--:--"
        })
      } finally {
        setLoading(false)
      }
    }
    
    fetchReportData()
  }, [])
  
  // Función para procesar datos y detectar anomalías (simplificado para este ejemplo)
  const processAnomalies = (data: ApiSensorData[]): SensorAnomaly[] => {
    const anomalies: SensorAnomaly[] = []
    
    // Verificar los últimos N datos para detectar anomalías
    const recentData = data.slice(-24) // Últimas 24 entradas
    
    recentData.forEach((item, index) => {
      const { temperatura, humedad, luminosidad, humedad_suelo, fecha } = item
      
      // Ejemplo de detección de anomalías (muy simplificado)
      // En un sistema real, esto sería mucho más sofisticado
      
      // Temperatura alta (>30°C)
      if (temperatura && temperatura > 30) {
        anomalies.push({
          fecha,
          sensor: "Temp-ZB-01",
          descripcion: `Temperatura elevada (${temperatura}°C)`,
          nivel_riesgo: temperatura > 35 ? "Alto" : "Medio-Alto",
          tipo: temperatura > 35 ? 'critica' : 'advertencia'
        })
      }
      
      // Humedad extrema (<20% o >80%)
      if (humedad && (humedad < 20 || humedad > 80)) {
        anomalies.push({
          fecha,
          sensor: "Hum-ZB-02",
          descripcion: humedad < 20 
            ? `Humedad baja (${humedad}%)` 
            : `Humedad excesiva (${humedad}%)`,
          nivel_riesgo: humedad < 10 || humedad > 90 ? "Alto" : "Medio",
          tipo: humedad < 10 || humedad > 90 ? 'critica' : 'advertencia'
        })
      }
      
      // Luminosidad baja durante el día (<100 lux, podría ser un fallo del sensor)
      const hour = new Date(fecha).getHours()
      if (luminosidad !== null && hour >= 9 && hour <= 17 && luminosidad < 100) {
        anomalies.push({
          fecha,
          sensor: "Lum-ZB-01",
          descripcion: `Luminosidad baja durante el día (${luminosidad} lux)`,
          nivel_riesgo: luminosidad < 50 ? "Medio" : "Bajo",
          tipo: luminosidad < 50 ? 'advertencia' : 'informativa'
        })
      }
      
      // Humedad del suelo (si está disponible)
      if (humedad_suelo !== null) {
        if (humedad_suelo < 20) {
          anomalies.push({
            fecha,
            sensor: "HS-ZB-01",
            descripcion: `Suelo seco (${humedad_suelo}%)`,
            nivel_riesgo: humedad_suelo < 10 ? "Alto" : "Medio",
            tipo: humedad_suelo < 10 ? 'critica' : 'advertencia'
          })
        } else if (humedad_suelo > 90) {
          anomalies.push({
            fecha,
            sensor: "HS-ZB-01",
            descripcion: `Suelo saturado (${humedad_suelo}%)`,
            nivel_riesgo: humedad_suelo > 95 ? "Alto" : "Medio",
            tipo: humedad_suelo > 95 ? 'critica' : 'advertencia'
          })
        }
      }
      
      // Detectar cambios bruscos comparando con datos anteriores
      if (index > 0) {
        const prevItem = recentData[index - 1]
        
        // Cambio brusco de temperatura
        if (temperatura && prevItem.temperatura && 
            Math.abs(temperatura - prevItem.temperatura) > 5) {
          anomalies.push({
            fecha,
            sensor: "Temp-ZB-02",
            descripcion: `Cambio brusco de temperatura (∆${(temperatura - prevItem.temperatura).toFixed(1)}°C)`,
            nivel_riesgo: "Medio",
            tipo: 'advertencia'
          })
        }
        
        // Cambio brusco de humedad
        if (humedad && prevItem.humedad && 
            Math.abs(humedad - prevItem.humedad) > 15) {
          anomalies.push({
            fecha,
            sensor: "Hum-ZB-03",
            descripcion: `Variación de humedad ∆${(humedad - prevItem.humedad).toFixed(1)}%`,
            nivel_riesgo: "Medio-Bajo",
            tipo: 'informativa'
          })
        }
      }
    })
    
    // Ordenar por fecha (más reciente primero)
    return anomalies.sort((a, b) => 
      new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
    )
  }
  
  // Formatear la hora como HH:MM:SS
  const formattedTime = currentTime.toLocaleTimeString('es', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  
  // Formatear la fecha como DD/MM/YYYY
  const formattedDate = currentTime.toLocaleDateString('es', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
  
  // Formatear una fecha de API a formato legible
  const formatDateFromAPI = (dateString: string) => {
    try {
      // Validar si la fecha es válida antes de procesarla
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) {
        return "Fecha inválida";
      }
      
      const date = new Date(timestamp);
      return date.toLocaleString('es', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "Fecha inválida";
    }
  };

  // Formatear solo la hora de una fecha
  const formatTimeFromDate = (dateString: string) => {
    try {
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) {
        return "00:00";
      }
      
      const date = new Date(timestamp);
      return date.toLocaleTimeString('es', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return "00:00";
    }
  };

  // Formatear solo la fecha (día/mes) de una fecha
  const formatShortDateFromDate = (dateString: string) => {
    try {
      const timestamp = Date.parse(dateString);
      if (isNaN(timestamp)) {
        return "Fecha";
      }
      
      const date = new Date(timestamp);
      return date.toLocaleDateString('es', {
        day: '2-digit', 
        month: 'short'
      });
    } catch {
      return "Fecha";
    }
  };
  
  // Obtener anomalías críticas y advertencias
  const criticalAnomalies = reportData.anomalias.filter(a => a.tipo === 'critica')
  
  // Datos de ejemplo fijos para los gráficos (independientes de la API)
  const temperatureTimeData = [
    { fecha: "02:00", valor: 38 },
    { fecha: "06:00", valor: 36 },
    { fecha: "10:00", valor: 37 },
    { fecha: "14:00", valor: 39 },
    { fecha: "18:00", valor: 38 },
    { fecha: "22:00", valor: 37 }
  ];
  
  const temperatureDateData = [
    { fecha: "01/ene", valor: 38 },
    { fecha: "10/ene", valor: 39 },
    { fecha: "20/ene", valor: 37 },
    { fecha: "01/feb", valor: 38 },
    { fecha: "10/feb", valor: 40 }
  ];
  
  const humidityPressureData = [
    { fecha: "02:00", humedad: 60, presion: 1010 },
    { fecha: "06:00", humedad: 85, presion: 1005 },
    { fecha: "10:00", humedad: 75, presion: 1000 },
    { fecha: "14:00", humedad: 50, presion: 1008 },
    { fecha: "18:00", humedad: 65, presion: 1012 }
  ];
  
  // Renderizado del componente
  return (
    <div className="dashboard" style={{
      display: "grid",
      gridTemplateColumns: "450px 1fr",
      gridTemplateRows: "auto 1fr",
      gap: "10px",
      width: "100%",
      minHeight: "calc(100vh - 80px)",
      padding: "10px",
      backgroundColor: "var(--primary-bg)",
      color: "var(--text-color)"
    }}>
      <style dangerouslySetInnerHTML={{ __html: dashboardStyles }} />
      
      {loading && (
        <div style={{ gridColumn: "1 / span 2", gridRow: "1", marginBottom: "10px" }}>
          <div style={{ 
            padding: "12px", 
            backgroundColor: "var(--secondary-bg)",
            borderRadius: "4px",
            textAlign: "center"
          }}>
            Cargando datos del reporte...
          </div>
        </div>
      )}
      
      {error && (
        <div style={{ gridColumn: "1 / span 2", gridRow: "1" }}>
          <Alert variant="destructive">
            <div className="flex gap-2 items-start">
              <AlertCircle className="h-5 w-5 mt-0.5" />
              <div>
                <h5 className="font-bold mb-1">Error</h5>
                <div className="text-sm">{error}</div>
                <div className="text-sm mt-1">Verifique la conexión con la API y reintente.</div>
              </div>
            </div>
          </Alert>
        </div>
      )}
      
      {/* Info Card - Primera sección superior izquierda */}
      <div className="info-card" style={{
        gridColumn: "1",
        gridRow: "1",
        backgroundColor: "var(--secondary-bg)",
        borderRadius: "4px",
        padding: "15px",
        display: "grid",
        gridTemplateColumns: "1fr",
        gap: "5px"
      }}>
        <div className="info-item" style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", marginBottom: "5px" }}>
          <div className="label">Fecha:</div>
          <div id="fecha">{formattedDate}</div>
        </div>
        <div className="info-item" style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", marginBottom: "5px" }}>
          <div className="label">Hora de Generación:</div>
          <div id="hora">{formattedTime}</div>
        </div>
        <div className="info-item" style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", marginBottom: "5px" }}>
          <div className="label">Ubicación:</div>
          <div id="ubicacion">{reportData.ubicacion}</div>
        </div>
        <div className="info-item" style={{ display: "grid", gridTemplateColumns: "130px 1fr", alignItems: "center", marginBottom: "5px" }}>
          <div className="label">Generado por:</div>
          <div id="generado-por">Sistema AutoMonitor v2.5</div>
        </div>
      </div>

      {/* Charts Card - Sección inferior izquierda */}
      <div className="charts-card" style={{
        gridColumn: "1",
        gridRow: "2",
        backgroundColor: "var(--secondary-bg)",
        borderRadius: "4px",
        padding: "15px",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        <div className="chart-container temp-vs-time" style={{ width: "100%", height: "150px", marginBottom: "15px" }}>
          {!error && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={criticalAnomalies.length > 3 
                  ? criticalAnomalies.slice(0, 10).map(a => ({
                      fecha: formatTimeFromDate(a.fecha),
                      valor: a.descripcion.match(/\d+/) ? parseInt(a.descripcion.match(/\d+/)?.[0] || "30") : 30
                    })) 
                  : temperatureTimeData}
                margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fill: 'var(--text-color)' }} 
                />
                <YAxis 
                  tick={{ fill: 'var(--text-color)' }} 
                  domain={[0, 50]} 
                  tickCount={6}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'none', color: 'var(--text-color)' }} 
                  formatter={(value) => [`${value} °C`, 'Temperatura']}
                />
                <Line type="monotone" dataKey="valor" stroke="var(--critical-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Sensor Temperatura" />
                <text x="50%" y="10" textAnchor="middle" fill="var(--text-color)" fontSize="12">
                  Sensor de Temperatura - Hoy {new Date().toLocaleDateString('es')}
                </text>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="chart-container temp-vs-date" style={{ width: "100%", height: "150px", marginBottom: "15px" }}>
          {!error && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={reportData.anomalias.filter(a => a.sensor?.includes('Temp')).length > 3 
                  ? reportData.anomalias.filter(a => a.sensor?.includes('Temp')).slice(0, 10).map(a => ({
                      fecha: formatShortDateFromDate(a.fecha),
                      valor: a.descripcion.match(/\d+/) ? parseInt(a.descripcion.match(/\d+/)?.[0] || "25") : 25
                    })) 
                  : temperatureDateData}
                margin={{ top: 15, right: 10, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fill: 'var(--text-color)' }} 
                />
                <YAxis 
                  tick={{ fill: 'var(--text-color)' }} 
                  domain={[0, 50]} 
                  tickCount={6}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'none', color: 'var(--text-color)' }} 
                  formatter={(value) => [`${value} °C`, 'Temperatura']}
                />
                <Line type="monotone" dataKey="valor" stroke="var(--warning-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Sensor Temperatura" />
                <text x="50%" y="10" textAnchor="middle" fill="var(--text-color)" fontSize="12">
                  Histórico Temperatura - Enero-Febrero 2025
                </text>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
        
        <div className="chart-container pressure-humidity" style={{ width: "100%", height: "150px" }}>
          {!error && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={reportData.anomalias.filter(a => a.sensor?.includes('Hum')).length > 3 
                  ? reportData.anomalias.filter(a => a.sensor?.includes('Hum')).slice(0, 10).map(a => ({
                      fecha: formatTimeFromDate(a.fecha),
                      humedad: a.descripcion.match(/\d+/) ? parseInt(a.descripcion.match(/\d+/)?.[0] || "60") : 60,
                      presion: Math.floor(Math.random() * 20) + 980
                    })) 
                  : humidityPressureData}
                margin={{ top: 15, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" />
                <XAxis 
                  dataKey="fecha" 
                  tick={{ fill: 'var(--text-color)' }} 
                />
                <YAxis 
                  yAxisId="left" 
                  tick={{ fill: 'var(--text-color)' }} 
                  domain={[0, 100]}
                  tickCount={6}
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right" 
                  domain={[960, 1040]} 
                  tick={{ fill: 'var(--text-color)' }} 
                  tickCount={5}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--card-bg)', border: 'none', color: 'var(--text-color)' }} 
                  formatter={(value, name) => {
                    if (name === 'humedad') return [`${value}%`, 'Humedad'];
                    if (name === 'presion') return [`${value} hPa`, 'Presión'];
                    return [value, name];
                  }}
                />
                <Line yAxisId="left" type="monotone" dataKey="humedad" stroke="var(--humidity-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="humedad" />
                <Line yAxisId="right" type="monotone" dataKey="presion" stroke="var(--info-color)" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} name="presion" />
                <text x="50%" y="10" textAnchor="middle" fill="var(--text-color)" fontSize="12">
                  Sensores Humedad/Presión - Hoy {new Date().toLocaleDateString('es')}
                </text>
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Summary and Alerts - Posición exacta a la derecha */}
      <div className="summary-alerts-container" style={{
        gridColumn: "2",
        gridRow: "1 / span 2",
        display: "flex",
        flexDirection: "column",
        gap: "10px"
      }}>
        {/* Summary Card - Sección superior derecha */}
        <div className="summary-card" style={{
          backgroundColor: "var(--secondary-bg)",
          borderRadius: "4px",
          padding: "15px"
        }}>
          <div className="summary-text" style={{ lineHeight: "1.5", textAlign: "justify", margin: "10px 0" }}>
            Se han detectado un total de <span id="total-anomalias">{reportData.total_criticas + reportData.total_advertencias + reportData.total_informativas}</span> anomalías en las últimas <span id="horas-monitoreo">24</span> horas. De estas:
          </div>

          <div className="alert-summary" style={{ display: "flex", flexDirection: "column", gap: "5px", margin: "15px 0" }}>
            <div className="alert-item" style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <span className="alert-icon critical" style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "10px", borderRadius: "2px", backgroundColor: "var(--critical-color)" }}></span>
              <span><span id="num-criticas">{reportData.total_criticas}</span> son alertas críticas (requieren atención inmediata).</span>
            </div>
            <div className="alert-item" style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <span className="alert-icon warning" style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "10px", borderRadius: "2px", backgroundColor: "var(--warning-color)" }}></span>
              <span><span id="num-advertencias">{reportData.total_advertencias}</span> son advertencias (posible riesgo, monitoreo recomendado).</span>
            </div>
            <div className="alert-item" style={{ display: "flex", alignItems: "center", marginBottom: "5px" }}>
              <span className="alert-icon info" style={{ display: "inline-block", width: "16px", height: "16px", marginRight: "10px", borderRadius: "2px", backgroundColor: "var(--info-color)" }}></span>
              <span><span id="num-info">{reportData.total_informativas}</span> son notificaciones informativas (sin acción requerida).</span>
            </div>
          </div>

          <div className="summary-text" style={{ lineHeight: "1.5", textAlign: "justify", margin: "10px 0" }}>
            En las últimas <span id="periodo-deteccion">24</span> horas, se detectaron <span id="num-anomalias">{reportData.total_criticas + reportData.total_advertencias + reportData.total_informativas}</span> anomalías en <span id="localizacion">{reportData.ubicacion}</span>, según el Sistema de Monitoreo de Anomalías. De estas, <span id="num-criticas2">{reportData.total_criticas}</span> fueron clasificadas como alertas críticas que requieren atención inmediata, <span id="num-advertencias2">{reportData.total_advertencias}</span> como advertencias que indican un posible riesgo y sugieren monitoreo adicional, y <span id="num-info2">{reportData.total_informativas}</span> como una notificación informativa que no requiere acción. Las alertas críticas incluyen eventos como temperaturas elevadas, presión inestable, humedad excesiva y vibración anormal, mientras que las advertencias se relacionan con presiones cercanas a los límites y variaciones menores de humedad. Los gráficos adjuntos muestran el comportamiento de la temperatura con un pico crítico registrado a las <span id="hora-pico">{reportData.hora_pico}</span>, así como un análisis comparativo de la humedad relativa y la presión frente a los límites establecidos.
          </div>
        </div>

        {/* Alerts Card - Sección inferior derecha */}
        <div className="alerts-card" style={{
          backgroundColor: "var(--secondary-bg)",
          borderRadius: "4px",
          padding: "15px",
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: "20px"
        }}>
          <div>
            <h2 className="section-title" style={{ 
              fontSize: "16px", 
              fontWeight: "normal", 
              marginBottom: "10px", 
              textAlign: "center",
              backgroundColor: "var(--title-bg)",
              padding: "8px",
              color: "var(--text-color)"
            }}>Detalle de Alertas Críticas</h2>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "5px" }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Fecha</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Sensor</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Anomalía detectada</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Nivel de riesgo</th>
                </tr>
              </thead>
              <tbody id="alertas-criticas-body">
                {reportData.anomalias
                  .filter(a => a.tipo === 'critica')
                  .slice(0, 5)
                  .map((anomaly, index) => (
                    <tr key={`critica-${index}`}>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{formatDateFromAPI(anomaly.fecha)}</td>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{anomaly.sensor}</td>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{anomaly.descripcion}</td>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{anomaly.nivel_riesgo}</td>
                    </tr>
                  ))}
                {reportData.anomalias.filter(a => a.tipo === 'critica').length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-row" style={{ 
                      padding: "8px", 
                      textAlign: "center", 
                      border: "none",
                      backgroundColor: "var(--empty-row-bg)",
                      color: "var(--text-color)"
                    }}>
                      No hay alertas críticas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="section-title" style={{ 
              fontSize: "16px", 
              fontWeight: "normal", 
              marginBottom: "10px", 
              textAlign: "center",
              backgroundColor: "var(--title-bg)",
              padding: "8px",
              color: "var(--text-color)"
            }}>Detalle de Advertencias</h2>
            <table className="data-table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "5px" }}>
              <thead>
                <tr>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Fecha</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Sensor</th>
                  <th style={{ backgroundColor: "var(--table-header-bg)", color: "white", padding: "8px", textAlign: "center", fontWeight: "normal", border: "1px solid var(--border-color)" }}>Descripción</th>
                </tr>
              </thead>
              <tbody id="advertencias-body">
                {reportData.anomalias
                  .filter(a => a.tipo === 'advertencia')
                  .slice(0, 4)
                  .map((anomaly, index) => (
                    <tr key={`advertencia-${index}`}>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{formatDateFromAPI(anomaly.fecha)}</td>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{anomaly.sensor}</td>
                      <td style={{ padding: "8px", textAlign: "center", border: "1px solid var(--border-color)", backgroundColor: "var(--table-row-bg)" }}>{anomaly.descripcion}</td>
                    </tr>
                  ))}
                {reportData.anomalias.filter(a => a.tipo === 'advertencia').length === 0 && (
                  <tr>
                    <td colSpan={3} className="empty-row" style={{ 
                      padding: "8px", 
                      textAlign: "center", 
                      border: "none",
                      backgroundColor: "var(--empty-row-bg)",
                      color: "var(--text-color)"
                    }}>
                      No hay advertencias
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 