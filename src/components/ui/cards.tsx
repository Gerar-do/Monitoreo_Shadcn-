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
  Sun,
  TrendingUp,
  TrendingDown 
} from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

// Sensor Card Component
function SensorCard({ 
  icon: Icon, 
  title, 
  value, 
  unit, 
  description,
  iconColor
}: { 
  icon: React.ElementType, 
  title: string, 
  value: number | string, 
  unit: string, 
  description: string,
  iconColor: string
}) {
  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader className="flex-row items-center space-x-4 pb-2">
        <div className="bg-primary/10 p-3 rounded-full">
          <Icon color={iconColor} size={24} strokeWidth={1.5} />
        </div>
        <div>
          <CardTitle className="text-lg">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-3xl font-bold text-primary">
            {value} <span className="text-xl font-normal text-muted-foreground">{unit}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Datos simulados para las gráficas
const generateChartData = (baseValue: number, variance: number) => {
  const months = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio"]
  return months.map(month => ({
    month,
    value: Number((baseValue + (Math.random() - 0.5) * variance).toFixed(1))
  }))
}

const temperatureData = generateChartData(23, 5)
const humidityData = generateChartData(45, 10)
const luminosityData = generateChartData(750, 200)

const chartConfigs = {
  temperature: {
    label: "Temperatura",
    color: "hsl(0, 100%, 50%)",
  },
  humidity: {
    label: "Humedad",
    color: "hsl(200, 100%, 50%)",
  },
  luminosity: {
    label: "Luminosidad",
    color: "hsl(50, 100%, 50%)",
  },
} satisfies ChartConfig

interface ChartData {
  month: string;
  value: number;
}

interface TrendData {
  value: number;
  up: boolean;
}

interface SensorChartProps {
  title: string;
  description: string;
  data: ChartData[];
  dataKey?: string;
  color: string;
  unit: string;
  trend?: TrendData;
}

function SensorChart({ 
  title, 
  description, 
  data, 
  dataKey = "value",
  color,
  unit,
  trend = { value: 5.2, up: true }
}: SensorChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfigs}>
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
            height={200}
          >
            <CartesianGrid vertical={false} stroke="rgba(161, 161, 170, 0.2)" />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey={dataKey}
              type="linear"
              stroke={color}
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="flex gap-2 font-medium leading-none">
          {trend.up ? "Subiendo" : "Bajando"} un {trend.value}% este mes{" "}
          {trend.up ? (
            <TrendingUp className="h-4 w-4" style={{ color }} />
          ) : (
            <TrendingDown className="h-4 w-4" style={{ color }} />
          )}
        </div>
        <div className="leading-none text-muted-foreground">
          Mostrando {title.toLowerCase()} de los últimos 6 meses ({unit})
        </div>
      </CardFooter>
    </Card>
  )
}

export default function SensorDashboard() {
  // Static sensor data (simulating real-world sensor readings)
  const sensorData = [
    {
      id: 1,
      icon: Thermometer,
      title: "Temperatura",
      value: 22.5,
      unit: "°C",
      description: "Temperatura actual",
      iconColor: "hsl(0, 100%, 50%)"
    },
    {
      id: 2,
      icon: Droplet,
      title: "Humedad",
      value: 45,
      unit: "%",
      description: "Humedad relativa",
      iconColor: "hsl(200, 100%, 50%)"
    },
    {
      id: 3,
      icon: Sun,
      title: "Luminosidad",
      value: 750,
      unit: "lx",
      description: "Nivel de luz",
      iconColor: "hsl(50, 100%, 50%)"
    }
  ]

  return (
    <div className="p-6 space-y-6">

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {sensorData.map(sensor => (
          <SensorCard
            key={sensor.id}
            icon={sensor.icon}
            title={sensor.title}
            value={sensor.value}
            unit={sensor.unit}
            description={sensor.description}
            iconColor={sensor.iconColor}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
        <SensorChart
          title="Temperatura"
          description="Historial de temperatura"
          data={temperatureData}
          color="hsl(0, 100%, 50%)"
          unit="°C"
          trend={{ value: 3.2, up: true }}
        />
        <SensorChart
          title="Humedad"
          description="Historial de humedad"
          data={humidityData}
          color="hsl(200, 100%, 50%)"
          unit="%"
          trend={{ value: 2.8, up: false }}
        />
        <SensorChart
          title="Luminosidad"
          description="Historial de luminosidad"
          data={luminosityData}
          color="hsl(50, 100%, 50%)"
          unit="lx"
          trend={{ value: 4.5, up: true }}
        />
      </div>
    </div>
  )
}