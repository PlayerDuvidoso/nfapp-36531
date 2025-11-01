import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { env } from "@/lib/env";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock } from "lucide-react";

interface HealthCheck {
  name: string;
  status: "healthy" | "unhealthy" | "checking";
  message?: string;
  timestamp: Date;
}

export default function Health() {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: "Application", status: "checking", timestamp: new Date() },
    { name: "Supabase Connection", status: "checking", timestamp: new Date() },
  ]);

  useEffect(() => {
    performHealthChecks();
  }, []);

  const performHealthChecks = async () => {
    // Check 1: Application is rendering
    setChecks((prev) =>
      prev.map((check) =>
        check.name === "Application"
          ? { ...check, status: "healthy", message: "React app rendered successfully", timestamp: new Date() }
          : check
      )
    );

    // Check 2: Supabase connection (read-only query)
    try {
      const { error } = await supabase.from("shops").select("id").limit(1);
      
      setChecks((prev) =>
        prev.map((check) =>
          check.name === "Supabase Connection"
            ? {
                ...check,
                status: error ? "unhealthy" : "healthy",
                message: error ? `Connection failed: ${error.message}` : "Connected successfully",
                timestamp: new Date(),
              }
            : check
        )
      );
    } catch (error) {
      setChecks((prev) =>
        prev.map((check) =>
          check.name === "Supabase Connection"
            ? {
                ...check,
                status: "unhealthy",
                message: `Unexpected error: ${error instanceof Error ? error.message : "Unknown error"}`,
                timestamp: new Date(),
              }
            : check
        )
      );
    }
  };

  const allHealthy = checks.every((check) => check.status === "healthy");
  const overallStatus = allHealthy ? "healthy" : "unhealthy";

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold">Sistema Nota Fiscal - Health Check</h1>
          <p className="text-muted-foreground">
            Real-time status of application components
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Overall Status</CardTitle>
              <Badge variant={overallStatus === "healthy" ? "default" : "destructive"}>
                {overallStatus.toUpperCase()}
              </Badge>
            </div>
            <CardDescription>
              Last checked: {new Date().toLocaleString()}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {checks.map((check) => (
              <div
                key={check.name}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {check.status === "healthy" && (
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  )}
                  {check.status === "unhealthy" && (
                    <XCircle className="w-5 h-5 text-destructive" />
                  )}
                  {check.status === "checking" && (
                    <Clock className="w-5 h-5 text-muted-foreground animate-spin" />
                  )}
                  <div>
                    <p className="font-medium">{check.name}</p>
                    {check.message && (
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    )}
                  </div>
                </div>
                <Badge variant={check.status === "healthy" ? "outline" : "secondary"}>
                  {check.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Application Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 font-mono text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Version:</span>
              <span>{env.VITE_APP_VERSION}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Environment:</span>
              <span className="uppercase">{env.VITE_APP_ENV}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Supabase Project:</span>
              <span>{env.VITE_SUPABASE_PROJECT_ID}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
