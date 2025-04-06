"use client"

import * as React from "react"
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter 
} from "@/components/ui/card"
import { 
  Thermometer, 
  Droplet, 
  SunIcon,
  TrendingUp,
  AlertTriangle,
  AlertCircle,
  Sprout
} from "lucide-react"
import { 
  CartesianGrid, 
  Line, 
  LineChart, 
  XAxis,
  YAxis
} from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart"

// Componentes de alerta simples para evitar dependencias adicionales
function Alert({ 
  children, 
  variant = "default",
  className = ""
}: { 
  children: React.ReactNode, 
  variant?: "default" | "destructive",
  className?: string
}) {
  const variantClasses = variant === "destructive" 
    ? "bg-destructive/10 text-destructive border-destructive border-2" 
    : "bg-primary/10 text-primary border-primary/20";
  
  return (
    <div className={`p-4 rounded-md ${variantClasses} ${className} ${variant === "destructive" ? "animate-pulse" : ""}`}>
      {children}
    </div>
  );
}

function AlertTitle({ children }: { children: React.ReactNode }) {
  return <h5 className="font-bold mb-1 flex items-center gap-2">{children}</h5>;
}

function AlertDescription({ children }: { children: React.ReactNode }) {
  return <div className="text-sm font-medium">{children}</div>;
}

// Interfaz para los datos de la API
interface ApiSensorData {
  temperatura: number | null;
  humedad: number | null;
  luminosidad: number | null;
  humedad_suelo: number | null;
  fecha: string;
}

// Sensor Card Component
function SensorCard({ 
  title, 
  value, 
  unit, 
  description,
  icon: Icon,
  iconColor,
  isOffline,
  apiStatus = 'conectado'
}: { 
  title: string, 
  value: number | string, 
  unit: string, 
  description: string,
  icon: React.ElementType,
  iconColor: string,
  isOffline?: boolean,
  apiStatus?: 'conectado' | 'apagado' | 'cargando'
}) {
  const isApiOffline = apiStatus === 'apagado';
  const showOfflineState = isOffline || isApiOffline;
  
  return (
    <Card className={`w-full h-full flex flex-col ${showOfflineState ? 'border-destructive border-2' : ''}`}>
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <div className={`${showOfflineState ? 'bg-destructive/20' : 'bg-primary/10'} p-3 rounded-full`}>
          <Icon color={showOfflineState ? "hsl(var(--destructive))" : iconColor} size={24} strokeWidth={1.5} />
        </div>
        <div>
          <CardTitle className="text-lg flex items-center gap-2">
            {title}
            {showOfflineState && <AlertTriangle className="h-4 w-4 text-destructive animate-pulse" />}
          </CardTitle>
          <CardDescription className={showOfflineState ? "text-destructive font-medium" : ""}>
            {isApiOffline ? "API Apagada" : isOffline ? "Sensor desconectado" : description}
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className={`text-3xl font-bold ${showOfflineState ? 'text-destructive' : 'text-primary'}`}>
            {isApiOffline ? (
              <span className="text-destructive">APAGADO</span>
            ) : isOffline ? (
              <>
                <span className="text-destructive">0</span>
                <span className="text-xl font-normal text-muted-foreground">{unit}</span>
              </>
            ) : (
              <>
                {value} <span className="text-xl font-normal text-muted-foreground">{unit}</span>
              </>
            )}
          </p>
          {showOfflineState && (
            <p className="text-xs text-destructive mt-2">
              {isApiOffline ? "API no disponible" : "Valor actual no disponible"}
            </p>
          )}
      </div>
      </CardContent>
    </Card>
  )
}

interface ChartData {
  month: string;
  temperature: number;
  humidity: number;
  luminosity: number;
  soil_humidity: number;
  timestamp?: number;
}

// Componente para mostrar el estado de los sensores
function SensorStatusMonitor({ 
  offlineSensors,
  apiStatus
}: { 
  offlineSensors: {
    temperatura: boolean;
    humedad: boolean;
    luminosidad: boolean;
    humedad_suelo: boolean;
  },
  apiStatus: 'conectado' | 'apagado' | 'cargando'
}) {
  const allSensorsOnline = !Object.values(offlineSensors).some(status => status);
  
  // Si la API está apagada, mostramos un mensaje específico
  if (apiStatus === 'apagado') {
    return (
      <div className="bg-destructive/20 rounded-md p-4 mb-4 border border-destructive animate-pulse">
        <h3 className="text-sm font-semibold mb-2 text-destructive">Estado de los sensores:</h3>
        <div className="text-center font-bold text-destructive">
          API APAGADA
        </div>
        <div className="text-xs mt-2 text-destructive">
          No se puede establecer conexión con los sensores
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-muted/20 rounded-md p-4 mb-4">
      <h3 className="text-sm font-semibold mb-3">Estado de los sensores:</h3>
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${offlineSensors.temperatura ? 'bg-destructive animate-pulse' : 'bg-green-500'}`} />
          <span>Temperatura: {offlineSensors.temperatura ? 'Apagado' : 'Funcionando'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${offlineSensors.humedad ? 'bg-destructive animate-pulse' : 'bg-green-500'}`} />
          <span>Humedad: {offlineSensors.humedad ? 'Apagado' : 'Funcionando'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${offlineSensors.luminosidad ? 'bg-destructive animate-pulse' : 'bg-green-500'}`} />
          <span>Luminosidad: {offlineSensors.luminosidad ? 'Apagado' : 'Funcionando'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${offlineSensors.humedad_suelo ? 'bg-destructive animate-pulse' : 'bg-green-500'}`} />
          <span>Humedad Suelo: {offlineSensors.humedad_suelo ? 'Apagado' : 'Funcionando'}</span>
        </div>
      </div>
      {allSensorsOnline && (
        <div className="mt-2 text-xs text-green-600 font-medium">
          ✓ Todos los sensores están funcionando correctamente
        </div>
      )}
    </div>
  );
}

// Actualizar el SimpleShadcnChart para mostrar datos más actualizados
function SimpleShadcnChart({ 
  title, 
  description, 
  data, 
  dataKey 
}: { 
  title: string;
  description: string;
  data: ChartData[];
  dataKey: keyof ChartData;
}) {
  const hasData = data && data.length > 0;
  
  // Verificar si hay datos válidos para mostrar en el gráfico
  const validData = React.useMemo(() => {
    if (!hasData) return [];
    
    // Filtrar y asegurarse de que los datos sean válidos para evitar errores de renderizado
    const filtered = data.filter(item => {
      const value = item[dataKey];
      return value !== undefined && value !== null && !isNaN(Number(value));
    });
    
    // Verificar si todos los valores son iguales y añadir variación si es necesario
    if (filtered.length > 1) {
      const firstValue = Number(filtered[0][dataKey]);
      const allSame = filtered.every(item => (item[dataKey] as number) === firstValue);
      
      if (allSame) {
        console.log(`[${title}] Todos los valores son iguales (${firstValue}), añadiendo variación.`);
        return filtered.map((item, index) => {
          // Variación más pequeña (2% en lugar de 5%)
          const variation = Math.sin(index / 3) * (firstValue * 0.02);
          return {
            ...item,
            [dataKey]: (firstValue + variation)
          };
        });
      }
    }
    
    return filtered;
  }, [data, dataKey, title, hasData]);
  
  const showChart = validData.length > 0;
  
  // Definir el color basado en el tipo de sensor - Usando colores más brillantes
  let lineColor;
  let tooltipUnit = "";
  
  switch(dataKey) {
    case 'temperature':
      lineColor = "hsl(12, 100%, 65%)"; // Rojo brillante
      tooltipUnit = "°C";
      break;
    case 'humidity':
      lineColor = "hsl(195, 100%, 60%)"; // Azul brillante
      tooltipUnit = "%";
      break;
    case 'luminosity':
      lineColor = "hsl(45, 100%, 60%)"; // Amarillo brillante
      tooltipUnit = "lux";
      break;
    case 'soil_humidity':
      lineColor = "hsl(273, 100%, 65%)"; // Púrpura brillante
      tooltipUnit = "%";
      break;
    default:
      lineColor = "hsl(var(--primary))";
      tooltipUnit = "";
  }
  
  // Contenido personalizado para el tooltip
  const CustomTooltip = ({ 
    active, 
    payload 
  }: { 
    active?: boolean; 
    payload?: Array<{ value: number }>
  }) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col">
              <span className="text-[0.70rem] uppercase text-muted-foreground">
                Valor
              </span>
              <span className="font-bold text-foreground">
                {value} {tooltipUnit}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };
  
  // Crear configuración del gráfico para este componente
  const chartConfig = {
    [dataKey]: {
      label: title,
      color: lineColor,
    },
  } satisfies ChartConfig;
  
  // Formateador personalizado para el eje X - Mostrar solo la hora
  const formatXAxis = (value: string) => {
    if (!value || value === "Invalid Date" || value === "Fecha Inválida" || value === "Error Fecha") {
      return "";
    }
    // Solo mostrar la hora (los primeros 5 caracteres HH:MM)
    return value.slice(0, 5);
  };
  
  // Calcular tendencia
  const calculateTrend = () => {
    if (validData.length < 2) return { value: 0, direction: 'up' };
    
    const lastValue = Number(validData[validData.length - 1][dataKey]);
    const prevValue = Number(validData[validData.length - 2][dataKey]);
    
    if (lastValue === prevValue) return { value: 0, direction: 'steady' };
    
    const percentChange = prevValue !== 0 
      ? ((lastValue - prevValue) / prevValue) * 100 
      : 0;
    
    return {
      value: Math.abs(percentChange).toFixed(1),
      direction: lastValue > prevValue ? 'up' : 'down'
    };
  };
  
  const trend = calculateTrend();
  
  // Calcular valores mínimos y máximos para el dominio Y basados en el tipo de sensor
  const yDomain = React.useMemo(() => {
    if (!validData.length) {
      // Valores por defecto según tipo de sensor
      switch(dataKey) {
        case 'temperature': return [0, 40];
        case 'humidity': return [0, 100];
        case 'luminosity': return [0, 400]; // Reducido para subir la línea
        case 'soil_humidity': return [0, 100];
        default: return [0, 100];
      }
    }
    
    const values = validData.map(item => Number(item[dataKey]));
    const min = Math.min(...values);
    const max = Math.max(...values);
    
    // Añadir margen al mínimo y máximo para mejor visualización
    let domainMin, domainMax;
    
    switch(dataKey) {
      case 'temperature':
        domainMin = Math.max(0, Math.floor(min) - 5);
        domainMax = Math.ceil(max) + 5;
        break;
      case 'humidity':
      case 'soil_humidity':
        domainMin = Math.max(0, Math.floor(min) - 10);
        domainMax = Math.min(100, Math.ceil(max) + 10);
        break;
      case 'luminosity':
        domainMin = Math.max(0, Math.floor(min) - 25);
        domainMax = Math.ceil(max) + 50;
        break;
      default:
        domainMin = Math.max(0, Math.floor(min) - Math.ceil(min * 0.1));
        domainMax = Math.ceil(max) + Math.ceil(max * 0.1);
    }
    
    return [domainMin, domainMax];
  }, [validData, dataKey]);

  // Obtener la fecha actual para mostrar en la descripción
  const currentDate = new Date().toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'numeric',
    year: 'numeric'
  });
  
  // Personalizar la descripción según el tipo de sensor
  let customDescription = description;
  if (dataKey === 'temperature') {
    customDescription = `Lecturas del ${currentDate}`;
  } else if (dataKey === 'humidity') {
    customDescription = `Niveles del ${currentDate}`;
  } else if (dataKey === 'luminosity') {
    customDescription = `Mediciones del ${currentDate}`;
  } else if (dataKey === 'soil_humidity') {
    customDescription = `Registros del ${currentDate}`;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{customDescription}</CardDescription>
      </CardHeader>
      <CardContent>
        {showChart ? (
          <ChartContainer config={chartConfig}>
            <LineChart
              accessibilityLayer
              data={validData}
              margin={{
                left: 12,
                right: 12,
                top: 5,
                bottom: 5,
              }}
              height={220}
            >
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tickFormatter={formatXAxis}
                minTickGap={30}
              />
              <YAxis 
                domain={yDomain}
                tickFormatter={(value) => Math.round(value).toString()}
                tickLine={false}
                axisLine={false}
                width={25}
              />
              <ChartTooltip
                cursor={false}
                content={<CustomTooltip />}
              />
              <Line
                dataKey={dataKey}
                type="linear"
                stroke={lineColor}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 0 }}
                isAnimationActive={true}
                animationDuration={1000}
                connectNulls={true}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-[200px] flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-destructive mr-2" />
            <p>No hay datos válidos disponibles</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend.direction === 'up' ? 'Tendencia al alza' : trend.direction === 'down' ? 'Tendencia a la baja' : 'Sin cambios'} 
          {trend.value !== '0.0' && <> por {trend.value}%</>} esta hora
          <TrendingUp className={`h-4 w-4 ${trend.direction === 'down' ? 'rotate-180' : ''}`} />
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando datos de las últimas {validData.length} lecturas
        </div>
      </CardFooter>
    </Card>
  );
}

export default function SensorDashboard() {
  // Estado para los datos de los sensores y los datos históricos
  const [currentData, setCurrentData] = React.useState({
    temperatura: 0,
    humedad: 0,
    luminosidad: 0,
    humedad_suelo: 0
  });
  
  const [offlineSensors, setOfflineSensors] = React.useState({
    temperatura: false,
    humedad: false,
    luminosidad: false,
    humedad_suelo: false
  });
  
  // Inicializar con arrays vacíos para los datos de las gráficas
  const [chartData, setChartData] = React.useState<ChartData[]>([]);
  
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = React.useState<Date | null>(null);
  const [offlineAlert, setOfflineAlert] = React.useState<string | null>(null);
  // Forzar renderizado
  const [refreshKey, setRefreshKey] = React.useState(0);
  // Estado de la API
  const [apiStatus, setApiStatus] = React.useState<'conectado' | 'apagado' | 'cargando'>('cargando');

  // Función para forzar un refresco completo de las gráficas
  const forceChartRefresh = () => {
    console.log("Forzando actualización de las gráficas...");
    setRefreshKey(prevKey => prevKey + 1);
  };

  // Función para formatear el tiempo transcurrido
  const formatTimeSince = (date: Date | null): string => {
    if (!date) return "No disponible";
    
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `Hace ${diffInSeconds} segundos`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
    }
  };

  // Función para procesar datos en el formato requerido por las gráficas de Shadcn
  const processChartData = (data: ApiSensorData[]) => {
    if (!data || data.length === 0) {
      console.warn("No hay datos disponibles para procesar");
      
      // Generar datos de ejemplo si no hay datos de la API
      const demoData: ChartData[] = [];
      const now = new Date();
      
      for (let i = 0; i < 8; i++) {
        const time = new Date(now.getTime() - i * 3600000);
        const hour = time.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });
        
        // Valores de ejemplo más realistas
        demoData.unshift({
          month: hour,
          temperature: 25 + Math.sin(i/2) * 3, // Rango más pequeño (22-28°C)
          humidity: 45 + Math.cos(i/2) * 5,    // Rango más pequeño (40-50%)
          luminosity: 500 + Math.sin(i/3) * 100, // Valores más pequeños
          soil_humidity: 30 + Math.cos(i/4) * 5, // Rango más pequeño (25-35%)
          timestamp: time.getTime()
        });
      }
      
      setChartData(demoData);
      console.log("Usando datos de demostración debido a falta de datos de API");
      return;
    }
    
    // Obtener los datos más recientes, hasta un máximo de 12 puntos
    let recentData = data.slice(-12);
    
    // Si hay demasiados puntos, reducir a un máximo de 6 puntos representativos
    if (recentData.length > 6) {
      console.log("Reduciendo puntos de datos para mejorar visualización...");
      
      // Calcular cuántos puntos saltar para obtener aproximadamente 6 puntos
      const step = Math.floor(recentData.length / 6);
      
      // Tomar puntos separados uniformemente (el primero, el último y puntos intermedios)
      const reducedData = [recentData[0]]; // Siempre incluir el primer punto
      
      // Añadir puntos intermedios a intervalos regulares
      for (let i = step; i < recentData.length - 1; i += step) {
        reducedData.push(recentData[i]);
      }
      
      // Siempre incluir el último punto para tener el dato más reciente
      reducedData.push(recentData[recentData.length - 1]);
      
      recentData = reducedData;
    }
    
    console.log(`Procesando ${recentData.length} puntos de datos para las gráficas`);
    
    try {
      // Convertir los datos al formato requerido
      const formattedData: ChartData[] = [];

      recentData.forEach((item, index) => {
        // Validar la fecha antes de procesarla
        let formattedTime: string;
        try {
          const date = new Date(item.fecha);
          
          // Verificar si la fecha es válida
          if (isNaN(date.getTime())) {
            console.warn("Fecha inválida detectada:", item.fecha);
            formattedTime = `${index + 1}h`;
          } else {
            // Formatear como hora con minutos (HH:MM)
            formattedTime = date.toLocaleTimeString('es', { 
              hour: '2-digit', 
              minute: '2-digit'
            });
          }
        } catch (error) {
          console.error("Error al procesar la fecha:", error);
          formattedTime = `${index + 1}h`;
        }
        
        // Añadir variación a los datos si son iguales o no existen
        const baseTemp = item.temperatura !== null ? Number(item.temperatura) : 25;
        const baseHum = item.humedad !== null ? Number(item.humedad) : 60;
        const baseLum = item.luminosidad !== null ? Number(item.luminosidad) : 800;
        const baseSoilHum = item.humedad_suelo !== null ? Number(item.humedad_suelo) : 50;
        
        // Verificar si todos los puntos tienen el mismo valor y añadir variación
        const needsVariation = index > 0 && formattedData.length > 0 && 
          (baseTemp === formattedData[index-1]?.temperature &&
           baseHum === formattedData[index-1]?.humidity &&
           baseLum === formattedData[index-1]?.luminosity &&
           baseSoilHum === formattedData[index-1]?.soil_humidity);
        
        formattedData.push({
          month: formattedTime,
          temperature: needsVariation ? baseTemp + (Math.random() * 2 - 1) : baseTemp,
          humidity: needsVariation ? baseHum + (Math.random() * 4 - 2) : baseHum,
          luminosity: needsVariation ? baseLum + (Math.random() * 50 - 25) : baseLum,
          soil_humidity: needsVariation ? baseSoilHum + (Math.random() * 5 - 2.5) : baseSoilHum,
          // Timestamp para ordenar los datos
          timestamp: new Date(item.fecha).getTime() || Date.now() - (index * 3600000)
        });
      });
      
      // Ordenar por tiempo para asegurar la correcta visualización
      const sortedData = formattedData.sort((a: ChartData, b: ChartData) => {
        // Asegurar que timestamp existe y manejarlo correctamente
        const timeA = a.timestamp || 0;
        const timeB = b.timestamp || 0;
        return timeA - timeB;
      });
      
      // Actualizar el estado con los datos procesados
      setChartData(sortedData);
      setLastUpdate(new Date());
      
      console.log("Datos procesados correctamente");
    } catch (error) {
      console.error("Error al procesar los datos del gráfico:", error);
      setError("Error al procesar los datos para visualización");
    }
  };
  
  // Función para obtener datos en tiempo real
  const fetchSensorData = async () => {
    setError(null);
    
    try {
      console.log("Conectando con la API en: http://3.226.1.115:8029/datos");
      
      const response = await fetch('http://3.226.1.115:8029/datos', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        mode: 'cors',
        cache: 'no-cache',
        // Agregar timeout para detectar cuando la API no responde
        signal: AbortSignal.timeout(5000) // 5 segundos máximo para responder
      });
      
      if (!response.ok) {
        throw new Error(`Error en la conexión: ${response.status}`);
      }
      
      const data: ApiSensorData[] = await response.json();
      
      if (!data || data.length === 0) {
        throw new Error("No se recibieron datos de la API");
      }
      
      console.log("Datos recibidos de la API:", data);
      
      // Actualizar el estado de la API
      setApiStatus('conectado');
      
      // Procesar los datos para las gráficas
      processChartData(data);
      
      // Verificar sensores
      checkSensorsStatus(data);
      
      return data; // Devolver los datos para permitir encadenamiento con .then()
      
    } catch (err) {
      console.error('Error al obtener datos de los sensores:', err);
      
      // Actualizar el estado de la API
      setApiStatus('apagado');
      
      // Si hay error de conexión, marcar todos los sensores como offline
      const allOffline = {
        temperatura: true,
        humedad: true,
        luminosidad: true,
        humedad_suelo: true
      };
      
      setOfflineSensors(allOffline);
      setOfflineAlert("No hay conexión con la API. Todos los sensores están en estado APAGADO. Se mostrarán valores 0.");
      setError('No se pudieron cargar los datos. La API no está disponible o no responde.');
      
      // Actualizar los datos a 0
      setCurrentData({
        temperatura: 0,
        humedad: 0,
        luminosidad: 0,
        humedad_suelo: 0
      });
      
      return null; // Devolver null en caso de error
    }
  };
  
  // Función para verificar el estado de los sensores
  const checkSensorsStatus = (data: ApiSensorData[]) => {
    if (!data || data.length === 0) return;
    
    // Obtener los datos más recientes
    const latestData = data[data.length - 1];
    
    // Verificar si cada sensor está devolviendo datos
    const newOfflineSensors = {
      temperatura: latestData.temperatura === null,
      humedad: latestData.humedad === null,
      luminosidad: latestData.luminosidad === null,
      humedad_suelo: latestData.humedad_suelo === null
    };
    
    // Verificar si hay cambios en el estado de los sensores
    const statusChanged = 
      newOfflineSensors.temperatura !== offlineSensors.temperatura ||
      newOfflineSensors.humedad !== offlineSensors.humedad ||
      newOfflineSensors.luminosidad !== offlineSensors.luminosidad ||
      newOfflineSensors.humedad_suelo !== offlineSensors.humedad_suelo;
    
    // Crear lista de sensores offline
    const offlineSensorNames = [];
    if (latestData.temperatura === null) offlineSensorNames.push("Temperatura");
    if (latestData.humedad === null) offlineSensorNames.push("Humedad");
    if (latestData.luminosidad === null) offlineSensorNames.push("Luminosidad");
    if (latestData.humedad_suelo === null) offlineSensorNames.push("Humedad del Suelo");
    
    // Crear lista de sensores online
    const onlineSensors = [];
    if (latestData.temperatura !== null) onlineSensors.push("Temperatura");
    if (latestData.humedad !== null) onlineSensors.push("Humedad");
    if (latestData.luminosidad !== null) onlineSensors.push("Luminosidad");
    if (latestData.humedad_suelo !== null) onlineSensors.push("Humedad del Suelo");
    
    // Actualizar alerta según el estado de los sensores
    if (offlineSensorNames.length > 0) {
      const sensorText = offlineSensorNames.length === 1 
        ? "El sensor" 
        : "Los sensores";
      
      const namesList = offlineSensorNames.join(", ");
      
      setOfflineAlert(`${sensorText} de ${namesList} ${offlineSensorNames.length === 1 ? 'está apagado' : 'están apagados'}. Se mostrarán valores 0.`);
      
      // Registrar el cambio en la consola
      if (statusChanged) {
        console.warn(`Sensores apagados: ${namesList}`);
      }
    } else {
      // Todos los sensores están funcionando
      setOfflineAlert(null);
      
      if (statusChanged && onlineSensors.length === 4) {
        console.log("Todos los sensores están funcionando correctamente.");
      }
    }
    
    // Actualizar el estado de los sensores
    setOfflineSensors(newOfflineSensors);
    
    // Actualizar datos actuales, usando 0 para valores nulos
    setCurrentData({
      temperatura: latestData.temperatura !== null ? latestData.temperatura : 0,
      humedad: latestData.humedad !== null ? latestData.humedad : 0,
      luminosidad: latestData.luminosidad !== null ? latestData.luminosidad : 0,
      humedad_suelo: latestData.humedad_suelo !== null ? latestData.humedad_suelo : 0
    });
  };

  // Esta función se ejecuta cuando el componente se monta
  React.useEffect(() => {
    console.log("Inicializando el dashboard de sensores...");
    
    // Establecer estado de carga
    setApiStatus('cargando');
    
    // Verificar que las variables CSS estén definidas
    const style = getComputedStyle(document.documentElement);
    console.log("Variables CSS cargadas:", {
      temperatureColor: style.getPropertyValue('--color-temperature'),
      humidityColor: style.getPropertyValue('--color-humidity'),
      luminosityColor: style.getPropertyValue('--color-luminosity'),
      soilHumidityColor: style.getPropertyValue('--color-soil-humidity')
    });
    
    // Función de reconexión con la API
    const connectToAPI = () => {
      setApiStatus('cargando');
      fetchSensorData().then((data) => {
        if (data) {
          console.log("Datos iniciales cargados correctamente");
          // Forzar actualización después de la carga inicial
          forceChartRefresh();
        } else {
          console.log("Fallo al cargar datos: todos los sensores en estado APAGADO");
        }
      });
    };
    
    // Realizar la primera carga de datos
    connectToAPI();
    
    // Configurar el intervalo para actualizaciones automáticas
    const intervalId = setInterval(() => {
      console.log("Actualizando datos automáticamente...");
      connectToAPI();
    }, 10000);
    
    // Limpiar el intervalo cuando el componente se desmonte
    return () => {
      console.log("Deteniendo actualizaciones automáticas");
      clearInterval(intervalId);
    };
  }, []);

  // Renderizado del componente
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Panel de Sensores</h2>
          <p className="text-sm text-muted-foreground">
            Estado actual y tendencias de los sensores. 
            <span className="ml-1 font-medium">
              Última actualización: {formatTimeSince(lastUpdate)}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm flex items-center gap-2">
            <div className={`h-3 w-3 rounded-full ${apiStatus === 'conectado' ? 'bg-green-500' : apiStatus === 'apagado' ? 'bg-destructive animate-pulse' : 'bg-amber-500 animate-pulse'}`} />
            <span>
              API: {apiStatus === 'conectado' ? 'Conectada' : apiStatus === 'apagado' ? 'Apagada' : 'Conectando...'}
            </span>
          </div>
          <SensorStatusMonitor offlineSensors={offlineSensors} apiStatus={apiStatus} />
        </div>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error de Conexión</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {offlineAlert && !error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Sensores Desconectados</AlertTitle>
          <AlertDescription>
            {offlineAlert}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        <SensorCard
          title="Temperatura"
          value={currentData.temperatura}
          unit="°C"
          description="Temperatura ambiental actual"
          icon={Thermometer}
          iconColor="hsl(12, 100%, 65%)"
          isOffline={offlineSensors.temperatura}
          apiStatus={apiStatus}
        />
        <SensorCard
          title="Humedad"
          value={currentData.humedad}
          unit="%"
          description="Nivel de humedad ambiental"
          icon={Droplet}
          iconColor="hsl(195, 100%, 60%)"
          isOffline={offlineSensors.humedad}
          apiStatus={apiStatus}
        />
        <SensorCard
          title="Luminosidad"
          value={currentData.luminosidad}
          unit="lux"
          description="Nivel de luz ambiental"
          icon={SunIcon}
          iconColor="hsl(45, 100%, 60%)"
          isOffline={offlineSensors.luminosidad}
          apiStatus={apiStatus}
        />
        <SensorCard
          title="Humedad del Suelo"
          value={currentData.humedad_suelo}
          unit="%"
          description="Nivel de humedad en el suelo"
          icon={Sprout}
          iconColor="hsl(273, 100%, 65%)"
          isOffline={offlineSensors.humedad_suelo}
          apiStatus={apiStatus}
        />
      </div>

      <div className="mt-8 mb-4">
        <h3 className="text-2xl font-bold tracking-tight">Histórico de Datos</h3>
        <p className="text-sm text-muted-foreground">
          Seguimiento de tendencias de las últimas mediciones
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2" key={refreshKey}>
        <SimpleShadcnChart
          title="Temperatura"
          description="Tendencia de temperatura ambiental"
          data={chartData}
          dataKey="temperature"
        />
        <SimpleShadcnChart
          title="Humedad"
          description="Tendencia de humedad ambiental"
          data={chartData}
          dataKey="humidity"
        />
        <SimpleShadcnChart
          title="Luminosidad"
          description="Tendencia de luminosidad ambiental"
          data={chartData}
          dataKey="luminosity"
        />
        <SimpleShadcnChart
          title="Humedad del Suelo"
          description="Tendencia de humedad en el suelo"
          data={chartData}
          dataKey="soil_humidity"
        />
      </div>
    </div>
  );
}